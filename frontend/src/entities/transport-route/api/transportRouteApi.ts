import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export type TransportType = 'Bus' | 'Train' | 'Plane';

export interface TransportRoute {
  id: number;
  type: TransportType;
  fromCityId: number;
  fromCityName: string;
  toCityId: number;
  toCityName: string;
  departureUtc: string;
  arrivalUtc: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
}

export interface SearchTransportRoutesParams {
  fromCityId?: number;
  toCityId?: number;
  date?: string;
  type?: TransportType;
  page?: number;
  pageSize?: number;
}

export const transportRouteApi = {
  search: (params: SearchTransportRoutesParams): Promise<PagedResult<TransportRoute>> =>
    httpClient
      .get<PagedResult<TransportRoute>>('/transport-routes', { params })
      .then((r) => r.data),
};
