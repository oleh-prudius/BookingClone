import { httpClient } from '@shared/api/httpClient';

export interface Chat {
  id: number;
  customerId: number;
  customerName: string;
  realtorId: number;
  realtorName: string;
}

export const chatApi = {
  getByCustomerId: (customerId: number): Promise<Chat[]> =>
    httpClient.get<Chat[]>(`/chats/by-customer/${customerId}`).then((r) => r.data),

  getByRealtorId: (realtorId: number): Promise<Chat[]> =>
    httpClient.get<Chat[]>(`/chats/by-realtor/${realtorId}`).then((r) => r.data),

  getById: (id: number): Promise<Chat> =>
    httpClient.get<Chat>(`/chats/${id}`).then((r) => r.data),

  create: (customerId: number, realtorId: number): Promise<Chat> =>
    httpClient.post<Chat>('/chats', { customerId, realtorId }).then((r) => r.data),
};
