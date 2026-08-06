import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CURRENCY_CODES, type CurrencyCode } from '@shared/lib/currency';

const STORAGE_KEY = 'triply-currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function getInitialCurrency(): CurrencyCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return (CURRENCY_CODES as readonly string[]).includes(stored ?? '') ? (stored as CurrencyCode) : 'USD';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency);

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ currency, setCurrency }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
