import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography, Card, Avatar, Tag, Space, Tabs, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  SettingOutlined,
  CameraOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { useAuth, ProfileForm } from '@features/auth';
import { AppButton, ThemeToggle, CurrencySwitcher, LanguageSwitcher } from '@shared/ui';
import { PaymentMethodsSection } from './PaymentMethodsSection';

export function ProfilePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUploadAvatar: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file as File);
      message.success(t('profile.avatarUpdated'));
      onSuccess?.({});
    } catch (err) {
      message.error(t('profile.avatarUpdateError'));
      onError?.(err as Error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarSrc = user!.photo && user!.photo.startsWith('http') ? user!.photo : undefined;

  return (
    <section style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Card styles={{ body: { padding: 0 } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 24px 0' }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={handleUploadAvatar}
            disabled={uploadingAvatar}
          >
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar size={64} src={avatarSrc} icon={avatarSrc ? undefined : <UserOutlined />} />
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: 'var(--triply-primary)',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 12,
                }}
              >
                <CameraOutlined />
              </div>
            </div>
          </Upload>
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

        <Tabs
          tabPosition="left"
          style={{ minHeight: 360, marginTop: 16 }}
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
              key: 'preferences',
              label: <span><BgColorsOutlined /> {t('profile.tabs.preferences')}</span>,
              children: (
                <div style={{ padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 360 }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>{t('profile.tabs.preferences')}</Typography.Title>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text>{t('profile.preferences.theme')}</Typography.Text>
                    <ThemeToggle />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text>{t('profile.preferences.currency')}</Typography.Text>
                    <CurrencySwitcher />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text>{t('profile.preferences.language')}</Typography.Text>
                    <LanguageSwitcher />
                  </div>
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
