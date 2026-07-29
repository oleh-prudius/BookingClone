import { useNavigate, Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { LoginForm } from '@features/auth';
import { Logo } from '@shared/ui';

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--triply-backgroundLight)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 400, borderRadius: 12 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--triply-navyDarkest)',
              borderRadius: 12,
              padding: '10px 16px',
              marginBottom: 16,
            }}
          >
            <Logo />
          </div>
          <Typography.Title level={3} style={{ margin: 0 }}>Welcome back</Typography.Title>
          <Typography.Text type="secondary">Sign in to continue to Triply</Typography.Text>
        </div>

        <LoginForm onSuccess={() => navigate('/hotels')} />

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Typography.Text type="secondary">No account? </Typography.Text>
          <Link to="/register">Create one</Link>
        </div>
      </Card>
    </section>
  );
}
