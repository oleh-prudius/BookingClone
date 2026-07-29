import { httpClient } from '@shared/api/httpClient';

export interface Address {
  id: number;
  street: string;
  houseNumber: string;
  cityId: number;
  cityName: string;
}

export interface CreateAddressDto {
  street: string;
  houseNumber: string;
  cityId: number;
}

export const addressApi = {
  create: (dto: CreateAddressDto): Promise<Address> =>
    httpClient.post<Address>('/addresses', dto).then((r) => r.data),
};
