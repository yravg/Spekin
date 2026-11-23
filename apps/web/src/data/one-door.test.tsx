import { describe, expect, it } from 'vitest';

// IMP-21: no screen imports the sample module any more. Tests may, and data/source.ts is the one door.
const SOURCES = import.meta.glob(['../**/*.ts', '../**/*.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const SAMPLE_IMPORT = /from\s+['"]@spekin\/sample['"]/;

function isSourceFile(path: string): boolean {
  return /\.(ts|tsx)$/.test(path) && !/\.test\.(ts|tsx)$/.test(path) && path !== './source.ts';
}

describe('one data door (IMP-21)', () => {
  it('no file under apps/web/src except data/source.ts imports @spekin/sample', () => {
    const offenders = Object.entries(SOURCES)
      .filter(([path]) => isSourceFile(path))
      .filter(([, text]) => SAMPLE_IMPORT.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it('the glob sees the screens (a guard against an empty check)', () => {
    expect(Object.keys(SOURCES).some((path) => path.endsWith('shell/ProjectShell.tsx'))).toBe(true);
  });
});
