import { useState } from 'react';
import { Form, Input, Row, Col, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { UserOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuth } from '../model/AuthContext';
import type { UpdateProfileDto } from '../api/authApi';
import { AppButton } from '@shared/ui';

interface Props {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: Props) {
  const { t } = useTranslation();
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
      setError(axiosErr.response?.data?.error ?? t('profile.updateFailed'));
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
          <Form.Item label={t('auth.register.firstName')} name="firstName" rules={[{ required: true, message: t('auth.register.required') }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Jane" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t('auth.register.lastName')} name="lastName" rules={[{ required: true, message: t('auth.register.required') }]}>
            <Input prefix={<IdcardOutlined />} placeholder="Doe" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={t('auth.email')}
        name="email"
        rules={[{ required: true, message: t('auth.register.required') }, { type: 'email', message: t('auth.register.emailInvalid') }]}
      >
        <Input prefix={<MailOutlined />} placeholder="jane.doe@example.com" />
      </Form.Item>

      <Form.Item
        label={t('auth.register.username')}
        name="userName"
        rules={[{ required: true, message: t('auth.register.required') }, { min: 3, message: t('profile.usernameMinLength') }]}
      >
        <Input prefix={<UserOutlined />} placeholder="jane_doe" />
      </Form.Item>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />}
      {success && <Alert type="success" message={t('profile.updateSuccess')} style={{ marginBottom: 16 }} showIcon />}

      <Form.Item style={{ marginBottom: 0 }}>
        <AppButton variant="primary" htmlType="submit" loading={busy}>
          {t('profile.saveChanges')}
        </AppButton>
      </Form.Item>
    </Form>
  );
}
