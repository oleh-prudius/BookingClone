import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Row, Col, Typography, Pagination, Empty, Spin, Alert, Segmented, Button } from 'antd';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { FiltersSidebar, MAX_DISTANCE_KM, type HotelFilters } from './FiltersSidebar';
import { SortTabs, type SortBy } from './SortTabs';
import { MapPanel } from '@widgets/hotel-map';
import { useAuth } from '@features/auth';
import { useFavorites } from '@features/favorites';
import { useGeoLocation } from '@shared/lib/useGeoLocation';
import { localizeCityName, localizeCountryName } from '@shared/lib/geoNames';

const PAGE_SIZE = 10;
const PRICE_MIN = 0;
const PRICE_MAX = 1000;
const FILTERS_DEBOUNCE_MS = 400;
const DEFAULT_SORT: SortBy = 'popular';
const VALID_SORTS: SortBy[] = ['popular', 'price', 'rating'];
type ViewMode = 'grid' | 'list';
const DEFAULT_VIEW: ViewMode = 'grid';

function readSortFromParams(searchParams: URLSearchParams): SortBy {
  const raw = searchParams.get('sortBy');
  return (VALID_SORTS as string[]).includes(raw ?? '') ? (raw as SortBy) : DEFAULT_SORT;
}

function readViewFromParams(searchParams: URLSearchParams): ViewMode {
  return searchParams.get('view') === 'list' ? 'list' : DEFAULT_VIEW;
}

function parseNumberList(raw: string | null): number[] {
  if (!raw) return [];
  return raw.split(',').map(Number).filter((n) => !Number.isNaN(n));
}

function readFiltersFromParams(searchParams: URLSearchParams): HotelFilters {
  return {
    priceRange: [
      Number(searchParams.get('priceMin')) || PRICE_MIN,
      Number(searchParams.get('priceMax')) || PRICE_MAX,
    ],
    stars: parseNumberList(searchParams.get('stars')),
    categoryIds: parseNumberList(searchParams.get('categoryIds')),
    amenityIds: parseNumberList(searchParams.get('amenityIds')),
    maxDistanceKm: Number(searchParams.get('maxDistanceKm')) || MAX_DISTANCE_KM,
  };
}

export function HotelsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const destination = searchParams.get('destination') || undefined;

  const [filters, setFilters] = useState<HotelFilters>(() => readFiltersFromParams(searchParams));
  const [debouncedFilters, setDebouncedFilters] = useState<HotelFilters>(filters);
  const [sortBy, setSortBy] = useState<SortBy>(() => readSortFromParams(searchParams));
  const [view, setView] = useState<ViewMode>(() => readViewFromParams(searchParams));
  const [allCountries, setAllCountries] = useState(() => searchParams.get('allCountries') === '1');
  const { location: geoLocation } = useGeoLocation();

  // Only auto-restrict to the visitor's own country when they haven't searched a
  // specific destination and haven't explicitly asked to see every country.
  const effectiveCountry = !destination && !allCountries ? geoLocation?.country ?? undefined : undefined;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredHotelId, setHoveredHotelId] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Debounce filter changes before they hit the URL/API
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedFilters(filters), FILTERS_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [filters]);

  // Reflect the committed filters (+ destination) in the URL so results are shareable/refreshable
  useEffect(() => {
    const next = new URLSearchParams();
    if (destination) next.set('destination', destination);
    if (debouncedFilters.priceRange[0] > PRICE_MIN) next.set('priceMin', String(debouncedFilters.priceRange[0]));
    if (debouncedFilters.priceRange[1] < PRICE_MAX) next.set('priceMax', String(debouncedFilters.priceRange[1]));
    if (debouncedFilters.stars.length) next.set('stars', debouncedFilters.stars.join(','));
    if (debouncedFilters.categoryIds.length) next.set('categoryIds', debouncedFilters.categoryIds.join(','));
    if (debouncedFilters.amenityIds.length) next.set('amenityIds', debouncedFilters.amenityIds.join(','));
    if (debouncedFilters.maxDistanceKm < MAX_DISTANCE_KM) next.set('maxDistanceKm', String(debouncedFilters.maxDistanceKm));
    if (sortBy !== DEFAULT_SORT) next.set('sortBy', sortBy);
    if (view !== DEFAULT_VIEW) next.set('view', view);
    if (page > 1) next.set('page', String(page));
    if (allCountries) next.set('allCountries', '1');
    setSearchParams(next, { replace: true });
  }, [debouncedFilters, destination, sortBy, view, page, allCountries, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, destination, sortBy, effectiveCountry]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    hotelApi.getAllPaged({
      page,
      pageSize: PAGE_SIZE,
      city: destination,
      country: effectiveCountry,
      priceMin: debouncedFilters.priceRange[0] > PRICE_MIN ? debouncedFilters.priceRange[0] : undefined,
      priceMax: debouncedFilters.priceRange[1] < PRICE_MAX ? debouncedFilters.priceRange[1] : undefined,
      categoryIds: debouncedFilters.categoryIds.length ? debouncedFilters.categoryIds : undefined,
      starRatings: debouncedFilters.stars.length ? debouncedFilters.stars : undefined,
      amenityIds: debouncedFilters.amenityIds.length ? debouncedFilters.amenityIds : undefined,
      maxDistanceFromCityCenterKm: debouncedFilters.maxDistanceKm < MAX_DISTANCE_KM ? debouncedFilters.maxDistanceKm : undefined,
      sortBy,
    })
      .then(({ items, totalCount }) => {
        setHotels(items);
        setTotal(totalCount);
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr.response?.data?.error ?? axiosErr.message ?? t('hotels.loadError'));
      })
      .finally(() => setLoading(false));
  }, [page, destination, effectiveCountry, debouncedFilters, sortBy]);

  return (
    <section style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <FiltersSidebar value={filters} onChange={setFilters} />
        </Col>

        <Col xs={24} lg={18}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {destination
                  ? t('hotels.titleInDestination', { destination: localizeCityName(destination, i18n.language) })
                  : effectiveCountry
                    ? t('hotels.titleInCountry', { country: localizeCountryName(effectiveCountry, i18n.language) })
                    : t('hotels.title')}
              </Typography.Title>
              {effectiveCountry && (
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => setAllCountries(true)}>
                  {t('hotels.showAllCountries')}
                </Button>
              )}
              {allCountries && !destination && geoLocation?.country && (
                <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => setAllCountries(false)}>
                  {t('hotels.showOnlyMyCountry', { country: localizeCountryName(geoLocation.country, i18n.language) })}
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <SortTabs value={sortBy} onChange={setSortBy} />
              <Segmented
                value={view}
                onChange={(v) => setView(v as ViewMode)}
                options={[
                  { label: t('hotels.gridView'), value: 'grid', icon: <AppstoreOutlined /> },
                  { label: t('hotels.listView'), value: 'list', icon: <BarsOutlined /> },
                ]}
              />
            </div>
          </div>

          {loading && <Spin style={{ display: 'block', margin: '48px auto' }} />}
          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
          {!loading && !error && hotels.length === 0 && <Empty description={t('hotels.noResults')} />}

          {view === 'grid' ? (
            <Row gutter={[16, 16]}>
              {hotels.map((h) => (
                <Col
                  key={h.id}
                  xs={24}
                  sm={12}
                  lg={8}
                  onMouseEnter={() => setHoveredHotelId(h.id)}
                  onMouseLeave={() => setHoveredHotelId((id) => (id === h.id ? null : id))}
                >
                  <HotelCard
                    hotel={h}
                    variant="grid"
                    isFavorite={isFavorite(h.id)}
                    onToggleFavorite={isAuthenticated ? () => toggleFavorite(h.id) : undefined}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {hotels.map((h) => (
                <div
                  key={h.id}
                  onMouseEnter={() => setHoveredHotelId(h.id)}
                  onMouseLeave={() => setHoveredHotelId((id) => (id === h.id ? null : id))}
                >
                  <HotelCard
                    hotel={h}
                    variant="list"
                    isFavorite={isFavorite(h.id)}
                    onToggleFavorite={isAuthenticated ? () => toggleFavorite(h.id) : undefined}
                  />
                </div>
              ))}
            </div>
          )}

          {total > PAGE_SIZE && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={setPage}
                disabled={loading}
              />
            </div>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <MapPanel hotels={hotels} hoveredHotelId={hoveredHotelId} height="400px" sticky={false} />
      </div>
    </section>
  );
}
