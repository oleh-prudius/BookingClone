import { useNavigate, Navigate } from 'react-router-dom';
import { Typography, Divider } from 'antd';
import { useAuth, ProfileForm } from '@features/auth';
import { AppButton } from '@shared/ui';

export function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <section style={{ padding: 24, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Profile</h1>
      <p style={{ marginBottom: 24, color: 'var(--text)' }}>
        {user!.roles.join(', ')}
      </p>
      <ProfileForm onSuccess={() => navigate('/profile')} />

      <Divider />

      <Typography.Title level={4}>My Bookings</Typography.Title>
      <AppButton variant="secondary" onClick={() => navigate('/my-bookings')}>
        View my bookings
      </AppButton>
    </section>
  );
}
