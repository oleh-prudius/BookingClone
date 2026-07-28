import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, DatePicker, Popover, Button } from 'antd';
import { AppButton } from '@shared/ui';
import { SearchOutlined, UserOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';

function GuestCounter({
  label,
  description,
  value,
  min,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  onChange: (val: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#888' }}>{description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Button
          icon={<MinusOutlined />}
          shape="circle"
          size="small"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        />
        <span style={{ minWidth: 20, textAlign: 'center' }}>{value}</span>
        <Button
          icon={<PlusOutlined />}
          shape="circle"
          size="small"
          onClick={() => onChange(value + 1)}
        />
      </div>
    </div>
  );
}

export function SearchForm() {
  const [destination, setDestination] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const navigate = useNavigate();

  const guestLabel = children > 0
    ? `${adults} adult${adults > 1 ? 's' : ''} · ${children} child${children > 1 ? 'ren' : ''}`
    : `${adults} adult${adults > 1 ? 's' : ''}`;

  const handleSearch = () => {
    if (!destination) return;
    navigate(`/hotels?destination=${destination}&adults=${adults}&children=${children}`);
  };

  const guestPopover = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 260 }}>
      <GuestCounter
        label="Adults"
        description="Ages 18+"
        value={adults}
        min={1}
        onChange={setAdults}
      />
      <GuestCounter
        label="Children"
        description="Ages 0–17"
        value={children}
        min={0}
        onChange={setChildren}
      />
      <AppButton variant="primary" onClick={() => setGuestOpen(false)}>
        Done
      </AppButton>
    </div>
  );

  return (
    <div style={{
      background: 'white',
      borderRadius: 8,
      padding: 16,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center',
      width: '100%',
      maxWidth: 900,
    }}>
      <Input
        placeholder="Where are you going?"
        prefix={<SearchOutlined />}
        value={destination}
        onChange={e => setDestination(e.target.value)}
        style={{ flex: 2, minWidth: 200 }}
      />
      <DatePicker.RangePicker
        style={{ flex: 2, minWidth: 240 }}
        placeholder={['Check-in', 'Check-out']}
      />
      <Popover
        content={guestPopover}
        trigger="click"
        open={guestOpen}
        onOpenChange={setGuestOpen}
        placement="bottom"
      >
        <Button
          icon={<UserOutlined />}
          style={{ flex: 1, minWidth: 160, textAlign: 'left' }}
        >
          {guestLabel}
        </Button>
      </Popover>
      <AppButton variant="primary" onClick={handleSearch}>
        Search
      </AppButton>
    </div>
  );
}
