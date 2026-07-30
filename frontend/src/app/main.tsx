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
        token: { colorPrimary: palette.primary }
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
      <ThemedApp />
    </ThemeProvider>
  </StrictMode>,
);
