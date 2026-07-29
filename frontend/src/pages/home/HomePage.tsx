import { Link } from 'react-router-dom';
import {SearchForm} from "@features/search/ui/SearchForm";
import { PopularDestinations } from './PopularDestinations';
import { DealsSection } from './DealsSection';
import { PropertyTypes } from './PropertyTypes';

export function HomePage() {
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
            Find your next stay
        </h1>
        <p style={{margin: 0, fontSize:18, opacity:0.9}}>
            Browse hotels and make a booking in a few clicks.
        </p>
        <Link to="/hotels" style={{ color: 'white', textDecoration: 'underline' }}>Browse hotels →</Link>
          <SearchForm/>
      </section>

      <PopularDestinations />
      <DealsSection />
      <PropertyTypes />
    </>
  );
}
