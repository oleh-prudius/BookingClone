import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Figma Frame275: pill tabs switching between the three booking domains. Lives above the
// home page's hotel search form, so "Готелі" is always the active tab here — the other two
// are shortcuts to their own search pages, not reflections of the current route.
// Figma's navy-on-white colors are inverted here since this sits on the dark navy hero.
const tabs = [
  { to: '/hotels', key: 'header.hotels', active: true },
  { to: '/tickets', key: 'header.tickets', active: false },
  { to: '/transport', key: 'header.transport', active: false },
] as const;

export function CategoryTabs() {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      {tabs.map(({ to, key, active }) => (
        <Link
          key={to}
          to={to}
          style={{
            padding: '10px 28px',
            borderRadius: 67,
            fontWeight: 600,
            fontSize: 14,
            textTransform: 'uppercase',
            textDecoration: 'none',
            background: active ? '#E6F2FF' : 'transparent',
            color: active ? '#003366' : '#E6F2FF',
            boxShadow: active ? 'none' : 'inset 0 0 0 2px #E6F2FF',
          }}
        >
          {t(key)}
        </Link>
      ))}
    </div>
  );
}
