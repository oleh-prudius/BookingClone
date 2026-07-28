import { httpClient } from '@shared/api/httpClient';
import type { Hotel, PagedResult } from '@shared/types';

export interface HotelSearchParams {
  page?: number;
  pageSize?: number;
  name?: string;
  categoryId?: number;
  categoryIds?: number[];
  city?: string;
  priceMin?: number;
  priceMax?: number;
}

export const hotelApi = {
  getAll: (params?: HotelSearchParams): Promise<Hotel[]> =>
    httpClient.get<PagedResult<Hotel>>('/hotels', { params }).then((r) => r.data.items ?? (r.data as unknown as Hotel[])),

  getAllPaged: (params?: HotelSearchParams): Promise<PagedResult<Hotel>> =>
    httpClient.get<PagedResult<Hotel>>('/hotels', { params }).then((r) => r.data),

  getById: (id: number): Promise<Hotel> =>
    httpClient.get<Hotel>(`/hotels/${id}`).then((r) => r.data),

  create: (dto: Partial<Hotel>): Promise<Hotel> =>
    httpClient.post<Hotel>('/hotels', dto).then((r) => r.data),

  update: (id: number, dto: Partial<Hotel>): Promise<void> =>
    httpClient.put(`/hotels/${id}`, dto).then(() => undefined),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/hotels/${id}`).then(() => undefined),
};
