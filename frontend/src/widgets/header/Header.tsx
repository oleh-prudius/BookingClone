import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useAuth } from '@features/auth';
import { Logo } from "@shared/ui/Logo";
import { Drawer, Button } from "antd";
import { BellOutlined, UserOutlined, SendOutlined, MenuOutlined } from '@ant-design/icons';


export function Header() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const iconStyle = { fontSize: 18 as const, cursor: 'pointer' as const};
  const navLinkStyle = ({isActive}: {isActive:boolean} )=> ({
          color: 'inherit' as const,
          fontWeight: isActive ? 700 : 400,
          textDecoration: 'none' as const
      });
  const [isOpen, setIsOpen] = useState(false);
  
  
  return (
      <>
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
        
        <nav className="desktop-nav" style={{ gap:24, flex: 1, justifyContent: 'center'}}>
            <NavLink to="/" end style={navLinkStyle}>Main</NavLink>
            <NavLink to="/hotels" style={navLinkStyle}>Hotels</NavLink>
            <NavLink to="/tickets" style={navLinkStyle}>Tickets</NavLink>
            <NavLink to="/transport" style={navLinkStyle}>Transport</NavLink>
            <NavLink to="/nearby" style={navLinkStyle}>Nearby</NavLink>
        </nav>
        
        <Button
            className="burger-btn"
            type="text"
            shape="circle"
            aria-label="Open menu"
            icon={<MenuOutlined style={{ fontSize: 22, color: 'inherit' }} />}
            style={{ marginLeft: 'auto', color: 'inherit' }}
            onClick={() => setIsOpen(true)}
        />

      <div className='desktop-nav' style={{ marginLeft: 'auto', gap: 12, alignItems: 'center' }}>
          {isAuthenticated ? (
            <NavLink to="/profile" style={navLinkStyle}>
              {user!.firstName} {user!.lastName}
            </NavLink>
          ) : (
            <>
              <Button ghost shape="round" href="/register">Registration</Button>
              <Button ghost shape="round" href="/login">Sign in</Button>
            </>
          )}
          <Button type="text" shape="circle" style={{ color: 'inherit' }} aria-label="Messages" icon={<SendOutlined style={iconStyle} />} />
          <Button type="text" shape="circle" style={{ color: 'inherit' }} aria-label="Notifications" icon={<BellOutlined style={iconStyle} />} />
          <Button
            type="text"
            shape="circle"
            style={{ color: 'inherit' }}
            aria-label={isAuthenticated ? 'My profile' : 'Sign in'}
            icon={<UserOutlined style={iconStyle} />}
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          />
      </div>
    </header>
          
    <Drawer open={isOpen} onClose={()=> setIsOpen(false)} placement="left">
        <nav style={{display: 'flex', flexDirection: "column", gap:24, flex: 1, justifyContent: 'center'}}>
            <NavLink to="/" end style={navLinkStyle}>Main</NavLink>
            <NavLink to="/hotels" style={navLinkStyle}>Hotels</NavLink>
            <NavLink to="/tickets" style={navLinkStyle}>Tickets</NavLink>
            <NavLink to="/transport" style={navLinkStyle}>Transport</NavLink>
            <NavLink to="/nearby" style={navLinkStyle}>Nearby</NavLink>
        </nav>
        <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:12}}>
            {isAuthenticated ? (
                <Button href="/profile">My account</Button>
            ) : (
                <>
                <Button href='/login'>Sign in</Button>
                <Button type = 'primary' href="/register">Registration</Button>
                </>
            )}
        </div>
    </Drawer>
</>
  );
}
