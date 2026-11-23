import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import '@spekin/design/spekin.css';
import './app.css';
import { router } from './routes';
import { DataSourceProvider } from './data/provider';
import { devOfflineSimSource } from './data/sim';

const el = document.getElementById('root');
if (!el) throw new Error('index.html must have #root');
// IMP-39: `?sim=offline` in a dev build simulates the server not answering (S35 state `offline`).
const sim = devOfflineSimSource();
createRoot(el).render(
  <StrictMode>
    <DataSourceProvider source={sim ?? undefined}>
      <RouterProvider router={router} />
    </DataSourceProvider>
  </StrictMode>,
);
