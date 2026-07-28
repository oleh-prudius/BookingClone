import { Segmented } from 'antd';

const SORT_OPTIONS = ['Popular', 'Price', 'Rating'];

export function SortTabs() {
  return <Segmented options={SORT_OPTIONS} defaultValue="Popular" />;
}
