import { useNavigate, Navigate } from 'react-router-dom';
import { Typography, Card, Avatar, Tag, Space } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  LogoutOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useAuth, ProfileForm } from '@features/auth';
import { AppButton } from '@shared/ui';

export function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <section style={{ padding: 24, maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
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

      <Card title="Edit profile">
        <ProfileForm onSuccess={() => navigate('/profile')} />
      </Card>

      <Card title="Your activity" styles={{ body: { padding: 0 } }}>
        <div
          onClick={() => navigate('/my-bookings')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
        >
          <CalendarOutlined style={{ fontSize: 18 }} />
          <span style={{ flex: 1 }}>My Bookings</span>
          <RightOutlined style={{ color: 'var(--text)' }} />
        </div>
        <div
          onClick={() => navigate('/favorites')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer' }}
        >
          <HeartOutlined style={{ fontSize: 18 }} />
          <span style={{ flex: 1 }}>Favorites</span>
          <RightOutlined style={{ color: 'var(--text)' }} />
        </div>
      </Card>

      <Card title="Account">
        <AppButton variant="secondary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
          Sign out
        </AppButton>
      </Card>
    </section>
  );
}
