import { Form, Input, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../model/AuthContext';
import type { LoginDto } from '../api/authApi';
import { AppButton } from '@shared/ui';

interface Props {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: Props) {
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
      setError(axiosErr.response?.data?.error ?? 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false} autoComplete="on">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form.Item
        label="Email or username"
        name="emailOrUserName"
        rules={[{ required: true, message: 'Please enter your email or username' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Email or username" size="large" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <AppButton variant="primary" htmlType="submit" loading={busy} block size="large">
          Sign in
        </AppButton>
      </Form.Item>
    </Form>
  );
}
