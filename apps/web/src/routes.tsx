import { createBrowserRouter, Navigate, useSearchParams } from 'react-router';
import { ProjectShell } from './shell/ProjectShell';
import { ProjectsHome } from './projects/ProjectsHome';
import { SignInScreen } from './auth/SignInScreen';
import { InterviewScreen } from './interview/InterviewScreen';
import { NotFound } from './shell/NotFound';
import { SAMPLE_PROJECT_ID } from './data/source';

// Routes follow the boards' "Where it lives" cards. Stage and artifact are in the path or query, never draft text (R-WF-11).
// "/" renders S27 Projects home (IMP-05); clicking a project opens /p/:project/:stage.
// Planning holds five boards on one route ("Where it lives" cards): the bare URL is the S04 add-feature interview;
// ?artifact=decisions (S05), pitch (S06), tickets (S15) and ticket-<id> (S16) open that artifact in the project shell.
function PlanningRoute() {
  const [search] = useSearchParams();
  return search.get('artifact') ? <ProjectShell planningView /> : <InterviewScreen mode="ground" />;
}

export const router = createBrowserRouter([
  { path: '/', element: <ProjectsHome initialView="home" /> },
  { path: '/projects', element: <ProjectsHome initialView="all" /> },
  { path: '/welcome', element: <ProjectsHome initialView="first" /> },
  { path: '/masuk', element: <SignInScreen page="signin" /> },
  { path: '/syarat', element: <SignInScreen page="terms" /> },
  { path: '/privasi', element: <SignInScreen page="privacy" /> },
  { path: '/new/interview', element: <InterviewScreen mode="new" /> },
  { path: '/p/:project/planning', element: <PlanningRoute /> },
  { path: '/skills', element: <Navigate to={'/p/' + SAMPLE_PROJECT_ID + '/spec'} replace /> },
  { path: '/p/:project/testing/report', element: <ProjectShell reportView /> },
  { path: '/p/:project/:stage', element: <ProjectShell /> },
  // S14 Design system: kit and GAP register: /p/meranti-yard/design/system (tab and gap in the query)
  { path: '/p/:project/design/system', element: <ProjectShell designSystemView /> },
  // S25 Export (Markdown, zip, yravgbuilder): /p/meranti-yard/spec/export (format in the query).
  { path: '/p/:project/spec/export', element: <ProjectShell exportView /> },
  // S19 ADRs and glossary: /p/meranti-yard/spec/records?type=glossary|adrs|propose|contradiction|stale
  { path: '/p/:project/spec/records', element: <ProjectShell recordsView /> },
  // S36 Models and usage lives beside the work: /p/meranti-yard/usage?section=models|next|ledger|limits
  { path: '/p/:project/usage', element: <ProjectShell usageView /> },
  { path: '*', element: <NotFound /> },
]);
