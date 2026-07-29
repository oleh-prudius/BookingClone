import { useTranslation } from 'react-i18next';
import { Segmented } from 'antd';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Segmented
      size="small"
      value={i18n.language.startsWith('uk') ? 'uk' : 'en'}
      onChange={(value) => i18n.changeLanguage(value as string)}
      options={[
        { label: 'EN', value: 'en' },
        { label: 'UA', value: 'uk' },
      ]}
    />
  );
}
