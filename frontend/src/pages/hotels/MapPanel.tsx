import { EnvironmentOutlined } from '@ant-design/icons';

export function MapPanel() {
  return (
    <div
      style={{
        position: 'sticky',
        top: 88,
        height: 'calc(100vh - 120px)',
        borderRadius: 8,
        border: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--text)',
      }}
    >
      <EnvironmentOutlined style={{ fontSize: 32 }} />
      <span>Map view coming soon</span>
    </div>
  );
}
