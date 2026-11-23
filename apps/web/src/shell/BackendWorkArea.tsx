import { Fragment } from 'react';
import { sampleData } from '../data/source';
const { BACKEND, CTX_BACKEND, MODEL } = sampleData;
import { useConnection } from '../data/provider';
import { useWorkspace } from '../state/workspace';
import { Icon } from '../ui/Icon';
import { Btn, IconBtn } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { ChatPanel } from './ChatPanel';
import { ArtifactTabs, type ArtifactTabItem } from './ArtifactTabs';
import { ViewSwitch } from './ViewSwitch';
import { Inspector } from './Inspector';
import { OfflineBanner } from './OfflineBanner';

const BACKEND_TABS: ArtifactTabItem[] = [
  { icon: 'server', name: 'API contract · variance alerts' },
  { icon: 'db', name: 'Entity VarianceAlert' },
  { icon: 'doc', name: 'Migration proposal 0007' },
];

// Mirrors boards-shell.mjs Backend stage: chat, artifact tabs, warning banner, contract doc, readiness inspector.
export function BackendWorkArea(props: { onOpenDelivery?: () => void } = {}) {
  const view = useWorkspace((s) => s.view('backend'));
  const setView = useWorkspace((s) => s.setView);
  const chatWidth = useWorkspace((s) => s.chatWidth);
  const chatCollapsed = useWorkspace((s) => s.chatCollapsed);
  const setChatWidth = useWorkspace((s) => s.setChatWidth);
  const toggleChatCollapsed = useWorkspace((s) => s.toggleChatCollapsed);
  const recordIntent = useWorkspace((s) => s.recordIntent);
  const connection = useConnection();

  const ctxItems = CTX_BACKEND.filter(([, name]) => !view.removedCtx.includes(name));
  const activeTab = view.tab ?? 'API contract · variance alerts';

  const right = (
    <>
      <Btn label="Share" icon="share" later="Share and comment links (deferred in the browser MVP, R-WS-3)" />
      <Btn
        label="Hand off"
        cls="ink"
        icon="download"
        does="Opens S34: downloads only accepted revisions with a fixed revision manifest"
        feature="F104"
        onClick={() => recordIntent('F104:handoff')}
      />
    </>
  );

  return (
    <>
      {!chatCollapsed ? (
        <ChatPanel
          title="Backend chat"
          sub="contract r2"
          ctxItems={ctxItems}
          ctxFoot="≈ 4.1k tokens · secrets by name only"
          placeholder="Ask about the contract, entities or migrations…"
          draft={view.draft}
          model={MODEL}
          width={chatWidth}
          onResize={(delta) => setChatWidth((chatWidth ?? 344) + delta)}
          onHistory={() => recordIntent('F114:history')}
          onNewChat={() => setView('backend', { draft: '' })}
          onCollapse={toggleChatCollapsed}
          onRemoveCtx={(name) => setView('backend', { removedCtx: [...view.removedCtx, name] })}
          onAddCtx={() => recordIntent('F106:add')}
          onDraftChange={(draft) => setView('backend', { draft })}
          onAttach={() => recordIntent('F114:attach')}
          onMention={() => recordIntent('F106:mention')}
          onOpenModel={() => recordIntent('F107:model')}
          onSend={() => recordIntent('F114:send')}
        >
          <div className="sp-ub">Check this contract against the new 3% threshold.</div>
          <div className="sp-ai">
            <div className="h">
              <span className="av">S</span>Spekin<em>Sonnet 5.5 · 19 s · 9 cr</em>
            </div>
            <p>The GET endpoint reads the threshold from spec r14, so it follows 3%. Two criteria lack evidence.</p>
            <div className="sp-gg" data-feature="F110">
              <div className="gh">
                <span>Acceptance checklist</span>
                <button
                  type="button"
                  data-does="Shows the checklist as a plain table"
                  data-feature="F110"
                  onClick={() => setView('backend', { tableMode: !view.tableMode })}
                >
                  Show as table
                </button>
              </div>
              <div className="sp-gc">
                <div className="k">
                  <Icon name="check" size={12} />
                  AC-DASH-014
                  <span className="tag">
                    <Pill tone="mute" label="1 of 3 passed" />
                  </span>
                </div>
                <div className="sp-ck">
                  {BACKEND.checks.map(([on, t, p]) => (
                    <div key={t}>
                      <span className={'bx ' + (on === 'on' ? 'on' : '')}>
                        {on === 'on' ? <Icon name="check" size={10} stroke={3} /> : null}
                      </span>
                      <span>{t}</span>
                      <Pill tone={p[0]} label={p[1]} />
                    </div>
                  ))}
                </div>
                <div className="ft">
                  <span className="s">Evidence: fixture run, not a pinned build</span>
                  <Btn
                    label="Propose tests"
                    sm
                    cls="ink"
                    does="Drafts 2 test definitions as a proposal for the Testing stage"
                    feature="F110"
                    onClick={() => recordIntent('F110:propose-tests')}
                  />
                </div>
              </div>
            </div>
          </div>
        </ChatPanel>
      ) : null}

      <section className="sp-main" aria-label="Work area">
        <ArtifactTabs
          tabs={BACKEND_TABS}
          activeTab={activeTab}
          onSelect={(tab) => setView('backend', { tab })}
          onClose={(name) => recordIntent('F104:close:' + name)}
          onOpenArtifact={() => recordIntent('F104:open')}
          openItems={[
            {
              icon: 'flag',
              name: 'Release readiness',
              onSelect: () => (props.onOpenDelivery ? props.onOpenDelivery() : recordIntent('F104:release-readiness')),
            },
          ]}
          right={right}
        />
        {connection.offline ? <OfflineBanner lastLoadedAt={connection.lastLoadedAt} /> : null}
        <div className="sp-banner warn" role="status">
          <Icon name="alert" size={16} />
          <p>
            <b>Needs review.</b> Spec r14 changed R-DASH-014 (threshold 5% → 3%). 2 endpoints and 1 test are linked.
          </p>
          <Btn
            label="Mark reviewed"
            sm
            does="Records a review of this contract against r14; it does not accept the contract"
            feature="F101"
            onClick={() => recordIntent('F101:mark-reviewed')}
          />
        </div>
        <div className="sp-tool">
          <ViewSwitch current={view.viewMode} onChange={(viewMode) => setView('backend', { viewMode })} />
          <span className="sp-crumb">
            Backend
            <Icon name="chevR" size={12} />
            <b>API contract</b>
          </span>
          <span className="sp-fill" />
          <IconBtn
            icon="undo"
            label="Undo"
            does="Undoes the last draft edit on this board"
            sm
            feature="F116"
            onClick={() => recordIntent('F116:undo')}
          />
          <IconBtn
            icon="redo"
            label="Redo"
            does="Redoes the last undone draft edit"
            sm
            feature="F116"
            onClick={() => recordIntent('F116:redo')}
          />
          <IconBtn
            icon="history"
            label="Revisions"
            does="Opens the revision list of the selected artifact"
            sm
            feature="F108"
            onClick={() => recordIntent('F108:revisions')}
          />
        </div>
        <div className="sp-work">
          <div className="sp-doc">
            <div className="meta">
              <Pill tone="acc" label="Proposed r2" />
              <span>Backend stage · contract, not code · no automatic database writes or migrations</span>
            </div>
            <h2>{BACKEND.contract.name}</h2>
            <p>
              Read-only endpoints for the variance table and drawer, plus one acknowledge action. Thresholds come from the
              accepted spec revision, never from the client.
            </p>
            <table className="sp-tbl">
              <thead>
                <tr>
                  <th style={{ width: '64px' }}>Method</th>
                  <th>Path</th>
                  <th style={{ width: '110px' }}>Requirement</th>
                  <th style={{ width: '80px' }}>Role</th>
                  <th style={{ width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {BACKEND.endpoints.map(([m, p, r, a, st]) => (
                  <tr key={m + p}>
                    <td>
                      <code>{m}</code>
                    </td>
                    <td>
                      <code>{p}</code>
                    </td>
                    <td>
                      <code>{r}</code>
                    </td>
                    <td>{a}</td>
                    <td>
                      <Pill tone={st[0]} label={st[1]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Entity VarianceAlert · r1 accepted</h3>
            <div className="sp-kv">
              {BACKEND.entity.map(([k, v]) => (
                <Fragment key={k}>
                  <code>{k}</code>
                  <span>{v}</span>
                </Fragment>
              ))}
            </div>
          </div>

          <Inspector
            title="Backend readiness"
            pill={['bad', 'Not ready · 4 open']}
            sub="Derived from required artifacts, approvals and evidence"
            tabs={['Checklist', 'Links', 'Evidence']}
            activeTab={view.inspTab}
            onSelectTab={(inspTab) => setView('backend', { inspTab })}
            onMore={() => recordIntent('F108:more')}
          >
            <div className="sp-sec">
              <h4>
                Required artifacts<span>6</span>
              </h4>
              {BACKEND.ready.map(([k, n, t]) => (
                <div key={n} className="sp-row">
                  <span className={'dot ' + (k === 'mute' ? 'ring' : k)} />
                  <span className="nm">{n}</span>
                  <Pill tone={k} label={t} />
                </div>
              ))}
            </div>
            <div className="sp-ready">
              <div className="t">
                Upstream change
                <Pill tone="warn" label="Needs review" />
              </div>
              <p>
                Spec r14 changed R-DASH-014 from 5% to 3%. The contract and 1 test were marked for review; r13 and its
                evidence are kept.
              </p>
              <Btn
                label="Open the diff"
                cls="ink"
                sm
                does="Opens S08 with the r13 → r14 diff and the linked contract lines"
                feature="F108"
                onClick={() => recordIntent('F108:open-diff')}
              />
            </div>
          </Inspector>
        </div>
      </section>
    </>
  );
}
