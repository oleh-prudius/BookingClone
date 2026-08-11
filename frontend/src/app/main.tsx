import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntApp, ConfigProvider, theme } from "antd";
import { colors, darkColors } from "@shared/theme/tokens";
import './styles/index.css';
import '@shared/i18n';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { NotificationBridge } from './NotificationBridge';
import { ThemeProvider, useTheme } from '@shared/theme/ThemeContext';
import { CurrencyProvider } from '@shared/theme/CurrencyContext';
import { initSentry } from './sentry';
import { initAnalytics } from './analytics';

initSentry();
initAnalytics();

function ThemedApp() {
  const { theme: mode } = useTheme();
  const palette = mode === 'dark' ? darkColors : colors;

  return (
    <ConfigProvider theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: palette.primary, borderRadius: 12 },
        components: {
          Button: {
            controlHeight: 44,
            controlHeightLG: 52,
            fontWeight: 600,
          },
          Card: {
            borderRadiusLG: 16,
          },
          // Rounder, larger boxes to match the Figma design system's flat filled
          // checkbox/toggle shapes (Rectangle38, Component4/5) instead of antd's default.
          Checkbox: {
            borderRadiusSM: 5,
            controlInteractiveSize: 20,
          },
          Switch: {
            trackHeight: 20,
            trackMinWidth: 38,
            handleSize: 18,
          },
        },
    }}>
      <AntApp>
        <NotificationBridge />
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <ThemedApp />
      </CurrencyProvider>
    </ThemeProvider>
  </StrictMode>,
);
