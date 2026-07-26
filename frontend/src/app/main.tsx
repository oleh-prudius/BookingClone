import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyCssTokens } from "./styles/applyCssTokens";
import { ConfigProvider } from "antd";
import { colors } from "./styles/tokens";
import './styles/index.css';
import App from './App';

applyCssTokens();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ConfigProvider theme={{ token:  {colorPrimary: colors.primary}}}>
    <App />
      </ConfigProvider>
  </StrictMode>,
);
