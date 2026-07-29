import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@features/auth/api/authApi';

type Status = 'loading' | 'success' | 'error';

export function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userId = Number(params.get('userId'));
    const token = params.get('token') ?? '';

    if (!userId || !token) {
      setMessage(t('auth.confirmEmail.invalidLink'));
      setStatus('error');
      return;
    }

    authApi.confirmEmail(userId, token)
      .then((msg) => { setMessage(msg); setStatus('success'); })
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setMessage(axiosErr.response?.data?.error ?? t('auth.confirmEmail.confirmationFailed'));
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <section style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h2>{t('auth.confirmEmail.title')}</h2>
      {status === 'loading' && <p>{t('auth.confirmEmail.confirming')}</p>}
      {status === 'success' && (
        <>
          <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8 }}>
            {message}
          </div>
          <p style={{ marginTop: 12 }}>
            <Link to="/login">{t('auth.login.signIn')}</Link>
          </p>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8 }}>
            {message}
          </div>
          <p style={{ marginTop: 12 }}>
            <Link to="/resend-confirmation">{t('auth.register.resendConfirmationEmail')}</Link>
          </p>
        </>
      )}
    </section>
  );
}
