import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const newSocket = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
        {
          auth: { token: accessToken },
          transports: ['websocket'],
        }
      );

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [isAuthenticated, accessToken]);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);