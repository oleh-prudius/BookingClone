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

  upload: (hotelId: number, file: File, priority: number): Promise<HotelPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('hotelId', String(hotelId));
    formData.append('priority', String(priority));
    return httpClient
      .post<HotelPhoto>('/hotel-photos/upload', formData, { headers: { 'Content-Type': undefined } })
      .then((r) => r.data);
  },

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/hotel-photos/${id}`).then(() => undefined),
};
