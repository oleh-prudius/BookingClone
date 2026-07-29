import { httpClient } from '@shared/api/httpClient';

export interface HotelReview {
  id: number;
  description: string;
  score: number | null;
  bookingId: number;
  authorName: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface CreateHotelReviewDto {
  description: string;
  score: number | null;
  bookingId: number;
}

export const hotelReviewApi = {
  getByHotel: (hotelId: number): Promise<HotelReview[]> =>
    httpClient.get<HotelReview[]>(`/hotel-reviews/by-hotel/${hotelId}`).then((r) => r.data),

  create: (dto: CreateHotelReviewDto): Promise<HotelReview> =>
    httpClient.post<HotelReview>('/hotel-reviews', dto).then((r) => r.data),
};
