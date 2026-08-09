import { Popover, Button } from 'antd';
import type { CSSProperties } from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';
import { CurrencySwitcher } from './CurrencySwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';

// Always visible regardless of auth state — guests need a way to set
// language/currency/theme too, not just logged-in users via /profile.
export function SettingsMenu({ buttonStyle }: { buttonStyle?: CSSProperties }) {
  const { t } = useTranslation();

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span>{t('profile.preferences.theme')}</span>
        <ThemeToggle />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span>{t('profile.preferences.currency')}</span>
        <CurrencySwitcher />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <span>{t('profile.preferences.language')}</span>
        <LanguageSwitcher />
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button
        type="text"
        shape="circle"
        aria-label={t('profile.tabs.preferences')}
        icon={<SettingOutlined style={{ fontSize: 18 }} />}
        style={buttonStyle}
      />
    </Popover>
  );
}
