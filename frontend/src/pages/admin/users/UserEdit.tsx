import { Edit, useForm } from '@refinedev/antd';
import { Form, Select, Typography } from 'antd';

interface UserAdminRecord {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function UserEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm<UserAdminRecord>();
  const record = queryResult?.data?.data;

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Typography.Paragraph>
        <strong>Email:</strong> {record?.email}
      </Typography.Paragraph>
      <Typography.Paragraph>
        <strong>Name:</strong> {record?.firstName} {record?.lastName}
      </Typography.Paragraph>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Role" name="role" rules={[{ required: true }]}>
          <Select options={[{ value: 'Customer' }, { value: 'Realtor' }, { value: 'Admin' }]} />
        </Form.Item>
      </Form>
    </Edit>
  );
}
