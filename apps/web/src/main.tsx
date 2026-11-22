import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import '@spekin/design/spekin.css';
import './app.css';
import { router } from './routes';

const el = document.getElementById('root');
if (!el) throw new Error('index.html must have #root');
createRoot(el).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
