import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@features/auth';
import { favoriteHotelApi } from '@entities/favorite-hotel';

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  isFavorite: (hotelId: number) => boolean;
  toggleFavorite: (hotelId: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setFavoriteIds(new Set());
      return;
    }
    favoriteHotelApi.getByCustomerId(user.id)
      .then((items) => setFavoriteIds(new Set(items.map((f) => f.hotelId))))
      .catch(() => setFavoriteIds(new Set()));
  }, [isAuthenticated, user]);

  const toggleFavorite = async (hotelId: number) => {
    if (!user) return;
    const wasFavorite = favoriteIds.has(hotelId);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(hotelId);
      else next.add(hotelId);
      return next;
    });

    try {
      if (wasFavorite) await favoriteHotelApi.remove(user.id, hotelId);
      else await favoriteHotelApi.add(user.id, hotelId);
    } catch {
      // Roll back on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(hotelId);
        else next.delete(hotelId);
        return next;
      });
    }
  };

  const value = useMemo<FavoritesContextValue>(
    () => ({ favoriteIds, isFavorite: (id) => favoriteIds.has(id), toggleFavorite }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favoriteIds, user],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
