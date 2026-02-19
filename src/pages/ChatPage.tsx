import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import { useRooms, type Room } from '../hooks/useRooms';
import { useMessages } from '../hooks/useMessages';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  roomId?: string;
  author: {
    id: string;
    username: string;
  };
}

interface RoomUser {
  id: string;
  username: string;
}

interface TypingPayload {
  roomId: string;
  userId: string;
  username: string;
}

interface RoomOnlineUsersPayload {
  roomId: string;
  users: RoomUser[];
}

interface RoomsExpiredPayload {
  roomIds: string[];
}

interface SocketErrorPayload {
  code: string;
  message: string;
}

const formatExpiryCountdown = (expiresAt?: string | null, nowMs = Date.now()) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - nowMs;
  if (diff <= 0) return 'Expired';

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m left`;
  return `${hours}h ${minutes}m left`;
};

const ChatPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const {
    rooms,
    isLoading: areRoomsLoading,
    createRoom,
    joinRoomByCode,
    updateRoomPrivacy,
    removeRoomsById,
    removeExpiredRooms,
  } = useRooms(socket);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<RoomUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<RoomUser[]>([]);
  const [nowMs, setNowMs] = useState(Date.now());
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [areRepliesLoading, setAreRepliesLoading] = useState(false);
  const {
    messages,
    isLoading: areMessagesLoading,
    setMessages,
  } = useMessages(selectedRoom?.id || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const smartRepliesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedRoomIsExpired = useMemo(() => {
    if (!selectedRoom?.expiresAt) return false;
    return new Date(selectedRoom.expiresAt).getTime() <= nowMs;
  }, [selectedRoom, nowMs]);

  const isSelectedRoomCreator = useMemo(() => {
    if (!selectedRoom || !user) return false;
    return selectedRoom.createdById === user.id;
  }, [selectedRoom, user]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const newSocket = io(
      import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001',
      {
        auth: { token },
      },
    );
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (!message.roomId) return;
      const roomId = message.roomId;
      const isCurrentRoom = roomId === selectedRoom?.id;
      if (!isCurrentRoom && message.author.id !== user?.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1,
        }));
      }

      setMessages((prevMessages) => {
        if (prevMessages.find((msg) => msg.id === message.id)) {
          return prevMessages;
        }
        if (isCurrentRoom) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
    };

    const handleMessageUpdated = (updatedMessage: Message) => {
      if (updatedMessage.roomId !== selectedRoom?.id) return;
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg)),
      );
    };

    const handleMessageDeleted = (payload: { id: string; roomId: string }) => {
      if (payload.roomId !== selectedRoom?.id) return;
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== payload.id));
      if (editingMessageId === payload.id) {
        setEditingMessageId(null);
        setEditingContent('');
      }
    };

    const handleTypingStart = (payload: TypingPayload) => {
      if (payload.roomId !== selectedRoom?.id || payload.userId === user?.id) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.id === payload.userId)) return prev;
        return [...prev, { id: payload.userId, username: payload.username }];
      });
    };

    const handleTypingStop = (payload: TypingPayload) => {
      if (payload.roomId !== selectedRoom?.id) return;
      setTypingUsers((prev) => prev.filter((u) => u.id !== payload.userId));
    };

    const handleOnlineUsers = (payload: RoomOnlineUsersPayload) => {
      if (payload.roomId !== selectedRoom?.id) return;
      setOnlineUsers(payload.users);
    };

    const handleRoomsExpired = (payload: RoomsExpiredPayload) => {
      removeRoomsById(payload.roomIds);
      if (selectedRoom && payload.roomIds.includes(selectedRoom.id)) {
        setSelectedRoom(null);
        setMessages([]);
        setTypingUsers([]);
        setOnlineUsers([]);
        toast.error('This room has expired.');
      }
    };

    const handleSocketError = (payload: SocketErrorPayload) => {
      if (payload?.code === 'FORBIDDEN') {
        if (selectedRoom) {
          setSelectedRoom(null);
          setMessages([]);
          setTypingUsers([]);
          setOnlineUsers([]);
        }
      }
      toast.error(payload?.message || 'Socket error');
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageUpdated', handleMessageUpdated);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('typingStart', handleTypingStart);
    socket.on('typingStop', handleTypingStop);
    socket.on('roomOnlineUsers', handleOnlineUsers);
    socket.on('roomsExpired', handleRoomsExpired);
    socket.on('error', handleSocketError);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('typingStart', handleTypingStart);
      socket.off('typingStop', handleTypingStop);
      socket.off('roomOnlineUsers', handleOnlineUsers);
      socket.off('roomsExpired', handleRoomsExpired);
      socket.off('error', handleSocketError);
    };
  }, [socket, selectedRoom, removeRoomsById, setMessages, user?.id, editingMessageId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('joinRoom', selectedRoom.id);
    }
    return () => {
      if (socket && selectedRoom) {
        socket.emit('leaveRoom', selectedRoom.id);
      }
    };
  }, [socket, selectedRoom]);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
      removeExpiredRooms();
    }, 30000);

    return () => clearInterval(timer);
  }, [removeExpiredRooms]);

  useEffect(() => {
    if (!selectedRoomIsExpired || !selectedRoom) return;
    setSelectedRoom(null);
    setMessages([]);
    setTypingUsers([]);
    setOnlineUsers([]);
    toast.error('Selected room expired.');
  }, [selectedRoomIsExpired, selectedRoom, setMessages]);

  useEffect(() => {
    setTypingUsers([]);
    setOnlineUsers([]);
    setAiSummary(null);
    setSmartReplies([]);
    setEditingMessageId(null);
    setEditingContent('');
  }, [selectedRoom?.id]);

  useEffect(() => {
    if (!selectedRoom) return;
    const refreshedSelected = rooms.find((room) => room.id === selectedRoom.id) ?? null;
    if (!refreshedSelected) {
      setSelectedRoom(null);
      return;
    }
    if (refreshedSelected !== selectedRoom) {
      setSelectedRoom(refreshedSelected);
    }
  }, [rooms, selectedRoom]);

  const emitTypingStop = () => {
    if (!socket || !selectedRoom || !isTypingRef.current) return;
    socket.emit('typingStop', { roomId: selectedRoom.id });
    isTypingRef.current = false;
  };

  const handleMessageInputChange = (value: string) => {
    setNewMessage(value);

    if (!socket || !selectedRoom) return;

    if (!isTypingRef.current && value.trim()) {
      socket.emit('typingStart', { roomId: selectedRoom.id });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 1200);

    if (!value.trim()) {
      emitTypingStop();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoomIsExpired) {
      toast.error('Cannot send messages. Room expired.');
      return;
    }

    if (socket && newMessage.trim() && user && selectedRoom) {
      socket.emit('sendMessage', {
        content: newMessage,
        roomId: selectedRoom.id,
      });
      emitTypingStop();
      setNewMessage('');
    }
  };

  const fetchAiSummary = async () => {
    if (!selectedRoom) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setIsSummaryLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/${selectedRoom.id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to generate summary.');
      }

      const data = (await response.json()) as { summary: string };
      setAiSummary(data.summary);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const fetchSmartReplies = async (draft?: string) => {
    if (!selectedRoom) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setAreRepliesLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/${selectedRoom.id}/smart-replies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ draft }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to generate smart replies.');
      }

      const data = (await response.json()) as { suggestions: string[] };
      setSmartReplies(data.suggestions || []);
    } catch {
      setSmartReplies([]);
    } finally {
      setAreRepliesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedRoom || messages.length === 0) return;
    fetchSmartReplies(newMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.id, messages.length]);

  useEffect(() => {
    if (!selectedRoom) return;
    if (smartRepliesTimeoutRef.current) {
      clearTimeout(smartRepliesTimeoutRef.current);
    }

    smartRepliesTimeoutRef.current = setTimeout(() => {
      fetchSmartReplies(newMessage);
    }, 700);

    return () => {
      if (smartRepliesTimeoutRef.current) {
        clearTimeout(smartRepliesTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage, selectedRoom?.id]);

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId) || null;
    if (!room) return;

    if (room.expiresAt && new Date(room.expiresAt).getTime() <= Date.now()) {
      toast.error('Room expired.');
      removeRoomsById([room.id]);
      if (selectedRoom?.id === room.id) {
        setSelectedRoom(null);
      }
      return;
    }

    setSelectedRoom(room);
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
    setIsSidebarOpen(false);
  };

  const handleStartEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleSaveEditMessage = async (messageId: string) => {
    if (!selectedRoom) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/${selectedRoom.id}/messages/${messageId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editingContent }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to edit message.');
      }

      const updated = (await response.json()) as Message;
      setMessages((prev) => prev.map((msg) => (msg.id === updated.id ? updated : msg)));
      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Message updated');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedRoom) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/rooms/${selectedRoom.id}/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete message.');
      }

      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setEditingContent('');
      }
      toast.success('Message deleted');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleJoinByCode = async () => {
    const inviteCode = window.prompt('Enter room invite code');
    if (!inviteCode) return;

    try {
      const joinedRoom = await joinRoomByCode(inviteCode);
      if (joinedRoom) {
        setSelectedRoom(joinedRoom);
        toast.success(`Joined #${joinedRoom.name}`);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleCreateRoom = async (
    name: string,
    description?: string,
    isPrivate?: boolean,
    expiresInHours?: number,
  ) => {
    const createdRoom = await createRoom(name, description, isPrivate, expiresInHours);
    if (createdRoom && createdRoom.isPrivate && createdRoom.inviteCode) {
      toast.success(`Invite code: ${createdRoom.inviteCode}`);
    }
    if (createdRoom) {
      setSelectedRoom(createdRoom);
    }
    return createdRoom;
  };

  const handleToggleRoomPrivacy = async () => {
    if (!selectedRoom) return;

    try {
      const updatedRoom = await updateRoomPrivacy(selectedRoom.id, !selectedRoom.isPrivate);
      if (updatedRoom) {
        setSelectedRoom(updatedRoom);
        toast.success(
          updatedRoom.isPrivate
            ? `Room is private. Invite code: ${updatedRoom.inviteCode ?? 'hidden'}`
            : 'Room is now public.',
        );
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (isAuthLoading || areRoomsLoading) {
    return (
      <div className="app-shell flex h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-xl px-7 py-6 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
          <p className="mt-3 text-zinc-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="app-shell flex h-screen overflow-hidden p-3 sm:p-4">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-zinc-900/25 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          role={isSidebarOpen ? 'dialog' : undefined}
          aria-modal={isSidebarOpen ? 'true' : undefined}
          aria-label="Rooms panel"
          className={`glass-panel fixed inset-y-3 left-3 z-50 w-80 transform rounded-xl transition-transform duration-300 lg:relative lg:inset-auto lg:mr-4 lg:translate-x-0 lg:w-72 xl:w-80 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%]'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-zinc-300 p-4 lg:justify-center">
              <h2 className="brand-title text-3xl text-zinc-900">Rooms</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="ghost-button rounded-md p-2 lg:hidden"
                aria-label="Close rooms panel"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {rooms.length === 0 ? (
                <div className="rounded-lg border border-zinc-300 bg-zinc-50 p-5 text-center">
                  <p className="text-sm font-medium text-zinc-800">No rooms available.</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Create your first room to get started.
                  </p>
                </div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomSelect(room.id)}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      selectedRoom?.id === room.id
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-bold text-zinc-600">
                        {room.isPrivate ? 'P' : '#'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold leading-6">{room.name}</h3>
                        {room.description && (
                          <p className="truncate text-xs text-zinc-500">
                            {room.description}
                          </p>
                        )}
                        {room.expiresAt && (
                          <p className="truncate text-xs text-orange-600">
                            {formatExpiryCountdown(room.expiresAt, nowMs)}
                          </p>
                        )}
                      </div>
                      {(unreadCounts[room.id] || 0) > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          {unreadCounts[room.id]}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-zinc-300 p-3 space-y-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="accent-button w-full rounded-md px-4 py-3 text-sm font-semibold"
              >
                Create Room
              </button>
              <button
                onClick={handleJoinByCode}
                className="ghost-button w-full rounded-md px-4 py-3 text-sm font-semibold"
              >
                Join By Invite Code
              </button>
            </div>
          </div>
        </aside>

        <div className="glass-panel relative flex min-w-0 flex-1 flex-col rounded-xl">
          {selectedRoom ? (
            <>
              <header className="flex items-center justify-between border-b border-zinc-300 px-4 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="ghost-button rounded-md p-2 lg:hidden"
                    aria-label="Open rooms panel"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                  <div className="min-w-0">
                    <h1 className="brand-title truncate text-3xl text-zinc-900">
                      {selectedRoom.isPrivate ? 'P ' : '# '}
                      {selectedRoom.name}
                    </h1>
                    <p className="truncate text-xs text-zinc-500 sm:text-sm">
                      {onlineUsers.length} online
                      {selectedRoom.expiresAt
                        ? ` • ${formatExpiryCountdown(selectedRoom.expiresAt, nowMs)}`
                        : ''}
                    </p>
                    {isSelectedRoomCreator && selectedRoom.isPrivate && selectedRoom.inviteCode && (
                      <p className="truncate text-xs text-emerald-700 sm:text-sm">
                        Invite code: {selectedRoom.inviteCode}
                      </p>
                    )}
                    {selectedRoom.description && (
                      <p className="truncate text-xs text-zinc-500 sm:text-sm">
                        {selectedRoom.description}
                      </p>
                    )}
                    {typingUsers.length > 0 && (
                      <p className="truncate text-xs text-blue-600 sm:text-sm">
                        {typingUsers.map((u) => u.username).join(', ')} typing...
                      </p>
                    )}
                    {isSelectedRoomCreator && (
                      <button
                        onClick={handleToggleRoomPrivacy}
                        className="mt-1 inline-flex rounded-md border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                      >
                        Make {selectedRoom.isPrivate ? 'Public' : 'Private'}
                      </button>
                    )}
                    <button
                      onClick={fetchAiSummary}
                      disabled={isSummaryLoading}
                      className="mt-1 ml-2 inline-flex rounded-md border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSummaryLoading ? 'Summarizing...' : 'AI Summary'}
                    </button>
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mx-auto flex max-w-4xl flex-col gap-4">
                  {aiSummary && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  )}
                  {areMessagesLoading ? (
                    <div className="flex items-center justify-center py-8 text-zinc-500">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="mx-auto mt-8 rounded-xl border border-zinc-300 bg-zinc-50 px-8 py-10 text-center">
                      <h3 className="brand-title text-3xl text-zinc-900">No messages yet</h3>
                      <p className="mt-2 text-zinc-600">
                        Be the first to send a message in #{selectedRoom.name}.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${
                          msg.author.id === user?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-bold text-zinc-700 sm:h-10 sm:w-10 sm:text-sm">
                          {msg.author.username.charAt(0).toUpperCase()}
                        </div>

                        <div
                          className={`flex max-w-xs flex-col sm:max-w-md lg:max-w-lg ${
                            msg.author.id === user?.id ? 'items-end' : 'items-start'
                          }`}
                        >
                          <p className="mb-1 text-xs text-zinc-500 sm:text-sm">
                            {msg.author.username}
                          </p>
                          <div
                            className={`rounded-xl border px-4 py-2.5 ${
                              msg.author.id === user?.id
                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                : 'border-zinc-300 bg-white text-zinc-900'
                            }`}
                          >
                            {editingMessageId === msg.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditMessage(msg.id)}
                                    className="rounded-md bg-zinc-900 px-2 py-1 text-xs text-white"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEditMessage}
                                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="break-words text-sm sm:text-base">{msg.content}</p>
                            )}
                            {msg.updatedAt !== msg.createdAt && editingMessageId !== msg.id && (
                              <p className="mt-1 text-[10px] opacity-70">(edited)</p>
                            )}
                          </div>
                          {msg.author.id === user?.id && editingMessageId !== msg.id && (
                            <div className="mt-1 flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditMessage(msg)}
                                className="text-xs text-zinc-500 hover:text-zinc-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </main>

              <footer className="border-t border-zinc-300 p-4 sm:px-6">
                {smartReplies.length > 0 && (
                  <div className="mx-auto mb-2 flex max-w-4xl flex-wrap gap-2">
                    {smartReplies.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleMessageInputChange(suggestion)}
                        className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                {areRepliesLoading && (
                  <div className="mx-auto mb-2 max-w-4xl text-xs text-zinc-500">Generating smart replies...</div>
                )}
                <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl gap-2 sm:gap-3">
                  <label htmlFor="chat-message" className="sr-only">
                    Message
                  </label>
                  <input
                    id="chat-message"
                    name="message"
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleMessageInputChange(e.target.value)}
                    placeholder={`Message #${selectedRoom.name}`}
                    autoComplete="off"
                    className="text-input flex-1 rounded-md px-4 py-3"
                    disabled={selectedRoomIsExpired}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || selectedRoomIsExpired}
                    aria-label="Send message"
                    className="accent-button rounded-md px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                  >
                    <span className="hidden sm:inline">Send</span>
                    <svg
                      className="h-5 w-5 sm:hidden"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="max-w-xl rounded-xl border border-zinc-300 bg-zinc-50 px-8 py-10 text-center">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="ghost-button mb-6 rounded-md p-2 lg:hidden"
                  aria-label="Open rooms panel"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <h2 className="brand-title text-4xl text-zinc-900">Welcome to SyncTalk</h2>
                <p className="mt-2 text-zinc-600">
                  Select an existing room or create one to begin chatting.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="ghost-button rounded-md px-5 py-3 font-semibold lg:hidden"
                    aria-label="Open rooms panel"
                  >
                    Browse Rooms
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="accent-button rounded-md px-5 py-3"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={handleJoinByCode}
                    className="ghost-button rounded-md px-5 py-3 font-semibold"
                  >
                    Join By Invite Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </>
  );
};

export default ChatPage;
