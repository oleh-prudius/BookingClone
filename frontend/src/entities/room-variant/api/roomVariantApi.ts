import { httpClient } from '@shared/api/httpClient';

export interface RoomVariant {
  id: number;
  price: number;
  discountPrice: number | null;
  roomId: number;
  adultCount: number;
  childCount: number;
  singleBedCount: number;
  doubleBedCount: number;
  extraBedCount: number;
  sofaCount: number;
  kingsizeBedCount: number;
}

export interface RoomVariantInputDto {
  price: number;
  discountPrice: number | null;
  roomId: number;
  adultCount: number;
  childCount: number;
  singleBedCount: number;
  doubleBedCount: number;
  extraBedCount: number;
  sofaCount: number;
  kingsizeBedCount: number;
}

export const roomVariantApi = {
  getByRoomId: (roomId: number): Promise<RoomVariant[]> =>
    httpClient.get<RoomVariant[]>(`/room-variants/by-room/${roomId}`).then((r) => r.data),

  create: (dto: RoomVariantInputDto): Promise<RoomVariant> =>
    httpClient.post<RoomVariant>('/room-variants', dto).then((r) => r.data),

  update: (id: number, dto: RoomVariantInputDto): Promise<void> =>
    httpClient.put(`/room-variants/${id}`, dto).then(() => undefined),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/room-variants/${id}`).then(() => undefined),
};
