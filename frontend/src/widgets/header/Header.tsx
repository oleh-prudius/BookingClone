import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border)', 
        background: 'var(--triply-navyDarkest)',
        color: 'white'
    }}>
      <Link to="/" style={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>
        BookingClone
      </Link>
      <Link to="/hotels" style={{color: 'inherit', textDecoration: 'none' }}>Hotels</Link>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
              {user!.firstName} {user!.lastName}
            </Link>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{color: 'inherit', textDecoration: 'none' }}>Sign in</Link>
            <Link to="/register" style={{color: 'inherit', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
