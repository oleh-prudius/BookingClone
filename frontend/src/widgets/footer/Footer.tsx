import { Typography } from 'antd';

export function Footer() {
  return (
    <footer style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        Triply v{__APP_VERSION__} &copy; {new Date().getFullYear()}
      </Typography.Text>
    </footer>
  );
}
