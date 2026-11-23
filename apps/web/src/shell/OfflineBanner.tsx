import { retryFailedReads } from '../data/session';
import { Btn } from '../ui/Button';
import { Icon } from '../ui/Icon';

/** 12:41, as the board writes it. */
export function clockTime(at: Date | null): string | null {
  if (!at) return null;
  return String(at.getHours()).padStart(2, '0') + ':' + String(at.getMinutes()).padStart(2, '0');
}

// S35 state `offline` (F378): the last copy stays on screen, the screen says so, and Try again asks
// the server again. Board markup and words: docs/design/spekin-canvas/project/S35-project-shell.dc.html.
export function OfflineBanner(props: { lastLoadedAt: Date | null; onTryAgain?: () => void }) {
  const time = clockTime(props.lastLoadedAt);
  const tryAgain = props.onTryAgain ?? (() => void retryFailedReads());
  return (
    <div className="sp-banner bad" role="alert" data-feature="F378">
      <Icon name="alert" size={16} />
      <p>
        <b>The Spekin server is not answering.</b>{' '}
        {time
          ? 'You are looking at the last copy loaded at ' + time + '.'
          : 'No copy has loaded yet, so this screen stays empty.'}{' '}
        New edits stay on this device until it answers.
      </p>
      <Btn
        label="Try again"
        sm
        cls="ink"
        does="Asks the server again; the banner closes when it answers"
        feature="F378"
        onClick={tryAgain}
      />
    </div>
  );
}
