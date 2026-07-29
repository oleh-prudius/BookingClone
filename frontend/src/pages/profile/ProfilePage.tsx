import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Card, Avatar, Tag, Space, Tabs } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth, ProfileForm } from '@features/auth';
import { AppButton } from '@shared/ui';
import { PaymentMethodsSection } from './PaymentMethodsSection';

export function ProfilePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <section style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {user!.firstName} {user!.lastName}
            </Typography.Title>
            <Typography.Text type="secondary">{user!.email}</Typography.Text>
            <div style={{ marginTop: 4 }}>
              <Space size={4}>
                {user!.roles.map((r) => <Tag key={r}>{r}</Tag>)}
              </Space>
            </div>
          </div>
        </div>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Tabs
          tabPosition="left"
          style={{ minHeight: 360 }}
          items={[
            {
              key: 'profile',
              label: <span><SettingOutlined /> {t('profile.tabs.profile')}</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>{t('profile.personalInformation')}</Typography.Title>
                  <ProfileForm onSuccess={() => navigate('/profile')} />
                </div>
              ),
            },
            {
              key: 'payment',
              label: <span><CreditCardOutlined /> {t('profile.tabs.paymentMethods')}</span>,
              children: (
                <div>
                  <Typography.Title level={5} style={{ margin: '8px 24px 0' }}>{t('profile.tabs.paymentMethods')}</Typography.Title>
                  <PaymentMethodsSection />
                </div>
              ),
            },
            {
              key: 'bookings',
              label: <span><CalendarOutlined /> {t('profile.tabs.bookings')}</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>{t('profile.myBookings')}</Typography.Title>
                  <Typography.Paragraph type="secondary">
                    {t('profile.myBookingsDescription')}
                  </Typography.Paragraph>
                  <AppButton variant="primary" onClick={() => navigate('/my-bookings')}>
                    {t('booking.viewMyBookings')}
                  </AppButton>
                </div>
              ),
            },
            {
              key: 'favorites',
              label: <span><HeartOutlined /> {t('profile.tabs.favorites')}</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>{t('profile.tabs.favorites')}</Typography.Title>
                  <Typography.Paragraph type="secondary">
                    {t('profile.favoritesDescription')}
                  </Typography.Paragraph>
                  <AppButton variant="primary" onClick={() => navigate('/favorites')}>
                    {t('profile.viewMyFavorites')}
                  </AppButton>
                </div>
              ),
            },
            {
              key: 'account',
              label: <span><LogoutOutlined /> {t('profile.tabs.account')}</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>{t('profile.tabs.account')}</Typography.Title>
                  <AppButton variant="secondary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    {t('profile.signOut')}
                  </AppButton>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </section>
  );
}
