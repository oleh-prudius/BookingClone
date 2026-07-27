import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Logo } from "@shared/ui/Logo";
import { Button } from "antd";
import { BellOutlined, UserOutlined, SendOutlined } from '@ant-design/icons';


export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const iconStyle = { fontSize: 18 as const, cursor: 'pointer' as const};
  const navLinkStyle = ({isActive}: {isActive:boolean} )=> ({
          color: isActive ? 'var(--triply-primary)' : 'inherit' as const,
          textDecoration: 'none' as const
      });  
  
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
        <NavLink to="/" style={{textDecoration: 'none'}}>
            <Logo/>
        </NavLink>
        <NavLink to="/" end style={navLinkStyle}>Main</NavLink>
        <NavLink to="/hotels" style={navLinkStyle}>Hotels</NavLink>
        <NavLink to="/tickets" style={navLinkStyle}>Tickets</NavLink>
        <NavLink to="/transport" style={navLinkStyle}>Transport</NavLink>
        <NavLink to="/nearby" style={navLinkStyle}>Nearby</NavLink>
        
        
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <SendOutlined style={iconStyle}/>
          <BellOutlined style={iconStyle}/>
          <UserOutlined style={iconStyle}/>
          
          {isAuthenticated ? (
          <>
            <NavLink to="/profile" style={navLinkStyle}>
              {user!.firstName} {user!.lastName}
            </NavLink>
            <button
              onClick={handleLogout}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={navLinkStyle}>Sign in</NavLink>
            <Button type="primary" href="/register">Registration</Button>  
          </>
        )}
      </div>
    </header>
  );
}
