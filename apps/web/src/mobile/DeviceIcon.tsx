import { Icon, type IconName } from '../ui/Icon';

export type DeviceIconName = IconName | 'palette' | 'monitor' | 'back' | 'arrowR' | 'arrowU' | 'arrowD' | 'copy';

// Pure JSX stroke icons for the seven T01 icons not in kit.mjs icons.json; delegates all others to <Icon>.
export function DeviceIcon({ name, size = 18, stroke = 1.75 }: { name: DeviceIconName; size?: number; stroke?: number }) {
  const svgProps = {
    className: 'ic',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'palette':
      return (
        <svg {...svgProps}>
          <circle cx="13.5" cy="6.5" r=".5" />
          <circle cx="17.5" cy="10.5" r=".5" />
          <circle cx="8.5" cy="7.5" r=".5" />
          <circle cx="6.5" cy="12.5" r=".5" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.75 1.5-1.5 0-.4-.15-.74-.39-1.04-.23-.29-.38-.65-.38-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.48-9-10-9Z" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...svgProps}>
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'back':
      return (
        <svg {...svgProps}>
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      );
    case 'arrowR':
      return (
        <svg {...svgProps}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'arrowU':
      return (
        <svg {...svgProps}>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      );
    case 'arrowD':
      return (
        <svg {...svgProps}>
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...svgProps}>
          <rect width="14" height="14" x="8" y="8" rx="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      );
    default:
      return <Icon name={name} size={size} stroke={stroke} />;
  }
}
