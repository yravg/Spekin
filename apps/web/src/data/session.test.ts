import { beforeEach, describe, expect, it } from 'vitest';
import { connection, lastCopy, readThrough, resetSession, retryFailedReads } from './session';
import { initialReadValue } from './provider';

// IMP-39 · S35 F378: an API read never falls back to the sample. The last API value stays in
// memory for the session, a failure raises the offline banner, and Try again re-runs only when
// the server answers again.

beforeEach(() => resetSession());

describe('offline reads through one data source (IMP-39)', () => {
  it('a read failure after a success keeps the last API value and shows the banner', async () => {
    const apiRows = [{ id: 'sonnet-6', name: 'Sonnet 6' }];
    await readThrough('models', async () => apiRows);
    expect(lastCopy<typeof apiRows>('models')?.value).toEqual(apiRows);
    expect(connection().offline).toBe(false);
    expect(connection().lastLoadedAt).toBeInstanceOf(Date);

    await expect(
      readThrough('models', async () => {
        throw new Error('The Spekin server is not answering.');
      }),
    ).rejects.toThrow('not answering');

    // The screen keeps what the API said, not the sample and not an empty list.
    expect(lastCopy<typeof apiRows>('models')?.value).toEqual(apiRows);
    expect(connection().offline).toBe(true);
  });

  it('a failure with no earlier success never shows sample values', async () => {
    const seed = [{ id: 'sample-row' }];
    expect(initialReadValue('contracts', 'api', seed)).toBeNull();

    await expect(
      readThrough('contracts', async () => {
        throw new Error('The Spekin server is not answering.');
      }),
    ).rejects.toThrow('not answering');

    expect(lastCopy('contracts')).toBeUndefined();
    expect(initialReadValue('contracts', 'api', seed)).toBeNull();
    // Sample mode is unchanged: the drawn sample is the answer.
    expect(initialReadValue('contracts', 'sample', seed)).toEqual(seed);
  });

  it('Try again clears the banner when the mock starts answering', async () => {
    let answering = false;
    const read = async () => {
      if (!answering) throw new Error('The Spekin server is not answering.');
      return ['served'];
    };

    await expect(readThrough('skills', read)).rejects.toThrow('not answering');
    expect(connection().offline).toBe(true);

    answering = true;
    await retryFailedReads();

    expect(connection().offline).toBe(false);
    expect(lastCopy<string[]>('skills')?.value).toEqual(['served']);
  });
});
