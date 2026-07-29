import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AutoComplete, Input, DatePicker, Popover, Button } from 'antd';
import { AppButton } from '@shared/ui';
import { SearchOutlined, UserOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { cityApi, type City } from '@entities/city';

const DESTINATION_DEBOUNCE_MS = 250;

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
  const [destinationQuery, setDestinationQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cityApi.getAll().then(setCities).catch(() => setCities([]));
  }, []);

  // Debounce the typed query before filtering, so fast typing doesn't re-filter on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => setDestinationQuery(destination), DESTINATION_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [destination]);

  const options = useMemo(() => {
    const query = destinationQuery.trim().toLowerCase();
    if (!query) return [];
    return cities
      .filter((c) => c.name.toLowerCase().includes(query) || c.countryName.toLowerCase().includes(query))
      .slice(0, 8)
      .map((c) => ({ value: c.name, label: `${c.name}, ${c.countryName}` }));
  }, [cities, destinationQuery]);

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
      <AutoComplete
        options={options}
        value={destination}
        onChange={setDestination}
        onSelect={setDestination}
        style={{ flex: 2, minWidth: 200 }}
      >
        <Input placeholder="Where are you going?" prefix={<SearchOutlined />} />
      </AutoComplete>
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
