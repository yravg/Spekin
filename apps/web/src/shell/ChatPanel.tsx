import type { KeyboardEvent, ReactNode } from 'react';
import type { ContextItem, SampleModel } from '@spekin/sample';
import { Icon } from '../ui/Icon';
import { IconBtn } from '../ui/Button';
import { ContextBasket } from './ContextBasket';
import { Composer } from './Composer';

// Mirrors kit.mjs chatPanel(...). Left conversation panel (F106, F107, F109, F114).
export function ChatPanel(props: {
  title: string;
  sub: string;
  ctxItems: ContextItem[];
  ctxFoot: string;
  placeholder: string;
  draft: string;
  model: SampleModel;
  width?: number | null;
  run?: [string, string, string];
  jump?: boolean;
  beforeComposer?: ReactNode;
  onResize: (delta: number) => void;
  onHistory: () => void;
  onNewChat: () => void;
  onCollapse: () => void;
  onRemoveCtx: (name: string) => void;
  onAddCtx: () => void;
  onJump?: () => void;
  onShowSteps?: () => void;
  onStopRun?: () => void;
  onDraftChange: (value: string) => void;
  onComposerKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onAttach: () => void;
  onMention: () => void;
  onOpenModel: () => void;
  onSend: () => void;
  children: ReactNode;
}) {
  const {
    title,
    sub,
    ctxItems,
    ctxFoot,
    placeholder,
    draft,
    model,
    width,
    run,
    jump,
    beforeComposer,
    onResize,
    onHistory,
    onNewChat,
    onCollapse,
    onRemoveCtx,
    onAddCtx,
    onJump,
    onShowSteps,
    onStopRun,
    onDraftChange,
    onComposerKeyDown,
    onAttach,
    onMention,
    onOpenModel,
    onSend,
    children,
  } = props;

  return (
    <aside className="sp-chat" aria-label="Conversation" style={width ? { width: width + 'px' } : undefined}>
      <button
        type="button"
        className="sp-rsz"
        aria-label="Resize chat; arrow keys move 16 px"
        data-does="Drag to resize the chat column (300 to 520 px); the width is remembered per project"
        data-feature="F114"
        onClick={() => onResize(0)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onResize(16);
          else if (e.key === 'ArrowLeft') onResize(-16);
        }}
      />
      <div className="sp-chat-h">
        <b>{title}</b>
        <span>· {sub}</span>
        <span className="sp-fill" />
        <IconBtn icon="history" label="Chat history" does="Lists earlier chats of this stage" sm feature="F114" onClick={onHistory} />
        <IconBtn
          icon="plus"
          label="New chat"
          does="Starts a new chat in this stage; the context list is kept"
          sm
          feature="F114"
          onClick={onNewChat}
        />
        <IconBtn
          icon="panel"
          label="Collapse chat"
          does="Collapses the chat panel; the board keeps its viewport"
          sm
          feature="F114"
          onClick={onCollapse}
        />
      </div>
      <ContextBasket items={ctxItems} foot={ctxFoot} onRemove={onRemoveCtx} onAdd={onAddCtx} />
      <div className="sp-msgs">{children}</div>
      {jump ? (
        <button
          type="button"
          className="sp-jump"
          data-does="Scrolls to the newest message and keeps following the stream"
          data-feature="F114"
          onClick={onJump}
        >
          <Icon name="down" size={12} />
          Jump to latest
        </button>
      ) : null}
      {run ? (
        <div className="sp-run" role="status" data-feature="F109">
          <span className="pulse" aria-hidden="true" />
          <span className="t">
            <b>{run[0]}</b>
            <span>{run[1]}</span>
          </span>
          <span className="c">{run[2]}</span>
          <IconBtn
            icon="list"
            label="Show steps"
            does="Expands the run steps: each tool call, file and check, live"
            sm
            feature="F109"
            onClick={onShowSteps ?? (() => {})}
          />
          <IconBtn
            icon="stop"
            label="Stop run"
            does="Stops this run at its next step; charges settle to what was used"
            sm
            feature="F109"
            onClick={onStopRun ?? (() => {})}
          />
        </div>
      ) : null}
      {beforeComposer}
      <Composer
        placeholder={placeholder}
        draft={draft}
        model={model}
        onDraftChange={onDraftChange}
        onKeyDown={onComposerKeyDown}
        onAttach={onAttach}
        onMention={onMention}
        onOpenModel={onOpenModel}
        onSend={onSend}
      />
    </aside>
  );
}
