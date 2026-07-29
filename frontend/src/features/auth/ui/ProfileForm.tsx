import { useState } from 'react';
import { Form, Input, Row, Col, Alert } from 'antd';
import { UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../model/AuthContext';
import type { UpdateProfileDto } from '../api/authApi';
import { AppButton } from '@shared/ui';

interface Props {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: Props) {
  const { user, updateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (values: UpdateProfileDto) => {
    setError(null);
    setSuccess(false);
    setBusy(true);
    try {
      await updateProfile(values);
      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form
      layout="vertical"
      style={{ maxWidth: 420 }}
      initialValues={{
        email: user?.email ?? '',
        userName: user?.userName ?? '',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
      }}
      onFinish={onSubmit}
      onValuesChange={() => setSuccess(false)}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="First name" name="firstName" rules={[{ required: true, message: 'Required' }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Jane" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last name" name="lastName" rules={[{ required: true, message: 'Required' }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Doe" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Enter a valid email' }]}
      >
        <Input prefix={<MailOutlined />} placeholder="jane.doe@example.com" />
      </Form.Item>

      <Form.Item
        label="Username"
        name="userName"
        rules={[{ required: true, message: 'Required' }, { min: 3, message: 'At least 3 characters' }]}
      >
        <Input prefix={<UserOutlined />} placeholder="jane_doe" />
      </Form.Item>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}
      {success && <Alert type="success" message="Profile updated!" style={{ marginBottom: 16 }} showIcon />}

      <Form.Item style={{ marginBottom: 0 }}>
        <AppButton variant="primary" htmlType="submit" loading={busy}>
          Save changes
        </AppButton>
      </Form.Item>
    </Form>
  );
}
