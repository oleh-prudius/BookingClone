import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Alert } from 'antd';
import { RegisterForm } from '@features/auth';
import { Logo } from '@shared/ui';

export function RegisterPage() {
  const { t } = useTranslation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <section
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--triply-backgroundLight)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: 440, borderRadius: 12 }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--triply-navyDarkest)',
              borderRadius: 12,
              padding: '10px 16px',
              marginBottom: 16,
            }}
          >
            <Logo />
          </div>
          <Typography.Title level={3} style={{ margin: 0 }}>{t('auth.register.createYourAccount')}</Typography.Title>
          <Typography.Text type="secondary">{t('auth.register.joinToStartBooking')}</Typography.Text>
        </div>

        {successMessage ? (
          <>
            <Alert
              type="success"
              showIcon
              message={t('auth.register.almostThere')}
              description={successMessage}
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary">{t('auth.register.didntReceiveIt')} </Typography.Text>
              <Link to="/resend-confirmation">{t('auth.register.resendConfirmationEmail')}</Link>
            </div>
          </>
        ) : (
          <>
            <RegisterForm onSuccess={(msg) => setSuccessMessage(msg)} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Typography.Text type="secondary">{t('auth.register.alreadyHaveAccount')} </Typography.Text>
              <Link to="/login">{t('auth.login.signIn')}</Link>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
