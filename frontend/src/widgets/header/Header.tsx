import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Logo } from "@shared/ui/Logo";
import { Button } from "antd";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navLinkStyle = { color: 'inherit' as const, textDecoration: 'none' as const};
  
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
        <Link to="/" style={{textDecoration: 'none'}}>
            <Logo/>
        </Link>
        <Link to="/" style={navLinkStyle}>Main</Link>
        <Link to="/hotels" style={navLinkStyle}>Hotels</Link>
        <Link to="/tickets" style={navLinkStyle}>Tickets</Link>
        <Link to="/transport" style={navLinkStyle}>Transport</Link>
        <Link to="/nearby" style={navLinkStyle}>Nearby</Link>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/profile" style={navLinkStyle}>
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
            <Link to="/login" style={navLinkStyle}>Sign in</Link>
            <Button type="primary" href="/register">Registration</Button>  
          </>
        )}
      </div>
    </header>
  );
}
