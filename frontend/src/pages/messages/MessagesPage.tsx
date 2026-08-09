import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, List, Empty, Input, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useAuth } from '@features/auth';
import { useChatHub, useChatNotifications } from '@features/chat';
import { chatApi, type Chat } from '@entities/chat';
import { messageApi, type Message } from '@entities/message';
import { AppButton } from '@shared/ui';

export function MessagesPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { markChatRead } = useChatNotifications();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isRealtor = user?.roles.includes('Realtor') ?? false;

  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);
    const request = isRealtor ? chatApi.getByRealtorId(user.id) : chatApi.getByCustomerId(user.id);
    request
      .then(setChats)
      .catch(() => setChats([]))
      .finally(() => setLoadingChats(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isRealtor]);

  useEffect(() => {
    if (selectedChatId == null) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    markChatRead(selectedChatId);
    messageApi.getByChatId(selectedChatId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  const handleIncomingMessage = useCallback((message: Message) => {
    if (message.chatId !== selectedChatId) return;
    setMessages((prev) => [...prev, message]);
  }, [selectedChatId]);

  const { sendMessage } = useChatHub(selectedChatId, handleIncomingMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null;
  const otherParticipantName = (chat: Chat) => (isRealtor ? chat.customerName : chat.realtorName);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(text);
    setDraft('');
  };

  return (
    <section style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('messages.title')}</Typography.Title>

      <div style={{ display: 'flex', gap: 16, height: 560, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: 280, borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
          {loadingChats ? (
            <div style={{ padding: 24, textAlign: 'center' }}><Spin /></div>
          ) : chats.length === 0 ? (
            <Empty description={t('messages.noConversationsYet')} style={{ padding: 24 }} />
          ) : (
            <List
              dataSource={chats}
              renderItem={(chat) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    background: chat.id === selectedChatId ? 'var(--triply-backgroundLight, #f5f5f5)' : undefined,
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={t('messages.openConversationWith', { name: otherParticipantName(chat) })}
                  onClick={() => setSelectedChatId(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedChatId(chat.id);
                    }
                  }}
                >
                  <List.Item.Meta title={otherParticipantName(chat)} />
                </List.Item>
              )}
            />
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChat === null ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Empty description={t('messages.selectAConversation')} />
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <Typography.Text strong>{otherParticipantName(selectedChat)}</Typography.Text>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {loadingMessages ? (
                  <div style={{ margin: 'auto' }}><Spin /></div>
                ) : messages.length === 0 ? (
                  <Empty description={t('messages.noMessagesYet')} style={{ margin: 'auto' }} />
                ) : (
                  messages.map((message) => {
                    const isMine = message.authorId === user!.id;
                    return (
                      <div
                        key={message.id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isMine ? 'var(--triply-navyDarkest, #1a2b4c)' : 'var(--triply-backgroundLight, #f0f0f0)',
                          color: isMine ? 'white' : 'inherit',
                          borderRadius: 12,
                          padding: '8px 12px',
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</div>
                        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                          {new Date(message.createdAtUtc).toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
                <Input
                  placeholder={t('messages.typeAMessage')}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onPressEnter={handleSend}
                  aria-label={t('messages.typeAMessage')}
                />
                <AppButton variant="primary" icon={<SendOutlined />} onClick={handleSend} disabled={!draft.trim()}>
                  {t('messages.send')}
                </AppButton>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
