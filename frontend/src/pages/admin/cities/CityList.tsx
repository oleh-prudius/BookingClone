import { List, useTable, EditButton, DeleteButton } from '@refinedev/antd';
import { Table, Space } from 'antd';

export function CityList() {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { mode: 'off' } });
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} sorter={(a: { id: number }, b: { id: number }) => a.id - b.id} />
        <Table.Column dataIndex="name" title="Name" sorter={(a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)} />
        <Table.Column dataIndex="countryName" title="Country" sorter={(a: { countryName: string }, b: { countryName: string }) => a.countryName.localeCompare(b.countryName)} />
        <Table.Column dataIndex="latitude" title="Lat" render={(v: number) => v?.toFixed(4)} sorter={(a: { latitude: number }, b: { latitude: number }) => a.latitude - b.latitude} />
        <Table.Column dataIndex="longitude" title="Lng" render={(v: number) => v?.toFixed(4)} sorter={(a: { longitude: number }, b: { longitude: number }) => a.longitude - b.longitude} />
        <Table.Column
          title="Actions"
          render={(_: unknown, record: { id: number }) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
