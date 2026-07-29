import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@features/auth/api/authApi';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const msg = await authApi.forgotPassword(email);
      setMessage(msg);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? t('auth.somethingWentWrong'));
    } finally {
      setBusy(false);
    }
  };

  if (message) {
    return (
      <section style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
        <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8 }}>
          {message}
        </div>
        <p style={{ marginTop: 12 }}>
          <Link to="/login">{t('auth.backToSignIn')}</Link>
        </p>
      </section>
    );
  }

  return (
    <section style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
        <h2>{t('auth.forgotPassword.title')}</h2>
        <p style={{ margin: 0, color: '#555' }}>
          {t('auth.forgotPassword.description')}
        </p>
        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button type="submit" disabled={busy}>{busy ? '…' : t('auth.forgotPassword.sendResetLink')}</button>
      </form>
      <p style={{ marginTop: 12 }}>
        <Link to="/login">{t('auth.backToSignIn')}</Link>
      </p>
    </section>
  );
}
