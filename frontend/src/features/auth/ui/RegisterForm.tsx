import { Form, Input, Alert, Row, Col } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../model/AuthContext';
import type { RegisterDto } from '../api/authApi';
import { AppButton } from '@shared/ui';

interface Props {
  onSuccess?: (message: string) => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFinish = async (values: RegisterDto) => {
    setError(null);
    setBusy(true);
    try {
      const message = await register(values);
      onSuccess?.(message);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; errors?: string[]; title?: string } } };
      const d = axiosErr.response?.data;
      setError(
        d?.error ??
        (Array.isArray(d?.errors) ? d.errors.join('; ') : null) ??
        d?.title ??
        'Registration failed',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false} autoComplete="on">
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Enter a valid email' }]}
      >
        <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
      </Form.Item>

      <Form.Item
        label="Username"
        name="userName"
        rules={[{ required: true, message: 'Please choose a username' }, { min: 3, max: 64, message: 'Must be 3-64 characters' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Username" size="large" />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label="First name"
            name="firstName"
            rules={[{ required: true, message: 'Required' }, { max: 100 }]}
          >
            <Input placeholder="First name" size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Last name"
            name="lastName"
            rules={[{ required: true, message: 'Required' }, { max: 100 }]}
          >
            <Input placeholder="Last name" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: 'Please enter a password' }, { min: 8, message: 'At least 8 characters' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <AppButton variant="primary" htmlType="submit" loading={busy} block size="large">
          Create account
        </AppButton>
      </Form.Item>
    </Form>
  );
}
