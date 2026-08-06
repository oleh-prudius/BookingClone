import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from '@features/auth';
import { Logo } from "@shared/ui/Logo";
import { LanguageSwitcher, ThemeToggle, CurrencySwitcher } from "@shared/ui";
import { Drawer, Button } from "antd";
import { BellOutlined, UserOutlined, SendOutlined, MenuOutlined } from '@ant-design/icons';


export function Header() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const iconStyle = { fontSize: 18 as const, cursor: 'pointer' as const};
  const navLinkStyle = ({isActive}: {isActive:boolean} )=> ({
          color: 'inherit' as const,
          fontWeight: isActive ? 700 : 500,
          textDecoration: 'none' as const,
          borderBottom: isActive ? '2px solid white' : '2px solid transparent',
          paddingBottom: 4,
      });
  const iconButtonStyle = {
    color: 'inherit' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  };
  const [isOpen, setIsOpen] = useState(false);


  return (
      <>
    <header style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      padding: '14px 24px',
        background: 'var(--triply-blue)',
        color: 'white'
    }}>
        <NavLink to="/" style={{textDecoration: 'none'}}>
            <Logo/>
        </NavLink>

        <nav className="desktop-nav" style={{ gap:24, flex: 1, justifyContent: 'center'}}>
            <NavLink to="/" end style={navLinkStyle}>{t('header.main')}</NavLink>
            <NavLink to="/hotels" style={navLinkStyle}>{t('header.hotels')}</NavLink>
            <NavLink to="/tickets" style={navLinkStyle}>{t('header.tickets')}</NavLink>
            <NavLink to="/transport" style={navLinkStyle}>{t('header.transport')}</NavLink>
            <NavLink to="/nearby" style={navLinkStyle}>{t('header.nearby')}</NavLink>
        </nav>

        <div className="desktop-nav" style={{ marginLeft: 'auto', gap: 4, alignItems: 'center' }}>
          <ThemeToggle />
          <CurrencySwitcher />
          <LanguageSwitcher />
        </div>

        <Button
            className="burger-btn"
            type="text"
            shape="circle"
            aria-label={t('header.openMenu')}
            icon={<MenuOutlined style={{ fontSize: 22, color: 'inherit' }} />}
            style={{ marginLeft: 'auto', color: 'inherit' }}
            onClick={() => setIsOpen(true)}
        />

      <div className='desktop-nav' style={{ gap: 12, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              {user!.roles.includes('Realtor') && (
                <NavLink to="/host" style={navLinkStyle}>{t('header.myHotels')}</NavLink>
              )}
              <NavLink to="/profile" style={navLinkStyle}>
                {user!.firstName} {user!.lastName}
              </NavLink>
            </>
          ) : (
            <>
              <Button
                shape="round"
                href="/register"
                style={{ backgroundColor: 'var(--triply-navyDark)', color: 'white', border: 'none' }}
              >
                {t('header.registration')}
              </Button>
              <Button ghost shape="round" href="/login">{t('header.signIn')}</Button>
            </>
          )}
          {isAuthenticated && (
            <Button
              type="text"
              shape="circle"
              style={iconButtonStyle}
              aria-label={t('header.messages')}
              icon={<SendOutlined style={iconStyle} />}
              onClick={() => navigate('/messages')}
            />
          )}
          <Button type="text" shape="circle" style={iconButtonStyle} aria-label={t('header.notifications')} icon={<BellOutlined style={iconStyle} />} />
          <Button
            type="text"
            shape="circle"
            style={iconButtonStyle}
            aria-label={isAuthenticated ? t('header.myProfile') : t('header.signIn')}
            icon={<UserOutlined style={iconStyle} />}
            onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          />
      </div>
    </header>

    <Drawer open={isOpen} onClose={()=> setIsOpen(false)} placement="left">
        <nav style={{display: 'flex', flexDirection: "column", gap:24, flex: 1, justifyContent: 'center'}}>
            <NavLink to="/" end style={navLinkStyle}>{t('header.main')}</NavLink>
            <NavLink to="/hotels" style={navLinkStyle}>{t('header.hotels')}</NavLink>
            <NavLink to="/tickets" style={navLinkStyle}>{t('header.tickets')}</NavLink>
            <NavLink to="/transport" style={navLinkStyle}>{t('header.transport')}</NavLink>
            <NavLink to="/nearby" style={navLinkStyle}>{t('header.nearby')}</NavLink>
        </nav>
        <div style={{marginTop:24, display:'flex', flexDirection:'column', gap:12}}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <ThemeToggle />
                <CurrencySwitcher />
                <LanguageSwitcher />
            </div>
            {isAuthenticated ? (
                <>
                    {user!.roles.includes('Realtor') && <Button href="/host">{t('header.myHotels')}</Button>}
                    <Button href="/profile">{t('header.myAccount')}</Button>
                </>
            ) : (
                <>
                <Button href='/login'>{t('header.signIn')}</Button>
                <Button type = 'primary' href="/register">{t('header.registration')}</Button>
                </>
            )}
        </div>
    </Drawer>
</>
  );
}
