import { useTranslation } from 'react-i18next';
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';

const LANGUAGES = [
  { value: 'en', flag: '🇬🇧', label: 'English' },
  { value: 'uk', flag: '🇺🇦', label: 'Українська' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('uk') ? 'uk' : 'en';
  const currentLanguage = LANGUAGES.find((l) => l.value === current)!;

  const items: MenuProps['items'] = LANGUAGES.map((l) => ({
    key: l.value,
    label: (
      <span>
        <span style={{ marginRight: 8 }}>{l.flag}</span>
        {l.label}
      </span>
    ),
  }));

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    i18n.changeLanguage(key);
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick, selectedKeys: [current] }} trigger={['click']}>
      <Button type="text" style={{ color: 'inherit', fontSize: 18 }} aria-label="Change language">
        {currentLanguage.flag}
      </Button>
    </Dropdown>
  );
}
