import { Form, Input, Alert, Row, Col, Segmented } from 'antd';
import { MailOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../model/AuthContext';
import type { RegisterDto } from '../api/authApi';
import { AppButton } from '@shared/ui';

interface Props {
  onSuccess?: (message: string) => void;
}

export function RegisterForm({ onSuccess }: Props) {
  const { t } = useTranslation();
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
        t('auth.register.registrationFailed'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      autoComplete="on"
      initialValues={{ accountType: 'Customer' }}
    >
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Form.Item label={t('auth.register.iWantTo')} name="accountType">
        <Segmented
          block
          size="large"
          options={[
            { label: t('auth.register.bookStays'), value: 'Customer' },
            { label: t('auth.register.listMyProperty'), value: 'Realtor' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label={t('auth.email')}
        name="email"
        rules={[{ required: true, message: t('auth.register.emailRequired') }, { type: 'email', message: t('auth.register.emailInvalid') }]}
      >
        <Input prefix={<MailOutlined />} placeholder={t('auth.email')} size="large" />
      </Form.Item>

      <Form.Item
        label={t('auth.register.username')}
        name="userName"
        rules={[{ required: true, message: t('auth.register.usernameRequired') }, { min: 3, max: 64, message: t('auth.register.usernameLength') }]}
      >
        <Input prefix={<UserOutlined />} placeholder={t('auth.register.username')} size="large" />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label={t('auth.register.firstName')}
            name="firstName"
            rules={[{ required: true, message: t('auth.register.required') }, { max: 100 }]}
          >
            <Input placeholder={t('auth.register.firstName')} size="large" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('auth.register.lastName')}
            name="lastName"
            rules={[{ required: true, message: t('auth.register.required') }, { max: 100 }]}
          >
            <Input placeholder={t('auth.register.lastName')} size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label={t('auth.password')}
        name="password"
        rules={[{ required: true, message: t('auth.register.passwordRequired') }, { min: 8, message: t('auth.register.passwordLength') }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} size="large" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <AppButton variant="primary" htmlType="submit" loading={busy} block size="large">
          {t('auth.register.createAccount')}
        </AppButton>
      </Form.Item>
    </Form>
  );
}
