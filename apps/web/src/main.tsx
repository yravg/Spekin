import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import '@spekin/design/spekin.css';
import './app.css';
import { router } from './routes';
import { DataSourceProvider } from './data/provider';

const el = document.getElementById('root');
if (!el) throw new Error('index.html must have #root');
createRoot(el).render(
  <StrictMode>
    <DataSourceProvider>
      <RouterProvider router={router} />
    </DataSourceProvider>
  </StrictMode>,
);
