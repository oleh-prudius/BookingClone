import { httpClient } from '@shared/api/httpClient';

export interface Room {
  id: number;
  name: string;
  area: number;
  numberOfRooms: number;
  quantity: number;
  hotelId: number;
  roomTypeId: number;
}

export interface RoomInputDto {
  name: string;
  area: number;
  numberOfRooms: number;
  quantity: number;
  hotelId: number;
  roomTypeId: number;
}

export const roomApi = {
  getByHotelId: (hotelId: number): Promise<Room[]> =>
    httpClient.get<Room[]>(`/hotels/${hotelId}/rooms`).then((r) => r.data),

  create: (dto: RoomInputDto): Promise<Room> =>
    httpClient.post<Room>('/rooms', dto).then((r) => r.data),

  update: (id: number, dto: RoomInputDto): Promise<void> =>
    httpClient.put(`/rooms/${id}`, dto).then(() => undefined),
};
