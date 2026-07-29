import { useNavigate, Navigate } from 'react-router-dom';
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
              label: <span><SettingOutlined /> Profile</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>Personal information</Typography.Title>
                  <ProfileForm onSuccess={() => navigate('/profile')} />
                </div>
              ),
            },
            {
              key: 'payment',
              label: <span><CreditCardOutlined /> Payment methods</span>,
              children: (
                <div>
                  <Typography.Title level={5} style={{ margin: '8px 24px 0' }}>Payment methods</Typography.Title>
                  <PaymentMethodsSection />
                </div>
              ),
            },
            {
              key: 'bookings',
              label: <span><CalendarOutlined /> Bookings</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>My Bookings</Typography.Title>
                  <Typography.Paragraph type="secondary">
                    View and manage your upcoming, past, and cancelled bookings.
                  </Typography.Paragraph>
                  <AppButton variant="primary" onClick={() => navigate('/my-bookings')}>
                    View my bookings
                  </AppButton>
                </div>
              ),
            },
            {
              key: 'favorites',
              label: <span><HeartOutlined /> Favorites</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>Favorites</Typography.Title>
                  <Typography.Paragraph type="secondary">
                    Hotels you've saved for later.
                  </Typography.Paragraph>
                  <AppButton variant="primary" onClick={() => navigate('/favorites')}>
                    View my favorites
                  </AppButton>
                </div>
              ),
            },
            {
              key: 'account',
              label: <span><LogoutOutlined /> Account</span>,
              children: (
                <div style={{ padding: '8px 24px' }}>
                  <Typography.Title level={5} style={{ marginTop: 0 }}>Account</Typography.Title>
                  <AppButton variant="secondary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Sign out
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
