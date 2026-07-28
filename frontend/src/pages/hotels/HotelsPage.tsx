import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Typography, Pagination, Empty, Spin, Alert } from 'antd';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { FiltersSidebar, type HotelFilters } from './FiltersSidebar';
import { SortTabs, type SortBy } from './SortTabs';
import { MapPanel } from './MapPanel';

const PAGE_SIZE = 10;
const PRICE_MIN = 0;
const PRICE_MAX = 1000;
const FILTERS_DEBOUNCE_MS = 400;
const DEFAULT_SORT: SortBy = 'popular';
const VALID_SORTS: SortBy[] = ['popular', 'price', 'rating'];

function readSortFromParams(searchParams: URLSearchParams): SortBy {
  const raw = searchParams.get('sortBy');
  return (VALID_SORTS as string[]).includes(raw ?? '') ? (raw as SortBy) : DEFAULT_SORT;
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
  };
}

export function HotelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const destination = searchParams.get('destination') || undefined;

  const [filters, setFilters] = useState<HotelFilters>(() => readFiltersFromParams(searchParams));
  const [debouncedFilters, setDebouncedFilters] = useState<HotelFilters>(filters);
  const [sortBy, setSortBy] = useState<SortBy>(() => readSortFromParams(searchParams));

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (sortBy !== DEFAULT_SORT) next.set('sortBy', sortBy);
    if (page > 1) next.set('page', String(page));
    setSearchParams(next, { replace: true });
  }, [debouncedFilters, destination, sortBy, page, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters, destination, sortBy]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    hotelApi.getAllPaged({
      page,
      pageSize: PAGE_SIZE,
      city: destination,
      priceMin: debouncedFilters.priceRange[0] > PRICE_MIN ? debouncedFilters.priceRange[0] : undefined,
      priceMax: debouncedFilters.priceRange[1] < PRICE_MAX ? debouncedFilters.priceRange[1] : undefined,
      categoryIds: debouncedFilters.categoryIds.length ? debouncedFilters.categoryIds : undefined,
      sortBy,
    })
      .then(({ items, totalCount }) => {
        setHotels(items);
        setTotal(totalCount);
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Failed to load hotels');
      })
      .finally(() => setLoading(false));
  }, [page, destination, debouncedFilters, sortBy]);

  return (
    <section style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <FiltersSidebar value={filters} onChange={setFilters} />
        </Col>

        <Col xs={24} lg={12}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {destination ? `Hotels in ${destination}` : 'Hotels'}
            </Typography.Title>
            <SortTabs value={sortBy} onChange={setSortBy} />
          </div>

          {loading && <Spin style={{ display: 'block', margin: '48px auto' }} />}
          {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
          {!loading && !error && hotels.length === 0 && <Empty description="No hotels found" />}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto',
            paddingRight: 4,
          }}>
            {hotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
          </div>

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

        <Col xs={0} lg={6}>
          <MapPanel />
        </Col>
      </Row>
    </section>
  );
}
