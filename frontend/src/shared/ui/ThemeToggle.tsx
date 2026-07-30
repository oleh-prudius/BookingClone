import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@shared/theme/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <Button
      type="text"
      shape="circle"
      style={{ color: 'inherit', fontSize: 18 }}
      aria-label={isDark ? t('header.switchToLightTheme') : t('header.switchToDarkTheme')}
      icon={isDark ? <SunOutlined /> : <MoonOutlined />}
      onClick={toggleTheme}
    />
  );
}
