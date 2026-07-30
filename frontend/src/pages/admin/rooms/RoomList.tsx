import { List, useTable, EditButton, DeleteButton } from '@refinedev/antd';
import { Table, Space } from 'antd';

export function RoomList() {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { mode: 'off' } });
  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} sorter={(a: { id: number }, b: { id: number }) => a.id - b.id} />
        <Table.Column dataIndex="name" title="Name" sorter={(a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)} />
        <Table.Column dataIndex="hotelId" title="Hotel ID" width={100} sorter={(a: { hotelId: number }, b: { hotelId: number }) => a.hotelId - b.hotelId} />
        <Table.Column dataIndex="area" title="Area m²" render={(v: number) => `${v} m²`} sorter={(a: { area: number }, b: { area: number }) => a.area - b.area} />
        <Table.Column dataIndex="numberOfRooms" title="Rooms" width={80} sorter={(a: { numberOfRooms: number }, b: { numberOfRooms: number }) => a.numberOfRooms - b.numberOfRooms} />
        <Table.Column dataIndex="quantity" title="Qty" width={80} sorter={(a: { quantity: number }, b: { quantity: number }) => a.quantity - b.quantity} />
        <Table.Column dataIndex="roomTypeId" title="Type ID" width={100} sorter={(a: { roomTypeId: number }, b: { roomTypeId: number }) => a.roomTypeId - b.roomTypeId} />
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
