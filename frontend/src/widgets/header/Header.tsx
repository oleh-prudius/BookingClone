import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useAuth } from '@features/auth';
import { Logo } from "@shared/ui/Logo";
import { Drawer, Button } from "antd";
import { BellOutlined, UserOutlined, SendOutlined, MenuOutlined } from '@ant-design/icons';


export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const iconStyle = { fontSize: 18 as const, cursor: 'pointer' as const};
  const navLinkStyle = ({isActive}: {isActive:boolean} )=> ({
          color: isActive ? 'var(--triply-blue)' : 'inherit' as const,
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
        background: 'var(--triply-primary)',
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
        
        <MenuOutlined 
            className="burger-btn"
            style={{ fontSize:22, cursor: 'pointer', marginLeft: 'auto'}}
            onClick={() => setIsOpen(true)
            }
        />
        
      <div className='desktop-nav' style={{ marginLeft: 'auto', gap: 12, alignItems: 'center' }}>
          <Button ghost shape="round" href="/register">Registration</Button>
          
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
              <Button ghost shape="round" href="/login">Sign in</Button>
          </>
        )}
          <SendOutlined style={iconStyle}/>
          <BellOutlined style={iconStyle}/>
          <UserOutlined style={iconStyle}/>
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
                <button onClick={handleLogout}>Sign out</button>    
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
