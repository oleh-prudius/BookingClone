import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Card } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  BankOutlined,
  CrownOutlined,
  StarOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { hotelCategoryApi, type HotelCategory } from '@entities/hotel-category';

const ICONS_BY_NAME: Record<string, React.ReactNode> = {
  Hotel: <HomeOutlined style={{ fontSize: 28 }} />,
  Hostel: <TeamOutlined style={{ fontSize: 28 }} />,
  Apartment: <BankOutlined style={{ fontSize: 28 }} />,
  Villa: <CrownOutlined style={{ fontSize: 28 }} />,
  Resort: <StarOutlined style={{ fontSize: 28 }} />,
};

export function PropertyTypes() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<HotelCategory[]>([]);

  useEffect(() => {
    hotelCategoryApi.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('home.browseByPropertyType')}</Typography.Title>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 16,
      }}>
        {categories.map((c) => (
          <Card
            key={c.id}
            hoverable
            role="button"
            tabIndex={0}
            aria-label={t('home.browseCategoryHotels', { category: c.name })}
            onClick={() => navigate(`/hotels?categoryIds=${c.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/hotels?categoryIds=${c.id}`);
              }
            }}
            style={{ textAlign: 'center' }}
          >
            {ICONS_BY_NAME[c.name] ?? <ApartmentOutlined style={{ fontSize: 28 }} />}
            <div style={{ marginTop: 8, fontWeight: 500 }}>{c.name}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
