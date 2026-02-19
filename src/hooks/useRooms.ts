import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Socket } from 'socket.io-client';

export interface Room {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  inviteCode: string | null;
  createdById: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export const useRooms = (socket: Socket | null) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch rooms.');
      }
      const data: Room[] = await response.json();
      setRooms(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRoom = async (
    name: string,
    description?: string,
    isPrivate?: boolean,
    expiresInHours?: number,
  ) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, isPrivate, expiresInHours }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create room.');
    }

    const newRoom: Room = await response.json();
    setRooms((prevRooms) => {
      if (prevRooms.some((room) => room.id === newRoom.id)) {
        return prevRooms;
      }
      return [...prevRooms, newRoom];
    });

    return newRoom;
  };

  const joinRoomByCode = async (inviteCode: string) => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/join`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to join room.');
    }

    const joinedRoom: Room = await response.json();
    setRooms((prevRooms) => {
      if (prevRooms.some((room) => room.id === joinedRoom.id)) {
        return prevRooms;
      }
      return [...prevRooms, joinedRoom];
    });

    return joinedRoom;
  };

  const updateRoomPrivacy = async (roomId: string, isPrivate: boolean) => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/${roomId}/privacy`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPrivate }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update room privacy.');
    }

    const updatedRoom: Room = await response.json();
    setRooms((prevRooms) =>
      prevRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
    );

    return updatedRoom;
  };

  const removeRoomsById = useCallback((roomIds: string[]) => {
    setRooms((prevRooms) => prevRooms.filter((room) => !roomIds.includes(room.id)));
  }, []);

  const removeExpiredRooms = useCallback(() => {
    const now = new Date();
    setRooms((prevRooms) =>
      prevRooms.filter(
        (room) => !room.expiresAt || new Date(room.expiresAt).getTime() > now.getTime(),
      ),
    );
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!socket) return;

    // listen for the 'newRoom' event
    socket.on('newRoom', (newRoom: Room) => {
      // Add the new room to our state in real-time
      setRooms((prevRooms) => {
        if (prevRooms.some((room) => room.id === newRoom.id)) {
          return prevRooms;
        }
        return [...prevRooms, newRoom];
      });
      toast.success(`New room created: #${newRoom.name}`);
    });

    socket.on('roomUpdated', (updatedRoom: Room) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room)),
      );
    });

    // clean up the event listener when the component unmounts
    return () => {
      socket.off('newRoom');
      socket.off('roomUpdated');
    };
  }, [socket]);

  return {
    rooms,
    isLoading,
    createRoom,
    joinRoomByCode,
    updateRoomPrivacy,
    removeRoomsById,
    removeExpiredRooms,
  };
};
