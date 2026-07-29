import { httpClient } from '@shared/api/httpClient';
import type { Hotel, PagedResult } from '@shared/types';

export interface HotelSearchParams {
  page?: number;
  pageSize?: number;
  name?: string;
  categoryId?: number;
  categoryIds?: number[];
  starRatings?: number[];
  city?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
}

export interface CreateHotelDto {
  name: string;
  description: string;
  addressId: number;
  hotelCategoryId: number;
  realtorId: number;
  starRating: number;
  arrivalTimeUtcFrom: string;
  arrivalTimeUtcTo: string;
  departureTimeUtcFrom: string;
  departureTimeUtcTo: string;
}

export interface UpdateHotelDto {
  name: string;
  description: string;
  addressId: number;
  hotelCategoryId: number;
  starRating: number;
  arrivalTimeUtcFrom: string;
  arrivalTimeUtcTo: string;
  departureTimeUtcFrom: string;
  departureTimeUtcTo: string;
}

export const hotelApi = {
  getAll: (params?: HotelSearchParams): Promise<Hotel[]> =>
    httpClient.get<PagedResult<Hotel>>('/hotels', { params }).then((r) => r.data.items ?? (r.data as unknown as Hotel[])),

  getAllPaged: (params?: HotelSearchParams): Promise<PagedResult<Hotel>> =>
    httpClient.get<PagedResult<Hotel>>('/hotels', { params }).then((r) => r.data),

  getById: (id: number): Promise<Hotel> =>
    httpClient.get<Hotel>(`/hotels/${id}`).then((r) => r.data),

  getByRealtorId: (realtorId: number): Promise<Hotel[]> =>
    httpClient.get<Hotel[]>(`/hotels/by-realtor/${realtorId}`).then((r) => r.data),

  create: (dto: CreateHotelDto): Promise<Hotel> =>
    httpClient.post<Hotel>('/hotels', dto).then((r) => r.data),

  update: (id: number, dto: UpdateHotelDto): Promise<void> =>
    httpClient.put(`/hotels/${id}`, dto).then(() => undefined),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/hotels/${id}`).then(() => undefined),
};
