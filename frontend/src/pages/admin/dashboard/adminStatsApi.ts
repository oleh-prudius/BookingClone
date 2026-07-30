import { httpClient } from '@shared/api/httpClient';

export interface BookingsPerDay {
  date: string;
  count: number;
  revenue: number;
}

export interface TopHotel {
  hotelId: number;
  hotelName: string;
  bookingsCount: number;
  revenue: number;
}

export interface BookingStatusCount {
  status: string;
  count: number;
}

export interface SignupsPerDay {
  date: string;
  count: number;
}

export interface AdminStats {
  bookingsOverTime: BookingsPerDay[];
  topHotels: TopHotel[];
  bookingStatusBreakdown: BookingStatusCount[];
  newUserSignupsOverTime: SignupsPerDay[];
}

export const adminStatsApi = {
  get: (days = 30, topHotelsCount = 5): Promise<AdminStats> =>
    httpClient
      .get<AdminStats>('/admin/stats', { params: { days, topHotelsCount } })
      .then((r) => r.data),
};
