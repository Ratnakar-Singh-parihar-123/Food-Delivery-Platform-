// src/services/socket.js
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://myfoodmitra-ecosystem.onrender.com';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  // ✅ Pass token via auth
  auth: async cb => {
    try {
      const token = await AsyncStorage.getItem('token');
      cb({ token });
    } catch (error) {
      console.error('Error getting token:', error);
      cb({ token: null });
    }
  },
});

socket.on('connect', () => console.log('✅ Socket connected'));
socket.on('disconnect', reason =>
  console.log('❌ Socket disconnected:', reason),
);
socket.on('connect_error', error =>
  console.error('❌ Socket connection error:', error),
);
