import { httpClient } from '@shared/api/httpClient';

export type PlaceCategory = 'Restaurant' | 'Landmark' | 'Museum' | 'Park' | 'Shopping';

export const PLACE_CATEGORIES: PlaceCategory[] = ['Restaurant', 'Landmark', 'Museum', 'Park', 'Shopping'];

export interface Place {
  id: number;
  name: string;
  category: PlaceCategory;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
}

export interface NearbyPlacesParams {
  hotelId?: number;
  cityId?: number;
  category?: PlaceCategory;
}

export const placeApi = {
  getNearby: (params: NearbyPlacesParams): Promise<Place[]> =>
    httpClient.get<Place[]>('/places/nearby', { params }).then((r) => r.data),
};
