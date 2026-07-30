import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export interface City {
  id: number;
  name: string;
  countryName: string;
  latitude: number;
  longitude: number;
}

export interface FindOrCreateCityDto {
  countryName: string;
  cityName: string;
  latitude: number;
  longitude: number;
}

export const cityApi = {
  // pageSize covers the full seeded world dataset (~2000+ cities) so the city
  // picker isn't silently missing most of them.
  getAll: (): Promise<City[]> =>
    httpClient.get<PagedResult<City>>('/cities', { params: { page: 1, pageSize: 5000 } })
      .then((r) => r.data.items),

  findOrCreate: (dto: FindOrCreateCityDto): Promise<City> =>
    httpClient.post<City>('/cities/find-or-create', dto).then((r) => r.data),
};
