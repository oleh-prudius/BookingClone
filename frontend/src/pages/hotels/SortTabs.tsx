import { Segmented } from 'antd';

export type SortBy = 'popular' | 'price' | 'rating';

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Popular', value: 'popular' },
  { label: 'Price', value: 'price' },
  { label: 'Rating', value: 'rating' },
];

interface Props {
  value: SortBy;
  onChange: (value: SortBy) => void;
}

export function SortTabs({ value, onChange }: Props) {
  return (
    <Segmented
      options={SORT_OPTIONS}
      value={value}
      onChange={(v) => onChange(v as SortBy)}
    />
  );
}
