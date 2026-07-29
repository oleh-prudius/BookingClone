import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyCssTokens } from "./styles/applyCssTokens";
import { App as AntApp, ConfigProvider, theme } from "antd";
import { colors } from "./styles/tokens";
import './styles/index.css';
import '@shared/i18n';
import App from './App';
import { ErrorBoundary } from './ErrorBoundary';
import { NotificationBridge } from './NotificationBridge';


applyCssTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ConfigProvider theme={{
          algorithm: theme.defaultAlgorithm,
          token:  {colorPrimary: colors.primary}
      }}>
        <AntApp>
          <NotificationBridge />
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AntApp>
      </ConfigProvider>
  </StrictMode>,
);
