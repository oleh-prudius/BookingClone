import { useTranslation } from 'react-i18next';
import { Result } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

interface Props {
  titleKey: string;
}

export function ComingSoonPage({ titleKey }: Props) {
  const { t } = useTranslation();

  return (
    <section style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Result
        icon={<RocketOutlined />}
        title={t(titleKey)}
        subTitle={t('comingSoon.subtitle')}
      />
    </section>
  );
}
