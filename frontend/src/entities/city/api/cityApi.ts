import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export interface City {
  id: number;
  name: string;
  countryName: string;
}

export const cityApi = {
  getAll: (): Promise<City[]> =>
    httpClient.get<PagedResult<City>>('/cities', { params: { page: 1, pageSize: 100 } })
      .then((r) => r.data.items),
};
