import { Form, Input, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../model/AuthContext';
import type { LoginDto } from '../api/authApi';
import { AppButton } from '@shared/ui';

interface Props {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: Props) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFinish = async (values: LoginDto) => {
    setError(null);
    setBusy(true);
    try {
      await login(values);
      onSuccess?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? t('auth.login.loginFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false} autoComplete="on">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form.Item
        label={t('auth.login.emailOrUsername')}
        name="emailOrUserName"
        rules={[{ required: true, message: t('auth.login.emailOrUsernameRequired') }]}
      >
        <Input prefix={<UserOutlined />} placeholder={t('auth.login.emailOrUsername')} size="large" />
      </Form.Item>

      <Form.Item
        label={t('auth.password')}
        name="password"
        rules={[{ required: true, message: t('auth.login.passwordRequired') }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} size="large" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <AppButton variant="primary" htmlType="submit" loading={busy} block size="large">
          {t('auth.login.signIn')}
        </AppButton>
      </Form.Item>
    </Form>
  );
}
