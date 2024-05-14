import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as JotaiProvider } from 'jotai';
import { initConfig } from '@joyid/ckb';
import { QueryClient, QueryClientProvider } from 'react-query';
import { theme } from './theme';
import './index.css';
import { Router } from './route';
import { JOY_ID_URL, JOY_ID_SERVER_URL } from './env';

initConfig({
  joyidAppURL: JOY_ID_URL,
  joyidServerURL: JOY_ID_SERVER_URL,
  logo: `${location.origin}/vite.svg`,
  name: 'RGB++ with JoyID Demo',
});

const App: React.FC = () => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <ChakraProvider theme={theme}>
          <Router />
        </ChakraProvider>
      </JotaiProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
