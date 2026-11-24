import { createBrowserRouter, Navigate } from 'react-router';
import { ProjectShell } from './shell/ProjectShell';
import { ProjectsHome } from './projects/ProjectsHome';
import { NotFound } from './shell/NotFound';
import { SAMPLE_PROJECT_ID } from './data/source';

// Routes follow the boards' "Where it lives" cards. Stage and artifact are in the path or query, never draft text (R-WF-11).
// "/" renders S27 Projects home (IMP-05); clicking a project opens /p/:project/:stage.
export const router = createBrowserRouter([
  { path: '/', element: <ProjectsHome initialView="home" /> },
  { path: '/projects', element: <ProjectsHome initialView="all" /> },
  { path: '/welcome', element: <ProjectsHome initialView="first" /> },
  { path: '/skills', element: <Navigate to={'/p/' + SAMPLE_PROJECT_ID + '/spec'} replace /> },
  { path: '/p/:project/:stage', element: <ProjectShell /> },
  // S25 Export (Markdown, zip, yravgbuilder): /p/meranti-yard/spec/export (format in the query).
  { path: '/p/:project/spec/export', element: <ProjectShell exportView /> },
  // S36 Models and usage lives beside the work: /p/meranti-yard/usage?section=models|next|ledger|limits
  { path: '/p/:project/usage', element: <ProjectShell usageView /> },
  { path: '*', element: <NotFound /> },
]);
