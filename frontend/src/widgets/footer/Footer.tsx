import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {t('footer.copyright', { version: __APP_VERSION__, year: new Date().getFullYear() })}
      </Typography.Text>
    </footer>
  );
}
