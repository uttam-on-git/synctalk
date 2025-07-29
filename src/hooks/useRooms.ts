import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Socket } from 'socket.io-client';

export interface Room {
  id: string;
  name: string;
  description: string | null;
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

  const createRoom = async (name: string, description?: string) => {
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
        body: JSON.stringify({ name, description }),
      },
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create room.');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (!socket) return;

    // listen for the 'newRoom' event
    socket.on('newRoom', (newRoom: Room) => {
      // Add the new room to our state in real-time
      setRooms((prevRooms) => [...prevRooms, newRoom]);
      toast.success(`New room created: #${newRoom.name}`);
    });

    // clean up the event listener when the component unmounts
    return () => {
      socket.off('newRoom');
    };
  }, [socket]);

  return { rooms, isLoading, createRoom };
};
