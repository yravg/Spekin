import { createBrowserRouter, Navigate } from 'react-router';
import { ProjectShell } from './shell/ProjectShell';
import { NotFound } from './shell/NotFound';
import { SAMPLE_PROJECT_ID } from './data/source';

// Routes follow the boards' "Where it lives" cards. Stage and artifact are in the path or query, never draft text (R-WF-11).
// "/" goes to the sample project until S27 Projects home is built (task card IMP-05); then "/" renders S27.
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={'/p/' + SAMPLE_PROJECT_ID + '/design'} replace /> },
  { path: '/p/:project/:stage', element: <ProjectShell /> },
  { path: '*', element: <NotFound /> },
]);
