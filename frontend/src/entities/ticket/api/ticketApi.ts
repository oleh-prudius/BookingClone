import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export interface Ticket {
  id: number;
  transportRouteId: number;
  fromCityName: string;
  toCityName: string;
  departureUtc: string;
  arrivalUtc: string;
  seats: number;
  totalPrice: number;
  purchasedAtUtc: string;
}

export interface PurchaseTicketDto {
  transportRouteId: number;
  seats: number;
}

export const ticketApi = {
  getMine: (page = 1, pageSize = 50): Promise<PagedResult<Ticket>> =>
    httpClient.get<PagedResult<Ticket>>('/tickets', { params: { page, pageSize } }).then((r) => r.data),

  purchase: (dto: PurchaseTicketDto): Promise<Ticket> =>
    httpClient.post<Ticket>('/tickets', dto).then((r) => r.data),
};
