import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from '@features/auth';
import { useChatNotifications } from '@features/chat';
import { Logo } from "@shared/ui/Logo";
import { SettingsMenu } from "@shared/ui";
import { Drawer, Button, Badge, Avatar } from "antd";
import { UserOutlined, SendOutlined, MenuOutlined, DashboardOutlined } from '@ant-design/icons';


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
  // Solid blue pill, matching the Figma design system's header buttons (Frame202) and
  // icon buttons (Group108/109) — replaces the earlier transparent/outlined style.
  const solidButtonStyle = {
    backgroundColor: '#2563EB' as const,
    color: '#F8FAFF' as const,
    border: 'none' as const,
  };
  const iconButtonStyle = solidButtonStyle;
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useChatNotifications();
  const avatarSrc = user?.photo && user.photo.startsWith('http') ? user.photo : undefined;


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
              {user!.roles.includes('Admin') && (
                <Button
                  shape="round"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="/admin"
                  icon={<DashboardOutlined />}
                  style={iconButtonStyle}
                >
                  {t('header.adminPanel')}
                </Button>
              )}
              <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                <Button
                  type="text"
                  shape="circle"
                  style={iconButtonStyle}
                  aria-label={t('header.messages')}
                  icon={<SendOutlined style={iconStyle} />}
                  onClick={() => navigate('/messages')}
                />
              </Badge>
              <Avatar
                size={36}
                src={avatarSrc}
                icon={avatarSrc ? undefined : <UserOutlined />}
                style={{ cursor: 'pointer', border: '2px solid rgba(255,255,255,0.5)' }}
                onClick={() => navigate('/profile')}
                aria-label={t('header.myProfile')}
              />
            </>
          ) : (
            <>
              <Button shape="round" href="/register" style={solidButtonStyle}>
                {t('header.registration')}
              </Button>
              <Button shape="round" href="/login" style={solidButtonStyle}>
                {t('header.signIn')}
              </Button>
            </>
          )}
          <SettingsMenu buttonStyle={solidButtonStyle} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SettingsMenu />
                <span>{t('profile.tabs.preferences')}</span>
            </div>
            {isAuthenticated ? (
                <>
                    {user!.roles.includes('Realtor') && <Button href="/host">{t('header.myHotels')}</Button>}
                    {user!.roles.includes('Admin') && (
                      <Button target="_blank" rel="noopener noreferrer" href="/admin" icon={<DashboardOutlined />}>
                        {t('header.adminPanel')}
                      </Button>
                    )}
                    <Button href="/profile">{t('header.myAccount')}</Button>
                </>
            ) : (
                <>
                <Button type="primary" href='/login'>{t('header.signIn')}</Button>
                <Button type="primary" href="/register">{t('header.registration')}</Button>
                </>
            )}
        </div>
    </Drawer>
</>
  );
}
