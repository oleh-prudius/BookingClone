import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export interface HotelCategory {
  id: number;
  name: string;
}

export const hotelCategoryApi = {
  getAll: (): Promise<HotelCategory[]> =>
    httpClient.get<PagedResult<HotelCategory>>('/hotel-categories', { params: { page: 1, pageSize: 100 } })
      .then((r) => r.data.items),
};
