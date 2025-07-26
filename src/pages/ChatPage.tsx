import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
  const { user, isLoading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

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

    if(socket && newMessage.trim() && user) {
      socket.emit('sendMessage', {
        content: newMessage,
        authorId: user.id,
        roomId: 'cmdkcfplx0000gkwoaulf0kql',
      });
      setNewMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <p className="text-white">Loading user...</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center '>
      <header>
        <h1 className="text-xl font-bold">#general</h1>
      </header>

      <main>
        <div>
          { messages.map((msg) => (
            <div key={msg.id}>
              <div>
                {msg.author.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p>{msg.author.username}</p>
                <div>
                  <p>{msg.content}</p>
                </div>
              </div>
            </div>
          )
          )}
        </div>
      </main>

      <footer>
        <form onSubmit={handleSendMessage}>
          <Input 
          type='text'
          placeholder='Type a message...'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </footer>
    </div>
  )
};

export default ChatPage;
