import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { HUB_BASE_URL } from '@shared/config/env';
import { tokenStorage } from '@shared/lib/tokenStorage';
import { useAuth } from '@features/auth';
import type { Message } from '@entities/message';

interface ChatNotificationsContextValue {
  unreadChatIds: Set<number>;
  unreadCount: number;
  markChatRead: (chatId: number) => void;
}

const ChatNotificationsContext = createContext<ChatNotificationsContextValue | null>(null);

// Connects once per session (independent of whether /messages is open) so the header's
// unread badge updates in real time. Unread state is in-memory only — it resets on reload,
// since the backend doesn't persist per-message read status.
export function ChatNotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadChatIds, setUnreadChatIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadChatIds(new Set());
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => tokenStorage.get() ?? '',
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('NewMessageNotification', (message: Message) => {
      setUnreadChatIds((prev) => new Set(prev).add(message.chatId));
    });

    connection.start().catch(() => {
      // Silent — this is a background convenience feature, not critical path.
    });

    return () => {
      connection.stop();
    };
  }, [isAuthenticated]);

  const markChatRead = useCallback((chatId: number) => {
    setUnreadChatIds((prev) => {
      if (!prev.has(chatId)) return prev;
      const next = new Set(prev);
      next.delete(chatId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ unreadChatIds, unreadCount: unreadChatIds.size, markChatRead }),
    [unreadChatIds, markChatRead],
  );

  return <ChatNotificationsContext.Provider value={value}>{children}</ChatNotificationsContext.Provider>;
}

export function useChatNotifications() {
  const ctx = useContext(ChatNotificationsContext);
  if (!ctx) throw new Error('useChatNotifications must be used within a ChatNotificationsProvider');
  return ctx;
}
