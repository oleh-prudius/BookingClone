import { httpClient } from '@shared/api/httpClient';

export interface FavoriteHotel {
  hotelId: number;
  customerId: number;
}

export const favoriteHotelApi = {
  getByCustomerId: (customerId: number): Promise<FavoriteHotel[]> =>
    httpClient.get<FavoriteHotel[]>(`/favorite-hotels/by-customer/${customerId}`).then((r) => r.data),

  add: (customerId: number, hotelId: number): Promise<FavoriteHotel> =>
    httpClient.post<FavoriteHotel>('/favorite-hotels', { customerId, hotelId }).then((r) => r.data),

  remove: (customerId: number, hotelId: number): Promise<void> =>
    httpClient.delete('/favorite-hotels', { data: { customerId, hotelId } }).then(() => undefined),
};
