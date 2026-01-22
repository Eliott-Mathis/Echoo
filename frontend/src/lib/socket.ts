import { io, Socket } from 'socket.io-client';
import { NotificationAPI } from './notification';

export interface SocketNotification {
  type: 'success' | 'error';
  message: string;
}

export type DirectMessagePayload = {
  id: string;
  conversationId: string;
  content: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

export type DmOpenResponse = {
  conversationId: string;
  recipient: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  messages: DirectMessagePayload[];
};

const socket: Socket = io('http://localhost:3000', {
  withCredentials: true,
});

socket.on('notification', (data: SocketNotification) => {
  NotificationAPI.emit(data.message);

  setTimeout(() => {
    NotificationAPI.clear();
  }, 3000);
});

export default socket;
