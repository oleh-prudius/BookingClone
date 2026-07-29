import { useTranslation } from 'react-i18next';
import { Segmented } from 'antd';

export type SortBy = 'popular' | 'price' | 'rating';

interface Props {
  value: SortBy;
  onChange: (value: SortBy) => void;
}

export function SortTabs({ value, onChange }: Props) {
  const { t } = useTranslation();

  const sortOptions: { label: string; value: SortBy }[] = [
    { label: t('hotels.sortPopular'), value: 'popular' },
    { label: t('hotels.sortPrice'), value: 'price' },
    { label: t('hotels.sortRating'), value: 'rating' },
  ];

  return (
    <Segmented
      options={sortOptions}
      value={value}
      onChange={(v) => onChange(v as SortBy)}
    />
  );
}
