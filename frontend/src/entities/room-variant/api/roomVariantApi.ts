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

export const roomVariantApi = {
  getByRoomId: (roomId: number): Promise<RoomVariant[]> =>
    httpClient.get<RoomVariant[]>(`/room-variants/by-room/${roomId}`).then((r) => r.data),
};
