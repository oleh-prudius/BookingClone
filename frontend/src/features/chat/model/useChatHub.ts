import { useCallback, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { HUB_BASE_URL } from '@shared/config/env';
import { tokenStorage } from '@shared/lib/tokenStorage';
import { notifyError } from '@shared/lib/notify';
import type { Message } from '@entities/message';

export function useChatHub(chatId: number | null, onMessage: (message: Message) => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (chatId == null) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/hubs/chat`, {
        accessTokenFactory: () => tokenStorage.get() ?? '',
        // Auth is via the token above, not cookies — the backend's CORS policy
        // doesn't set Access-Control-Allow-Credentials, so the browser's default
        // credentialed fetch/XHR for negotiate would otherwise fail CORS preflight.
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (message: Message) => onMessageRef.current(message));
    connectionRef.current = connection;

    connection.start()
      .then(() => connection.invoke('JoinChat', chatId))
      .catch(() => notifyError('Could not connect to chat. Messages may not update in real time.'));

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [chatId]);

  const sendMessage = useCallback(async (text: string) => {
    if (chatId == null || !connectionRef.current) return;
    try {
      await connectionRef.current.invoke('SendMessage', chatId, text);
    } catch {
      notifyError('Could not send message.');
    }
  }, [chatId]);

  return { sendMessage };
}
