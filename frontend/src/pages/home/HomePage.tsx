import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {SearchForm} from "@features/search/ui/SearchForm";
import { PopularDestinations } from './PopularDestinations';
import { DealsSection } from './DealsSection';
import { PropertyTypes } from './PropertyTypes';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <section style={{
          background: 'var(--triply-navyDarkest)',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          color: 'white'
      }}>
        <h1 style={{ margin:0, fontSize:36, fontWeight: 700, color: 'white'}}>
            {t('home.heroTitle')}
        </h1>
        <p style={{margin: 0, fontSize:18, opacity:0.9}}>
            {t('home.heroSubtitle')}
        </p>
        <Link to="/hotels" style={{ color: 'white', textDecoration: 'underline' }}>{t('home.browseHotels')}</Link>
          <SearchForm/>
      </section>

      <PopularDestinations />
      <DealsSection />
      <PropertyTypes />
    </>
  );
}
