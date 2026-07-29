import { useTranslation } from 'react-i18next';

export function Page404() {
  const { t } = useTranslation();

  return (
    <section style={{ padding: 24, textAlign: 'center' }}>
      <h1>404</h1>
      <p>{t('common.pageNotFound')}</p>
    </section>
  );
}
