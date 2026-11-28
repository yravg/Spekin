import { createBrowserRouter, Navigate } from 'react-router';
import { ProjectShell } from './shell/ProjectShell';
import { ProjectsHome } from './projects/ProjectsHome';
import { SignInScreen } from './auth/SignInScreen';
import { NotFound } from './shell/NotFound';
import { SAMPLE_PROJECT_ID } from './data/source';

// Routes follow the boards' "Where it lives" cards. Stage and artifact are in the path or query, never draft text (R-WF-11).
// "/" renders S27 Projects home (IMP-05); clicking a project opens /p/:project/:stage.
export const router = createBrowserRouter([
  { path: '/', element: <ProjectsHome initialView="home" /> },
  { path: '/projects', element: <ProjectsHome initialView="all" /> },
  { path: '/welcome', element: <ProjectsHome initialView="first" /> },
  { path: '/masuk', element: <SignInScreen page="signin" /> },
  { path: '/syarat', element: <SignInScreen page="terms" /> },
  { path: '/privasi', element: <SignInScreen page="privacy" /> },
  { path: '/skills', element: <Navigate to={'/p/' + SAMPLE_PROJECT_ID + '/spec'} replace /> },
  { path: '/p/:project/testing/report', element: <ProjectShell reportView /> },
  { path: '/p/:project/:stage', element: <ProjectShell /> },
  // S14 Design system: kit and GAP register: /p/meranti-yard/design/system (tab and gap in the query)
  { path: '/p/:project/design/system', element: <ProjectShell designSystemView /> },
  // S36 Models and usage lives beside the work: /p/meranti-yard/usage?section=models|next|ledger|limits
  { path: '/p/:project/usage', element: <ProjectShell usageView /> },
  { path: '*', element: <NotFound /> },
]);
