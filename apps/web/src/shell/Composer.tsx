import type { SampleModel } from '@spekin/sample';
import { Icon } from '../ui/Icon';
import { IconBtn } from '../ui/Button';

// Mirrors kit.mjs composer(ph). Model source picker (F107), attach/mention/send (F106, F114).
export function Composer(props: {
  placeholder: string;
  draft: string;
  model: SampleModel;
  onDraftChange: (value: string) => void;
  onAttach: () => void;
  onMention: () => void;
  onOpenModel: () => void;
  onSend: () => void;
}) {
  const { placeholder, draft, model, onDraftChange, onAttach, onMention, onOpenModel, onSend } = props;
  return (
    <div className="sp-comp">
      <div className="ta ap-ta-wrap">
        {!draft ? (
          <span className="ap-ta-ph" aria-hidden="true">
            {placeholder}
          </span>
        ) : null}
        <textarea
          className="ap-ta-input"
          aria-label="Message composer"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
        />
      </div>
      <div className="row">
        <IconBtn
          icon="plus"
          label="Attach a file"
          does="Attaches a PNG, JPEG or WebP the user picked; nothing is read without a file choice"
          size={15}
          sm
          feature="F114"
          onClick={onAttach}
        />
        <IconBtn
          icon="at"
          label="Mention an artifact"
          does="Inserts an artifact reference and adds it to the context list"
          size={15}
          sm
          feature="F106"
          onClick={onMention}
        />
        <button
          type="button"
          className="sp-model"
          data-does="Opens the model source picker: Hosted, BYOK, Local agent (deferred); provider, model, limits, billing source"
          data-feature="F107"
          onClick={onOpenModel}
        >
          <span className="src">{model.source}</span>
          {model.name}
          <Icon name="chev" size={12} />
        </button>
        <span className="sp-est" title="Estimated cost range for this run">
          {model.est}
        </span>
        <button
          type="button"
          className="sp-send"
          aria-label="Send"
          data-does="Sends the message with exactly the listed context; a paid run reserves its maximum first"
          data-feature="F114"
          onClick={onSend}
        >
          <Icon name="up" size={15} stroke={2} />
        </button>
      </div>
    </div>
  );
}
