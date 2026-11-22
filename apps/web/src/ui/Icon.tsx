import icons from '@spekin/design/icons.json';

const PATHS = icons as Record<string, string>;
export type IconName = keyof typeof icons;

// Same stroke icons as the boards (kit.mjs ic()). Paths come from our own generated icons.json, never from user input.
export function Icon({ name, size = 16, stroke = 1.75 }: { name: IconName; size?: number; stroke?: number }) {
  return (
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
      dangerouslySetInnerHTML={{ __html: PATHS[name] ?? PATHS.square ?? '' }}
    />
  );
}
