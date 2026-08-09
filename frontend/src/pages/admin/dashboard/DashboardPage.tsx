import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, Table, Empty } from 'antd';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { adminStatsApi } from './adminStatsApi';
import type { AdminStats } from './adminStatsApi';

interface BookingStatusCountEntry {
  status: string;
  count: number;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#faad14',
  Confirmed: '#52c41a',
  Cancelled: '#f5222d',
  Completed: '#1677ff',
};

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStatsApi
      .get(30)
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <Empty description="Failed to load stats" style={{ padding: 48 }} />;
  }

  const totalBookings = stats.bookingsOverTime.reduce((sum, p) => sum + p.count, 0);
  const totalRevenue = stats.bookingsOverTime.reduce((sum, p) => sum + p.revenue, 0);
  const totalSignups = stats.newUserSignupsOverTime.reduce((sum, p) => sum + p.count, 0);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Bookings (last 30 days)" value={totalBookings} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Revenue (last 30 days)" value={totalRevenue} precision={2} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="New signups (last 30 days)" value={totalSignups} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="Bookings & revenue over time">
            {stats.bookingsOverTime.length === 0 ? (
              <Empty description="No bookings in this period" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.bookingsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="count" name="Bookings" stroke="#1677ff" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#52c41a" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Booking status breakdown">
            {stats.bookingStatusBreakdown.length === 0 ? (
              <Empty description="No bookings yet" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.bookingStatusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    outerRadius={100}
                    label={(entry: BookingStatusCountEntry) => `${entry.status}: ${entry.count}`}
                  >
                    {stats.bookingStatusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Top hotels by revenue">
            {stats.topHotels.length === 0 ? (
              <Empty description="No bookings yet" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topHotels} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="hotelName" width={140} />
                  <Tooltip />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#2F86F0" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top hotels — details">
            <Table
              dataSource={stats.topHotels}
              rowKey="hotelId"
              pagination={false}
              size="small"
              columns={[
                { title: 'Hotel', dataIndex: 'hotelName' },
                { title: 'Bookings', dataIndex: 'bookingsCount' },
                { title: 'Revenue', dataIndex: 'revenue', render: (v: number) => `$${v.toFixed(2)}` },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
