import { httpClient } from '@shared/api/httpClient';
import type { PagedResult } from '@shared/types';

export interface RoomType {
  id: number;
  name: string;
}

export const roomTypeApi = {
  getAll: (): Promise<RoomType[]> =>
    httpClient.get<PagedResult<RoomType>>('/room-types', { params: { page: 1, pageSize: 100 } })
      .then((r) => r.data.items),
};
