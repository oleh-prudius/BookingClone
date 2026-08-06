import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { useCurrency } from '@shared/theme/CurrencyContext';
import { CURRENCY_CODES, CURRENCY_SYMBOLS } from '@shared/lib/currency';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const items: MenuProps['items'] = CURRENCY_CODES.map((code) => ({
    key: code,
    label: (
      <span>
        <span style={{ marginRight: 8 }}>{CURRENCY_SYMBOLS[code]}</span>
        {code}
      </span>
    ),
  }));

  const handleClick: MenuProps['onClick'] = ({ key }) => {
    setCurrency(key as typeof CURRENCY_CODES[number]);
  };

  return (
    <Dropdown menu={{ items, onClick: handleClick, selectedKeys: [currency] }} trigger={['click']}>
      <Button type="text" style={{ color: 'inherit', fontSize: 14, fontWeight: 600 }} aria-label="Change currency">
        {CURRENCY_SYMBOLS[currency]} {currency}
      </Button>
    </Dropdown>
  );
}
