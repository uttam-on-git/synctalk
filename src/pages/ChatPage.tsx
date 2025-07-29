import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import { useRooms, type Room } from '../hooks/useRooms';
import { useMessages } from '../hooks/useMessages';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  roomId: string;
  author: {
    id: string;
    username: string;
  };
}

const ChatPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { rooms, isLoading: areRoomsLoading, createRoom } = useRooms(socket);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const {
    messages,
    isLoading: areMessagesLoading,
    setMessages,
  } = useMessages(selectedRoom?.id || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001',
    );
    setSocket(newSocket);
    // cleanup func when component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (message: Message) => {
      if (message.roomId === selectedRoom?.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedRoom?.id, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  //effect to join and leave room
  useEffect(() => {
    if (socket && selectedRoom) {
      socket.emit('joinRoom', selectedRoom.id);
    }
    // When the selected room changes, leave the previous one
    return () => {
      if (socket && selectedRoom) {
        socket.emit('leaveRoom', selectedRoom.id);
      }
    };
  }, [socket, selectedRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (socket && newMessage.trim() && user && selectedRoom) {
      socket.emit('sendMessage', {
        content: newMessage,
        authorId: user.id,
        roomId: selectedRoom.id,
      });
      setNewMessage('');
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(rooms.find((r) => r.id === roomId) || null);
    setIsSidebarOpen(false); 
  };

  if (isAuthLoading || areRoomsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-600 border-t-white"></div>
          <p className="text-white">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-zinc-900 text-white">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-80 transform bg-zinc-800 border-r border-zinc-700 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:w-64 xl:w-80
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        >
          <div className="flex h-full flex-col">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-zinc-700 p-4 lg:justify-center">
              <h2 className="text-xl font-bold">Rooms</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-md p-2 cursor-pointer hover:bg-zinc-700 lg:hidden"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 rounded-full bg-zinc-700 p-4">
                    <svg
                      className="h-8 w-8 text-zinc-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-400">No rooms available</p>
                  <p className="text-xs text-zinc-500">
                    Create your first room to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className={`group w-full cursor-pointer rounded-lg p-3 text-left transition-all duration-200 ${
                        selectedRoom?.id === room.id
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                            selectedRoom?.id === room.id
                              ? 'bg-white/20'
                              : 'bg-zinc-600 group-hover:bg-zinc-500'
                          }`}
                        >
                          <span className="text-sm font-bold">#</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-sm">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p
                              className={`truncate text-xs ${
                                selectedRoom?.id === room.id
                                  ? 'text-white/80'
                                  : 'text-zinc-500 group-hover:text-zinc-400'
                              }`}
                            >
                              {room.description}
                            </p>
                          )}
                        </div>

                        {selectedRoom?.id === room.id && (
                          <div className="h-2 w-2 rounded-full bg-white flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-zinc-700 p-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group w-full rounded-lg border-1 cursor-pointer border-dashed border-zinc-600 p-3 text-zinc-400 transition-all duration-200 hover:border-cyan-500 hover:bg-violet-500/10 hover:text-white"
              >
                <div className="flex items-center justify-center space-x-2">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-semibold text-sm">Create Room</span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col min-w-0">
          {selectedRoom ? (
            <>
              <header className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800 p-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="rounded-md p-2 cursor-pointer hover:bg-zinc-700 lg:hidden"
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
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold">
                      # {selectedRoom.name}
                    </h1>
                    {selectedRoom.description && (
                      <p className="truncate text-sm text-zinc-400">
                        {selectedRoom.description}
                      </p>
                    )}
                  </div>
                </div>

                <button className="rounded-md p-2 cursor-pointer hover:bg-zinc-700 sm:hidden">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </header>

              <main className="flex-1 overflow-y-auto bg-zinc-900 p-4">
                <div className="mx-auto max-w-4xl space-y-4">
                  {areMessagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2 text-zinc-400">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white"></div>
                        <span>Loading messages...</span>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 rounded-full bg-zinc-800 p-6">
                        <svg
                          className="h-12 w-12 text-zinc-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-zinc-300">
                        No messages yet
                      </h3>
                      <p className="text-zinc-500">
                        Be the first to send a message in #{selectedRoom.name}
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
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white sm:h-10 sm:w-10">
                          {msg.author.username.charAt(0).toUpperCase()}
                        </div>

                        <div
                          className={`flex flex-col min-w-0 max-w-xs sm:max-w-md lg:max-w-lg ${
                            msg.author.id === user?.id
                              ? 'items-end'
                              : 'items-start'
                          }`}
                        >
                          <p className="mb-1 text-xs text-zinc-400 sm:text-sm">
                            {msg.author.username}
                          </p>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              msg.author.id === user?.id
                                ? 'bg-cyan-600 text-white'
                                : 'bg-zinc-700 text-zinc-100'
                            }`}
                          >
                            <p className="break-words text-sm sm:text-base">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </main>

              <footer className="border-t border-zinc-700 bg-zinc-800 p-4">
                <div className="mx-auto max-w-4xl">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex gap-2 sm:gap-3"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message #${selectedRoom.name}`}
                      className="flex-1 rounded-xl border-zinc-600 bg-zinc-700 px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="rounded-xl bg-cyan-600 px-4 cursor-pointer py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
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
                </div>
              </footer>
            </>
          ) : (
            <div className="flex items-center justify-center p-8 lg:p-24">
              <div className="text-center">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mb-6 rounded-md flex cursor-pointer justify-start p-2 hover:bg-zinc-700 lg:hidden md:justify-center"
                >
                  <svg
                    className="h-8 w-8"
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

                <div className="mb-6 rounded-full bg-zinc-800 p-8 mx-auto w-fit">
                  <svg
                    className="h-16 w-16 text-zinc-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>

                <h2 className="mb-2 text-xl font-semibold text-zinc-300">
                  Welcome to Chat
                </h2>
                <p className="mb-6 text-zinc-500">
                  Select a room from the sidebar or create a new one to start
                  chatting.
                </p>

                <div className="flex flex-col gap-6 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="rounded-lg bg-zinc-700 cursor-pointer px-6 py-3 font-semibold transition hover:bg-zinc-600 lg:hidden"
                  >
                    Browse Rooms
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-lg bg-cyan-600 cursor-pointer px-6 py-3 font-semibold transition hover:bg-cyan-700"
                  >
                    Create New Room
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
        onCreate={createRoom}
      />
    </>
  );
};

export default ChatPage;
