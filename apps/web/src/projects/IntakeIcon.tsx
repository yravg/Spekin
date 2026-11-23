import { Icon, type IconName } from '../ui/Icon';

export type IntakeIconName =
  | IconName
  | 'home'
  | 'folder'
  | 'gauge'
  | 'sliders'
  | 'trash'
  | 'upload'
  | 'shield'
  | 'plug'
  | 'arrow'
  | 'sort'
  | 'pencil'
  | 'clipboard'
  | 'restore'
  | 'blur';

// Local S27/S28 icons from boards-intake.mjs G{}, rendered as pure JSX SVG.
export function IntakeIcon({ name, size = 16, stroke = 1.75 }: { name: IntakeIconName; size?: number; stroke?: number }) {
  const wrap = (children: React.ReactNode) => (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );

  switch (name) {
    case 'home':
      return wrap(
        <>
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h5v-6h4v6h5V10" />
        </>,
      );
    case 'folder':
      return wrap(<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />);
    case 'gauge':
      return wrap(
        <>
          <path d="M12 14l4-4" />
          <path d="M3.3 17a10 10 0 1 1 17.4 0" />
        </>,
      );
    case 'sliders':
      return wrap(
        <>
          <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </>,
      );
    case 'trash':
      return wrap(<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />);
    case 'upload':
      return wrap(<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />);
    case 'shield':
      return wrap(<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" />);
    case 'plug':
      return wrap(
        <>
          <path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0z" />
          <path d="M12 18v4" />
        </>,
      );
    case 'arrow':
      return wrap(<path d="M5 12h14M13 6l6 6-6 6" />);
    case 'sort':
      return wrap(<path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />);
    case 'pencil':
      return wrap(
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </>,
      );
    case 'clipboard':
      return wrap(
        <>
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </>,
      );
    case 'restore':
      return wrap(
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </>,
      );
    case 'blur':
      return wrap(
        <>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" strokeDasharray="2 3" />
        </>,
      );
    default:
      return <Icon name={name} size={size} stroke={stroke} />;
  }
}
