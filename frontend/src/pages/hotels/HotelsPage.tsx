import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Typography, Pagination, Empty, Spin, Alert } from 'antd';
import { hotelApi, HotelCard } from '@entities/hotel';
import type { Hotel } from '@shared/types';
import { FiltersSidebar } from './FiltersSidebar';
import { SortTabs } from './SortTabs';
import { MapPanel } from './MapPanel';

const PAGE_SIZE = 10;

export function HotelsPage() {
  const [searchParams] = useSearchParams();
  const destination = searchParams.get('destination') || undefined;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [destination]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    hotelApi.getAllPaged({ page, pageSize: PAGE_SIZE, city: destination })
      .then(({ items, totalCount }) => {
        setHotels(items);
        setTotal(totalCount);
      })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
        setError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Failed to load hotels');
      })
      .finally(() => setLoading(false));
  }, [page, destination]);

  return (
    <section style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <FiltersSidebar />
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
            <SortTabs />
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
