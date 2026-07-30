import { List, useTable, ShowButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import type { BookingStatus } from '@shared/types';

const statusColor: Record<BookingStatus, string> = {
  Pending: 'orange',
  Confirmed: 'green',
  Cancelled: 'red',
  Completed: 'blue',
};

export function BookingList() {
  const { tableProps } = useTable({ syncWithLocation: true, resource: 'bookings/admin/all', sorters: { mode: 'off' } });

  return (
    <List canCreate={false}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} sorter={(a: { id: number }, b: { id: number }) => a.id - b.id} />
        <Table.Column dataIndex="hotelId" title="Hotel ID" sorter={(a: { hotelId: number }, b: { hotelId: number }) => a.hotelId - b.hotelId} />
        <Table.Column
          dataIndex="checkIn"
          title="Check In"
          render={(v: string) => new Date(v).toLocaleDateString()}
          sorter={(a: { checkIn: string }, b: { checkIn: string }) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()}
        />
        <Table.Column
          dataIndex="checkOut"
          title="Check Out"
          render={(v: string) => new Date(v).toLocaleDateString()}
          sorter={(a: { checkOut: string }, b: { checkOut: string }) => new Date(a.checkOut).getTime() - new Date(b.checkOut).getTime()}
        />
        <Table.Column
          dataIndex="totalPrice"
          title="Total Price"
          render={(v: number) => `$${v.toFixed(2)}`}
          sorter={(a: { totalPrice: number }, b: { totalPrice: number }) => a.totalPrice - b.totalPrice}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(v: BookingStatus) => <Tag color={statusColor[v]}>{v}</Tag>}
          sorter={(a: { status: string }, b: { status: string }) => a.status.localeCompare(b.status)}
        />
        <Table.Column
          title="Actions"
          render={(_: unknown, record: { id: number }) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
