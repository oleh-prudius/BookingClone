import { httpClient } from '@shared/api/httpClient';

export interface HotelPhoto {
  id: number;
  name: string;
  priority: number;
  hotelId: number;
}

export const hotelPhotoApi = {
  getByHotelId: (hotelId: number): Promise<HotelPhoto[]> =>
    httpClient.get<HotelPhoto[]>(`/hotel-photos/by-hotel/${hotelId}`).then((r) => r.data),
};
