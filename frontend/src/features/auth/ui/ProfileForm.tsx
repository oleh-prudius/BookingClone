import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../model/AuthContext';
import type { UpdateProfileDto } from '../api/authApi';

interface Props {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: Props) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState<UpdateProfileDto>({
    email: user?.email ?? '',
    userName: user?.userName ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setBusy(true);
    try {
      await updateProfile(form);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setBusy(false);
    }
  };

  const upd = (k: keyof UpdateProfileDto) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
      <input placeholder="Email" type="email" value={form.email} onChange={upd('email')} required />
      <input placeholder="Username" value={form.userName} onChange={upd('userName')} required minLength={3} />
      <input placeholder="First name" value={form.firstName} onChange={upd('firstName')} required />
      <input placeholder="Last name" value={form.lastName} onChange={upd('lastName')} required />
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Profile updated!</div>}
      <button type="submit" disabled={busy}>{busy ? '…' : 'Save'}</button>
    </form>
  );
}
