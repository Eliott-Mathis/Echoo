import { Gift, ImagePlay, SmilePlus, Sticker } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DirectMessageComposer from '../../components/messages/DirectMessageComposer';
import DirectMessageHeader from '../../components/messages/DirectMessageHeader';
import DirectMessageList from '../../components/messages/DirectMessageList';
import type { DirectMessage } from '../../types/messages';
import socket, { type DirectMessagePayload, type DmOpenResponse } from '../../lib/socket';
import { NotificationAPI } from '../../lib/notification';
import { authClient } from '../../lib/authClient';
import CallBanner from '@/components/messages/CallBanner';

type DirectMessageRouteParams = {
  username?: string;
};

export default function DirectMessageTab() {
  const { username } = useParams<DirectMessageRouteParams>();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id ?? null;
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const icons = {
    gift: Gift,
    image: ImagePlay,
    sticker: Sticker,
    smile: SmilePlus,
  };

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  );

  const toDirectMessage = useCallback(
    (payload: DirectMessagePayload): DirectMessage => {
      const displayName = payload.author.displayName || payload.author.username;
      const avatarName = encodeURIComponent(displayName);
      return {
        id: payload.id,
        author: displayName,
        avatarUrl: payload.author.avatarUrl ?? `https://ui-avatars.com/api/?name=${avatarName}&background=random&size=128`,
        content: payload.content ?? '',
        timestamp: timeFormatter.format(new Date(payload.createdAt)),
        createdAt: payload.createdAt,
        isSelf: payload.author.id === currentUserId,
      };
    },
    [currentUserId, timeFormatter]
  );

  const appendMessage = useCallback((message: DirectMessage) => {
    setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
  }, []);

  useEffect(() => {
    if (!username) {
      setConversationId(null);
      setMessages([]);
      return;
    }

    setIsLoading(true);

    socket.emit('dm:open', { username }, (res: { type: 'success' | 'error'; message?: string; data?: DmOpenResponse }) => {
      if (res?.type === 'error' || !res.data) {
        NotificationAPI.emit(res?.message ?? "Impossible d'ouvrir la conversation.");
        setIsLoading(false);
        return;
      }

      setConversationId(res.data.conversationId);
      setMessages(res.data.messages.map(toDirectMessage));
      setIsLoading(false);
    });
  }, [username, toDirectMessage]);

  useEffect(() => {
    const handleIncoming = (payload: DirectMessagePayload) => {
      if (!conversationId) return;
      if (payload.conversationId !== conversationId) return;
      appendMessage(toDirectMessage(payload));
    };

    socket.on('dm:message', handleIncoming);
    return () => {
      socket.off('dm:message', handleIncoming);
    };
  }, [appendMessage, conversationId, currentUserId, toDirectMessage]);

  const handleSendMessage = (content: string) => {
    if (!conversationId) return;
    setIsSending(true);
    socket.emit('dm:send', { conversationId, content }, (res: { type: 'success' | 'error'; message?: string; data?: { message: DirectMessagePayload } }) => {
      setIsSending(false);
      if (res?.type === 'error' || !res.data) {
        NotificationAPI.emit(res?.message ?? "Échec de l'envoi du message.");
        return;
      }

      appendMessage(toDirectMessage(res.data.message));
    });
  };

  return (
    <div className="flex-1 px-6 py-4 flex flex-col h-full">
      {username ? (
        <div className="w-full flex flex-col gap-6 h-full min-h-0">
          <DirectMessageHeader username={username} />
          <CallBanner username={username} />
          {isLoading ? <div className="text-sm text-neutral-medium">Loading messages...</div> : <DirectMessageList messages={messages} />}
          <DirectMessageComposer username={username} icons={icons} onSend={handleSendMessage} isSending={isSending} />
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Direct Messages</h1>
          <p className="text-sm text-neutral-medium">Select a conversation to start chatting.</p>
        </div>
      )}
    </div>
  );
}
