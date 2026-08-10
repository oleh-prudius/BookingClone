import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AutoComplete, Input, DatePicker, Popover, Button } from 'antd';
import { AppButton } from '@shared/ui';
import { SearchOutlined, UserOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { cityApi, type City } from '@entities/city';
import { localizeCityName, localizeCountryName } from '@shared/lib/geoNames';

const DESTINATION_DEBOUNCE_MS = 250;

export function GuestCounter({
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
  const { t } = useTranslation();

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
          aria-label={t('search.decreaseGuest', { label: label.toLowerCase() })}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        />
        <span style={{ minWidth: 20, textAlign: 'center' }}>{value}</span>
        <Button
          icon={<PlusOutlined />}
          shape="circle"
          size="small"
          aria-label={t('search.increaseGuest', { label: label.toLowerCase() })}
          onClick={() => onChange(value + 1)}
        />
      </div>
    </div>
  );
}

export function SearchForm() {
  const { t, i18n } = useTranslation();
  // `destination` is the canonical English city name sent to the backend for search.
  // `inputText` is what's shown in the box — translated once a city is picked, so the
  // visible label matches the current UI language without changing what gets searched.
  const [destination, setDestination] = useState('');
  const [inputText, setInputText] = useState('');
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
    const timeout = setTimeout(() => setDestinationQuery(inputText), DESTINATION_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [inputText]);

  const options = useMemo(() => {
    const query = destinationQuery.trim().toLowerCase();
    if (!query) return [];
    return cities
      .filter((c) => {
        const localizedCity = localizeCityName(c.name, i18n.language).toLowerCase();
        const localizedCountry = localizeCountryName(c.countryName, i18n.language).toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.countryName.toLowerCase().includes(query) ||
          localizedCity.includes(query) ||
          localizedCountry.includes(query)
        );
      })
      .slice(0, 8)
      .map((c) => ({
        value: c.name,
        label: `${localizeCityName(c.name, i18n.language)}, ${localizeCountryName(c.countryName, i18n.language)}`,
      }));
  }, [cities, destinationQuery, i18n.language]);

  const handleInputChange = (value: string) => {
    setInputText(value);
    setDestination(value);
  };

  const handleSelect = (value: string) => {
    setDestination(value);
    setInputText(localizeCityName(value, i18n.language));
  };

  const guestLabel = children > 0
    ? `${t('search.adultsCount', { count: adults })} · ${t('search.childrenCount', { count: children })}`
    : t('search.adultsCount', { count: adults });

  const handleSearch = () => {
    if (!destination) return;
    navigate(`/hotels?destination=${destination}&adults=${adults}&children=${children}`);
  };

  const guestPopover = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 260 }}>
      <GuestCounter
        label={t('search.adults')}
        description={t('search.adultsDescription')}
        value={adults}
        min={1}
        onChange={setAdults}
      />
      <GuestCounter
        label={t('search.children')}
        description={t('search.childrenDescription')}
        value={children}
        min={0}
        onChange={setChildren}
      />
      <AppButton variant="primary" onClick={() => setGuestOpen(false)}>
        {t('common.done')}
      </AppButton>
    </div>
  );

  const pillFieldStyle = {
    background: 'var(--triply-navyDark)',
    borderColor: 'transparent',
    borderRadius: 999,
    color: 'white',
  };

  return (
    <div style={{
      background: 'var(--triply-blue)',
      borderRadius: 20,
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
        value={inputText}
        onChange={handleInputChange}
        onSelect={handleSelect}
        style={{ flex: 2, minWidth: 200 }}
      >
        <Input
          placeholder={t('search.destinationPlaceholder')}
          prefix={<SearchOutlined style={{ color: 'white' }} />}
          style={pillFieldStyle}
          className="triply-pill-input"
        />
      </AutoComplete>
      <DatePicker.RangePicker
        style={{ ...pillFieldStyle, flex: 2, minWidth: 240 }}
        className="triply-pill-input"
        placeholder={[t('search.checkIn'), t('search.checkOut')]}
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
          style={{ ...pillFieldStyle, flex: 1, minWidth: 160, textAlign: 'left' }}
        >
          {guestLabel}
        </Button>
      </Popover>
      <AppButton variant="primary" onClick={handleSearch}>
        {t('search.searchButton')}
      </AppButton>
    </div>
  );
}
