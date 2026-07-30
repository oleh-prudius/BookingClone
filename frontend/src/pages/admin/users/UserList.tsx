import { List, useTable, EditButton } from '@refinedev/antd';
import { Table, Form, Input, Select, Button, Tag, Space } from 'antd';
import type { CrudFilters } from '@refinedev/core';

interface UserAdminRecord {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailConfirmed: boolean;
}

interface SearchValues {
  search?: string;
  role?: string;
}

export function UserList() {
  const { tableProps, searchFormProps } = useTable<UserAdminRecord>({
    syncWithLocation: true,
    sorters: { mode: 'off' },
    onSearch: (values: SearchValues) => {
      const filters: CrudFilters = [];
      if (values.search) filters.push({ field: 'search', operator: 'eq', value: values.search });
      if (values.role) filters.push({ field: 'role', operator: 'eq', value: values.role });
      return filters;
    },
  });

  return (
    <List>
      <Form {...searchFormProps} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="search">
          <Input.Search
            placeholder="Search by email or name"
            allowClear
            style={{ width: 280 }}
            onSearch={() => searchFormProps.form?.submit()}
          />
        </Form.Item>
        <Form.Item name="role">
          <Select
            allowClear
            placeholder="Filter by role"
            style={{ width: 160 }}
            options={[{ value: 'Customer' }, { value: 'Realtor' }, { value: 'Admin' }]}
            onChange={() => searchFormProps.form?.submit()}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Search</Button>
        </Form.Item>
      </Form>

      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} sorter={(a: UserAdminRecord, b: UserAdminRecord) => a.id - b.id} />
        <Table.Column dataIndex="email" title="Email" sorter={(a: UserAdminRecord, b: UserAdminRecord) => a.email.localeCompare(b.email)} />
        <Table.Column
          title="Name"
          render={(_: unknown, record: UserAdminRecord) => `${record.firstName} ${record.lastName}`}
        />
        <Table.Column dataIndex="role" title="Role" render={(role: string) => <Tag>{role}</Tag>} />
        <Table.Column
          dataIndex="emailConfirmed"
          title="Email confirmed"
          render={(confirmed: boolean) => (confirmed ? 'Yes' : 'No')}
        />
        <Table.Column
          title="Actions"
          render={(_: unknown, record: UserAdminRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
