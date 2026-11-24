import { useState } from 'react';
import { sampleData, type ContextItem, type PillTone } from '../data/source';
import { useWorkspace } from '../state/workspace';
import { ChatPanel } from '../shell/ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from '../shell/ArtifactTabs';
import { Btn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { GAPD_CTX, GAPD_EXPORT, MODEL } = sampleData;

export type ExportMode = 'md' | 'yb' | 'left' | 'build' | 'done' | 'back';
export type ExportFormat = 'md' | 'zip' | 'yb';

const EXPORT_TABS: ArtifactTabItem[] = [
  { icon: 'doc', name: 'Spec r14' },
  { icon: 'download', name: 'Export' },
];

const BUILD_STEPS: ['ok' | 'run' | 'mute', string][] = [
  ['ok', 'Collected accepted r14 and design files'],
  ['ok', 'Checked for secret values: none found'],
  ['run', 'Writing files: 8 of 11'],
  ['mute', 'Zip and checksum'],
];

/** Counts how many status-back rows are currently ticked to apply as updates. */
export function countSelectedStatusUpdates(
  rows: readonly [string, string, string, PillTone][],
  checked: readonly boolean[],
): number {
  return rows.reduce((sum, _row, i) => sum + (checked[i] ? 1 : 0), 0);
}

function formatForMode(mode: ExportMode): ExportFormat {
  if (mode === 'md') return 'md';
  if (mode === 'left' || mode === 'build') return 'zip';
  return 'yb';
}

function chatCopy(mode: ExportMode): { user: string; reply: React.ReactNode } {
  switch (mode) {
    case 'md':
      return {
        user: 'Export the spec as Markdown.',
        reply: <p>Ready: spec r14 and the accepted design files. Drafts are left out.</p>,
      };
    case 'yb':
      return {
        user: 'Prepare this for yravgbuilder.',
        reply: (
          <p>
            Built the bundle from r14: 4 tickets as <b>AREA-NNN</b> rows, each with an observable acceptance line and
            status. Two are still proposals.
          </p>
        ),
      };
    case 'left':
      return {
        user: 'Export everything, including my drafts.',
        reply: (
          <p>
            Drafts and proposals cannot leave Spekin as accepted work. I listed what stays behind. The export contains
            accepted r14 only.
          </p>
        ),
      };
    case 'build':
      return {
        user: 'Zip it.',
        reply: (
          <p>Building the archive. The file lists below are written in order; the checksum is made last.</p>
        ),
      };
    case 'done':
      return {
        user: 'Is it ready?',
        reply: (
          <p>
            Ready. The bundle is labelled r14 and its checksum is recorded. Bring ticket status back after the build.
          </p>
        ),
      };
    case 'back':
      return {
        user: 'Import the status file.',
        reply: (
          <p>
            Read 3 tickets. VAR-001 is built and its tests pass. I show the changes first; nothing is applied yet.
          </p>
        ),
      };
  }
}

// S25 Export (Markdown, zip, yravgbuilder). Board: docs/design/spekin-canvas/project/S25-export.dc.html.
export function ExportWorkArea(props: {
  initialMode?: ExportMode;
  onFormatChange?: (format: ExportFormat) => void;
  onCloseExport?: () => void;
  onOpenHandoff?: () => void;
  onOpenReview?: () => void;
}) {
  const view = useWorkspace((s) => s.view('spec'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);

  const [mode, setMode] = useState<ExportMode>(props.initialMode ?? 'md');
  const [checkedRows, setCheckedRows] = useState<boolean[]>(() => GAPD_EXPORT.statusBack.map((_r, i) => i < 2));

  const X = GAPD_EXPORT;
  const format = formatForMode(mode);
  const ctxItems: ContextItem[] = GAPD_CTX.filter(([, name]) => !view.removedCtx.includes(name));
  const msg = chatCopy(mode);
  const selectedUpdates = countSelectedStatusUpdates(X.statusBack, checkedRows);

  function pickFormat(next: ExportFormat) {
    const nextMode: ExportMode = next === 'md' ? 'md' : next === 'zip' ? 'left' : 'yb';
    setMode(nextMode);
    props.onFormatChange?.(next);
  }

  function closeExport() {
    recordIntent('F521:cancel');
    props.onCloseExport?.();
  }

  function toggleRow(index: number) {
    setCheckedRows((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  const fileTree = (
    <div className="gpd-tree" data-feature="F523">
      {X.tree.map(([kind, name, size]) => (
        <div key={name} className={kind === 'file' ? 'gpd-tr f' : 'gpd-tr'}>
          <Icon name={kind === 'dir' ? 'layers' : 'doc'} size={14} />
          {name}
          <span className="sz">{size}</span>
        </div>
      ))}
    </div>
  );

  const formActions = (() => {
    switch (mode) {
      case 'md':
        return (
          <>
            <Btn
              label="Export Markdown"
              cls="ink"
              icon="download"
              does="Builds the folder from accepted r14 only and downloads it as a zip of .md files"
              feature="F528"
              onClick={() => {
                recordIntent('F528:export-md');
                setMode('done');
              }}
            />
            <Btn
              label="Cancel"
              cls="plain"
              does="Closes the export without building anything"
              feature="F521"
              onClick={closeExport}
            />
          </>
        );
      case 'yb':
        return (
          <>
            <Btn
              label="Export for yravgbuilder"
              cls="ink"
              icon="download"
              does="Builds the spec layers, AREA-NNN tickets and design files as one bundle for a yravgbuilder run"
              feature="F528"
              onClick={() => {
                recordIntent('F528:export-yb');
                setMode('done');
              }}
            />
            <Btn
              label="Cancel"
              cls="plain"
              does="Closes the export without building anything"
              feature="F521"
              onClick={closeExport}
            />
          </>
        );
      case 'left':
        return (
          <>
            <Btn
              label="Export accepted only"
              cls="ink"
              icon="download"
              does="Builds the zip from accepted r14 only; the left-out items stay in Spekin"
              feature="F528"
              onClick={() => {
                recordIntent('F528:export-zip');
                setMode('build');
              }}
            />
            <Btn
              label="Review drafts first"
              does="Opens S08 review to accept or drop the drafts before exporting"
              feature="F527"
              onClick={() => {
                recordIntent('F527:review-drafts');
                props.onOpenReview?.();
              }}
            />
          </>
        );
      case 'build':
        return (
          <Btn
            label="Cancel build"
            cls="plain"
            icon="stop"
            does="Stops the build and deletes the partial archive"
            feature="F528"
            onClick={() => {
              recordIntent('F528:cancel-build');
              setMode('left');
            }}
          />
        );
      case 'done':
        return (
          <>
            <Btn
              label="Download again"
              cls="ink"
              icon="download"
              does="Downloads the same file again; no new build"
              feature="F528"
              onClick={() => recordIntent('F528:download-again')}
            />
            <Btn
              label="Copy hand-over note"
              icon="link"
              does="Copies a short text that tells a coding agent which file to read first"
              feature="F526"
              onClick={() => recordIntent('F526:copy-handover-note')}
            />
          </>
        );
      case 'back':
        return (
          <>
            <Btn
              label={`Apply ${selectedUpdates} changes`}
              cls="ink"
              does="Records the 2 changed statuses on the ticket board as updates marked from yravgbuilder"
              feature="F529"
              onClick={() => {
                recordIntent('F529:apply:' + selectedUpdates);
                setMode('done');
              }}
            />
            <Btn
              label="Discard"
              cls="plain"
              does="Drops the status file; no ticket changes"
              feature="F529"
              onClick={() => {
                recordIntent('F529:discard');
                setMode('done');
              }}
            />
          </>
        );
    }
  })();

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Export chat"
          sub="spec r14"
          ctxItems={ctxItems}
          ctxFoot="≈ 3.2k tokens · secrets by name only"
          placeholder="Ask about this export, or @ a file…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('spec', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('spec', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('spec', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">{msg.user}</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 6 s · 2 cr</em>
            </div>
            {msg.reply}
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={EXPORT_TABS}
          activeTab="Export"
          onSelect={(name) => {
            if (name === 'Spec r14') closeExport();
          }}
          onClose={(name) => {
            recordIntent('F104:close:' + name);
            if (name === 'Export') props.onCloseExport?.();
          }}
          onOpenArtifact={() => recordIntent('F104:open')}
          right={
            <Btn
              label="Hand off"
              icon="download"
              does="Opens S34 coding hand-off, which is different from export"
              feature="F104"
              onClick={() => {
                recordIntent('F104:handoff');
                props.onOpenHandoff?.();
              }}
            />
          }
        />

        {mode === 'left' ? (
          <div className="sp-banner warn" role="status" data-feature="F527">
            <Icon name="alert" size={16} />
            <p>
              <b>6 items are not accepted.</b> They stay out of the export until you accept them in review.
            </p>
          </div>
        ) : null}

        <div className="sp-work">
          <div className="gpd-form">
            <h3>Export project</h3>
            <div className="s" style={{ fontSize: '12px', color: 'var(--ink-dim)', marginTop: '-6px' }}>
              Meranti Yard · Inc. 2 · Variance alerts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }} data-feature="F521">
              <button
                type="button"
                className="gpd-fmt"
                aria-pressed={format === 'md' ? 'true' : 'false'}
                data-does="Selects Markdown; the preview on the right changes to match"
                data-feature="F521"
                onClick={() => pickFormat('md')}
              >
                <span className="gpd-rad" />
                <span>
                  <b>Markdown</b>
                  <span>One folder of .md files. Readable by people and by any agent.</span>
                </span>
              </button>
              <button
                type="button"
                className="gpd-fmt"
                aria-pressed={format === 'zip' ? 'true' : 'false'}
                data-does="Selects Zip; the preview on the right changes to match"
                data-feature="F521"
                onClick={() => pickFormat('zip')}
              >
                <span className="gpd-rad" />
                <span>
                  <b>Zip</b>
                  <span>The same files in one archive, with a manifest and checksum.</span>
                </span>
              </button>
              <button
                type="button"
                className="gpd-fmt"
                aria-pressed={format === 'yb' ? 'true' : 'false'}
                data-does="Selects yravgbuilder; the preview on the right changes to match"
                data-feature="F524"
                onClick={() => pickFormat('yb')}
              >
                <span className="gpd-rad" />
                <span>
                  <b>yravgbuilder</b>
                  <span>Spec layers, AREA-NNN tickets and design files, ready for a coding playbook.</span>
                </span>
              </button>
            </div>

            <div className="gpd-card" data-feature="F522">
              <h3>
                Scope<span>accepted only</span>
              </h3>
              <div className="gpd-actions" style={{ gap: '6px' }}>
                <Pill tone="ok" label={'Spec ' + X.rev} />
                <Pill tone="ok" label="DESIGN.md r3" />
                <Pill tone="mute" label="No drafts" />
              </div>
              <div className="s">
                Only accepted revisions leave Spekin. Drafts and proposals are left out and listed before you export.
              </div>
            </div>

            {mode === 'yb' ? (
              <div className="gpd-card" data-feature="F526">
                <h3>
                  Hand-over<span>Q-10 open</span>
                </h3>
                <div className="gpd-actions" style={{ gap: '6px' }}>
                  <Btn
                    label="File"
                    sm
                    cls="ink"
                    does="Hands over as a downloaded file, the only transport drawn for now"
                    feature="F526"
                    onClick={() => recordIntent('F526:transport-file')}
                  />
                  <Btn
                    label="MCP"
                    sm
                    later="Hand-over through an MCP server; transport is an open owner decision (Q-10)"
                  />
                  <Btn
                    label="CLI"
                    sm
                    later="Hand-over through a command line; transport is an open owner decision (Q-10)"
                  />
                </div>
              </div>
            ) : null}

            <div className="sp-fill" />
            <div className="gpd-actions">{formActions}</div>
          </div>

          <div className="gpd-pv">
            {mode === 'md' ? (
              <>
                <div className="gpd-head">
                  <div className="t">
                    <h3>Preview · what the files will contain</h3>
                    <p>
                      {X.name} · 11 items · 45 KB · built from spec {X.rev}
                    </p>
                  </div>
                </div>
                {fileTree}
                <div className="gpd-card">
                  <h3>
                    MANIFEST.json
                    <span>
                      <Pill tone="ok" label="Checksum on build" />
                    </span>
                  </h3>
                  <div className="s">
                    Lists every file, its source revision and its SHA-256, so a reader can tell what is accepted.
                  </div>
                </div>
              </>
            ) : null}

            {mode === 'yb' ? (
              <>
                <div className="gpd-head">
                  <div className="t">
                    <h3>yravgbuilder bundle</h3>
                    <p>
                      Starts a yravgbuilder playbook from accepted r14 · {X.layers.length} layers
                    </p>
                  </div>
                </div>
                <div className="gpd-card" data-feature="F524">
                  <h3>
                    Spec layers<span>{X.layers.length}</span>
                  </h3>
                  {X.layers.map(([name, rev, count]) => (
                    <div
                      key={name}
                      className="gpd-evr"
                      style={{ gridTemplateColumns: 'minmax(0,1fr) auto auto', gap: '12px' }}
                    >
                      <span>{name}</span>
                      <span className="gpd-ref">{rev}</span>
                      <span className="s">{count}</span>
                    </div>
                  ))}
                </div>
                <table className="sp-tbl" data-feature="F524">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Ticket</th>
                      <th>Title and observable acceptance</th>
                      <th style={{ width: '96px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {X.tickets.map(([id, title, ac, status, tone]) => (
                      <tr key={id}>
                        <td>
                          <code>{id}</code>
                        </td>
                        <td>
                          {title}
                          <div style={{ fontSize: '11px', color: 'var(--ink-dim)', marginTop: '3px' }}>{ac}</div>
                        </td>
                        <td>
                          <Pill tone={tone} label={status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="gpd-card" data-feature="F525">
                  <h3>
                    Design files<span>3</span>
                  </h3>
                  <div className="s">
                    DESIGN.md r3 · tokens.json (18 tokens) · components.md (6 picks: table, drawer, pill, alert row,
                    filter chip, tab)
                  </div>
                </div>
              </>
            ) : null}

            {mode === 'left' ? (
              <>
                <div className="gpd-head">
                  <div className="t">
                    <h3>Left out of this export</h3>
                    <p>6 items are not accepted and stay in Spekin</p>
                  </div>
                </div>
                <div className="gpd-card warn" data-feature="F527">
                  <h3>
                    Not exported<span>3 groups</span>
                  </h3>
                  {X.left.map(([title, detail]) => (
                    <div key={title} className="gpd-ms">
                      <Icon name="alert" size={15} />
                      <span>
                        <b>{title}</b>
                        <small>{detail}</small>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="gpd-card ok" data-feature="F527">
                  <h3>
                    Redaction check
                    <span>
                      <Pill tone="ok" label="Clean" />
                    </span>
                  </h3>
                  <p>
                    0 secret values found in 11 files. 2 environment variables appear by name only:{' '}
                    <code>DATABASE_URL</code>, <code>SESSION_KEY</code>.
                  </p>
                </div>
                <div className="gpd-card">
                  <h3>
                    Stale reference
                    <span>
                      <Pill tone="warn" label="1" />
                    </span>
                  </h3>
                  <p>T-198 points at spec r12. It is exported with its source revision, marked stale.</p>
                </div>
              </>
            ) : null}

            {mode === 'build' ? (
              <>
                <div className="gpd-head">
                  <div className="t">
                    <h3>Building the zip</h3>
                    <p>
                      {X.name}.zip · 8 of 11 files
                    </p>
                  </div>
                </div>
                <div className="gpd-card" data-feature="F528">
                  <div className="gpd-prog">
                    <div
                      className="gpd-pb"
                      role="progressbar"
                      aria-valuenow={8}
                      aria-valuemin={0}
                      aria-valuemax={11}
                      aria-label="Files written"
                    >
                      <i style={{ width: '73%' }} />
                    </div>
                    {BUILD_STEPS.map(([kind, text]) => (
                      <div key={text} className={kind === 'mute' ? 'gpd-st mute' : 'gpd-st'}>
                        <span className={'d ' + kind} />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
                {fileTree}
              </>
            ) : null}

            {mode === 'done' ? (
              <>
                <div className="gpd-head">
                  <div className="t">
                    <h3>Export ready</h3>
                    <p>
                      {X.name}-yb.zip · built 24 Nov 13:48
                    </p>
                  </div>
                  <Pill tone="ok" label="Downloaded" />
                </div>
                <div className="gpd-card" data-feature="F528">
                  <dl className="gpd-kvs" style={{ margin: 0 }}>
                    <dt>File</dt>
                    <dd>{X.name}-yb.zip</dd>
                    <dt>Source</dt>
                    <dd>Spec {X.rev} · DESIGN.md r3</dd>
                    <dt>Contents</dt>
                    <dd>11 files · 4 AREA-NNN tickets</dd>
                    <dt>SHA-256</dt>
                    <dd>9c41 e07b 5d2a 18f3 aa60 71c9</dd>
                  </dl>
                </div>
                <div className="gpd-drop" data-feature="F529">
                  <Icon name="download" size={18} />
                  <span>
                    <b style={{ color: 'var(--ink)' }}>Bring ticket status back.</b> Drop the status file the builder
                    wrote, or pick it.
                  </span>
                  <span className="sp-fill" />
                  <Btn
                    label="Choose file"
                    sm
                    does="Opens a file picker for a ticket-status file; nothing is applied until you review it"
                    feature="F529"
                    onClick={() => {
                      recordIntent('F529:choose-file');
                      setMode('back');
                    }}
                  />
                </div>
              </>
            ) : null}

            {mode === 'back' ? (
              <>
                <div className="gpd-head">
                  <div className="t">
                    <h3>Ticket status from yravgbuilder</h3>
                    <p>
                      Matched to export {X.name}-yb.zip · 3 tickets
                    </p>
                  </div>
                </div>
                <table className="sp-tbl" data-feature="F529">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }} />
                      <th style={{ width: '80px' }}>Ticket</th>
                      <th style={{ width: '110px' }}>In Spekin</th>
                      <th>Reported by builder</th>
                      <th style={{ width: '120px' }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {X.statusBack.map(([id, inSpekin, reported, tone], i) => {
                      const on = checkedRows[i] ?? false;
                      return (
                        <tr key={id}>
                          <td>
                            <button
                              type="button"
                              aria-label={'Toggle update for ' + id}
                              aria-pressed={on ? 'true' : 'false'}
                              data-does={'Includes or excludes ' + id + ' from the status update'}
                              data-feature="F529"
                              onClick={() => toggleRow(i)}
                              style={{ border: 0, padding: 0, background: 'transparent', display: 'inline-flex' }}
                            >
                              <span className={on ? 'gpd-chk on' : 'gpd-chk'} aria-hidden="true">
                                {on ? <Icon name="check" size={11} stroke={3} /> : null}
                              </span>
                            </button>
                          </td>
                          <td>
                            <code>{id}</code>
                          </td>
                          <td>{inSpekin}</td>
                          <td>{reported}</td>
                          <td>
                            <Pill tone={tone} label={i < 2 ? 'Update' : 'No change'} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="gpd-card">
                  <h3>
                    What this does not do
                    <span />
                  </h3>
                  <p>
                    Status is evidence from another tool. It does not accept a requirement and it does not mark anything
                    verified; run a review (S18) for that.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
