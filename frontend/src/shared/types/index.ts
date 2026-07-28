export interface User {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  cityName: string;
  countryName: string;
  street: string;
  hotelCategoryId: number;
  hotelCategoryName: string;
  realtorId: number;
  isArchived: boolean;
  arrivalTimeUtcFrom: string;
  arrivalTimeUtcTo: string;
  departureTimeUtcFrom: string;
  departureTimeUtcTo: string;
  coverPhotoUrl?: string | null;
  rating?: number | null;
  pricePerNight?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface Booking {
  id: number;
  hotelId: number;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  cancelledAtUtc: string | null;
  confirmedAtUtc: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
