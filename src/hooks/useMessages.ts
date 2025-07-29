import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Message } from '../types';

export const useMessages = (roomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    // do not fetch if no room is selected
    if (!roomId) return;

    setIsLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Authentication error.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/${roomId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error('Failed to fetch messages.');
      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    // fetch messages whenever the selected room ID changes
    fetchMessages();
  }, [fetchMessages]);

  return { messages, isLoading, setMessages };
};
