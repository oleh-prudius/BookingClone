// City/country names are stored in the database in English only (seed data has no
// localization columns). This dictionary translates the known seeded names for display
// purposes — it never touches the underlying value used for search/filtering/navigation,
// so city/country matching against the backend keeps working unchanged.
const CITY_NAMES_UK: Record<string, string> = {
  'Kyiv': 'Київ',
  'Lviv': 'Львів',
  'Odesa': 'Одеса',
  'Kharkiv': 'Харків',
  'Paris': 'Париж',
  'Nice': 'Ніцца',
  'Lyon': 'Ліон',
  'Rome': 'Рим',
  'Milan': 'Мілан',
  'Venice': 'Венеція',
  'Florence': 'Флоренція',
  'Barcelona': 'Барселона',
  'Madrid': 'Мадрид',
  'Valencia': 'Валенсія',
  'Istanbul': 'Стамбул',
  'Antalya': 'Анталія',
  'Bodrum': 'Бодрум',
  'Dubai': 'Дубай',
  'Abu Dhabi': 'Абу-Дабі',
  'Bangkok': 'Бангкок',
  'Phuket': 'Пхукет',
  'Chiang Mai': 'Чіанг Май',
  'Berlin': 'Берлін',
  'Munich': 'Мюнхен',
  'Athens': 'Афіни',
  'Santorini': 'Санторіні',
  'Dubrovnik': 'Дубровник',
  'Split': 'Спліт',
};

const COUNTRY_NAMES_UK: Record<string, string> = {
  'Ukraine': 'Україна',
  'France': 'Франція',
  'Italy': 'Італія',
  'Spain': 'Іспанія',
  'Turkey': 'Туреччина',
  'UAE': 'ОАЕ',
  'Thailand': 'Таїланд',
  'Germany': 'Німеччина',
  'Greece': 'Греція',
  'Croatia': 'Хорватія',
};

export function localizeCityName(name: string, language: string): string {
  if (!language.startsWith('uk')) return name;
  return CITY_NAMES_UK[name] ?? name;
}

export function localizeCountryName(name: string, language: string): string {
  if (!language.startsWith('uk')) return name;
  return COUNTRY_NAMES_UK[name] ?? name;
}
