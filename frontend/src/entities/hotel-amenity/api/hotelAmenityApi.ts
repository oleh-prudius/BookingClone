import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export interface HotelAmenity {
  id: number;
  name: string;
  image: string;
}

export const hotelAmenityApi = {
  getAll: (): Promise<HotelAmenity[]> =>
    httpClient.get<PagedResult<HotelAmenity>>('/hotel-amenities', { params: { page: 1, pageSize: 100 } })
      .then((r) => r.data.items),
};
