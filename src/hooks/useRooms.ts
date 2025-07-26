import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export interface Room {
  id: string;
  name: string;
  description: string | null;
}

export const useRooms = () => {
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

    // after creating a new room, refetch the list to update the UI
    fetchRooms();
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  return { rooms, isLoading, createRoom, refetchRooms: fetchRooms };
};
