import { NavLink } from 'react-router-dom';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import { Logo } from '@shared/ui/Logo';

const linkStyle = { color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14 };
const headingStyle = { color: 'white', fontWeight: 600, fontSize: 15, marginBottom: 14 };
const socialIconStyle = { fontSize: 20, color: 'rgba(255,255,255,0.75)' };

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{ background: 'var(--triply-navyDarkest)', color: 'white', marginTop: 48 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 32,
        }}
      >
        <div>
          <Logo />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 12, maxWidth: 240 }}>
            {t('footer.tagline')}
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FacebookOutlined style={socialIconStyle} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramOutlined style={socialIconStyle} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <TwitterOutlined style={socialIconStyle} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedinOutlined style={socialIconStyle} />
            </a>
          </div>
        </div>

        <div>
          <div style={headingStyle}>{t('footer.explore')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <NavLink to="/hotels" style={linkStyle}>{t('header.hotels')}</NavLink>
            <NavLink to="/tickets" style={linkStyle}>{t('header.tickets')}</NavLink>
            <NavLink to="/transport" style={linkStyle}>{t('header.transport')}</NavLink>
            <NavLink to="/nearby" style={linkStyle}>{t('header.nearby')}</NavLink>
          </div>
        </div>

        <div>
          <div style={headingStyle}>{t('footer.company')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <NavLink to="/about" style={linkStyle}>{t('footer.about')}</NavLink>
            <NavLink to="/careers" style={linkStyle}>{t('footer.careers')}</NavLink>
            <NavLink to="/contact" style={linkStyle}>{t('footer.contact')}</NavLink>
          </div>
        </div>

        <div>
          <div style={headingStyle}>{t('footer.support')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <NavLink to="/help" style={linkStyle}>{t('footer.help')}</NavLink>
            <NavLink to="/terms" style={linkStyle}>{t('footer.terms')}</NavLink>
            <NavLink to="/privacy" style={linkStyle}>{t('footer.privacy')}</NavLink>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', padding: '16px 24px', textAlign: 'center' }}>
        <Typography.Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          {t('footer.copyright', { version: __APP_VERSION__, year: new Date().getFullYear() })}
        </Typography.Text>
      </div>
    </footer>
  );
}
