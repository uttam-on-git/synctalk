import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import { useRooms, type Room } from '../hooks/useRooms';
import RoomList from '../components/chat/RoomList';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

const ChatPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { rooms, isLoading: areRoomsLoading, createRoom } = useRooms();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  //set the default room once room loaded
  useEffect(() => {
    if (!areRoomsLoading && rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, areRoomsLoading, selectedRoom]);

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

  // runs whenever the socket connection is established

  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, [socket]);

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

  if (isAuthLoading || areRoomsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <p className="text-white">Loading chat...</p>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col items-center justify-center ">
      <header>
        <h1 className="text-xl font-bold">#general</h1>
      </header>

      <aside>
        <RoomList 
        rooms={rooms}
        selectedRoomId={selectedRoom?.id || null}
        onSelectRoom={(roomId) => {
          setSelectedRoom(rooms.find(room => room.id === roomId) || null)
        }}
        onCreateRoom={() => setIsModalOpen(true)}
        />
      </aside>

      <div>
        {selectedRoom ? (
          <>
            <header>
                <h1 className="text-xl font-bold">#general</h1>
            </header>
            <main>
        <div>
          {messages.map((msg) => (
            <div key={msg.id}>
              <div>{msg.author.username.charAt(0).toUpperCase()}</div>
              <div>
                <p>{msg.author.username}</p>
                <div>
                  <p>{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer>
        <form onSubmit={handleSendMessage}>
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </footer>
          </>
        ) : (
             <div>
              <p>Select a room or create a new one to start chatting.</p>
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
