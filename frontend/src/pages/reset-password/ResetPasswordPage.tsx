import { useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@features/auth/api/authApi';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const token = params.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!email || !token) {
    return (
      <section style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
        <div style={{ padding: 16, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8 }}>
          {t('auth.resetPassword.invalidLink')}
        </div>
        <p style={{ marginTop: 12 }}>
          <Link to="/forgot-password">{t('auth.resetPassword.requestNewOne')}</Link>
        </p>
      </section>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError(t('auth.resetPassword.passwordsDoNotMatch'));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const msg = await authApi.resetPassword(email, token, newPassword);
      setMessage(msg);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? t('auth.resetPassword.resetFailed'));
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
          <Link to="/login">{t('auth.login.signIn')}</Link>
        </p>
      </section>
    );
  }

  return (
    <section style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
        <h2>{t('auth.resetPassword.title')}</h2>
        <input
          type="password"
          placeholder={t('auth.resetPassword.newPassword')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
        <input
          type="password"
          placeholder={t('auth.resetPassword.confirmNewPassword')}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
        />
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button type="submit" disabled={busy}>{busy ? '…' : t('auth.resetPassword.title')}</button>
      </form>
    </section>
  );
}
