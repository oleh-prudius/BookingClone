import { httpClient } from '@shared/api/httpClient';

export interface Message {
  id: number;
  text: string;
  chatId: number;
  authorId: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export const messageApi = {
  getByChatId: (chatId: number): Promise<Message[]> =>
    httpClient.get<Message[]>(`/messages/by-chat/${chatId}`).then((r) => r.data),
};
