// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { GAPA_PRIVACY, GAPA_TERMS, GAPA_USER } from '@spekin/sample';
import { SignInScreen } from './SignInScreen';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function renderStatic(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/masuk" element={<SignInScreen page="signin" />} />
        <Route path="/syarat" element={<SignInScreen page="terms" />} />
        <Route path="/privasi" element={<SignInScreen page="privacy" />} />
      </Routes>
    </MemoryRouter>,
  );
}

function mountAt(path: string) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/masuk" element={<SignInScreen page="signin" />} />
          <Route path="/syarat" element={<SignInScreen page="terms" />} />
          <Route path="/privasi" element={<SignInScreen page="privacy" />} />
          <Route path="/" element={<div data-testid="app-home">Home</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  return {
    host,
    cleanup: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}

describe('S02 Sign-in and legal pages (IMP-54)', () => {
  it('renders Sign in at "/masuk" with email-first card, Google second, and legal links', () => {
    const html = renderStatic('/masuk');
    expect(html).toContain('data-screen="S02"');
    expect(html).toContain('spekin.example/masuk');
    expect(html).toContain('data-feature="F401"');
    expect(html).toContain('data-feature="F402"');
    expect(html).toContain('data-feature="F404"');
    expect(html).toContain('data-feature="F406"');
    expect(html).toContain('data-feature="F409"');
    expect(html).toContain(GAPA_USER.email);
    expect(html).toContain('Send me a code');
    expect(html).toContain('Continue with Google');
    expect(html).toContain('Syarat');
    expect(html).toContain('Privasi');
  });

  it('validates email, transitions to 6-digit code step, and handles wrong code and tries limit', () => {
    const { host, cleanup } = mountAt('/masuk');
    try {
      const sendBtn = [...host.querySelectorAll('button')].find((b) => b.textContent === 'Send me a code');
      expect(sendBtn).toBeTruthy();

      // Send code moves to code step (F403)
      act(() => sendBtn!.click());
      expect(host.textContent).toContain('Check your email');
      expect(host.textContent).toContain(GAPA_USER.email);
      expect(host.textContent).toContain('Send a new code in ' + GAPA_USER.resend);
      expect(host.querySelector('[data-feature="F403"]')).toBeTruthy();

      // Fill remaining boxes with wrong digits 9, 0, 2 and click Sign in -> wrong state (F405)
      const inputs = [...host.querySelectorAll<HTMLInputElement>('.gpa-otp input')];
      expect(inputs.length).toBe(6);
      const setVal = (el: HTMLInputElement, v: string) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      act(() => {
        setVal(inputs[3]!, '9');
        setVal(inputs[4]!, '0');
        setVal(inputs[5]!, '2');
      });

      const signInBtn = [...host.querySelectorAll('button')].find((b) => b.textContent === 'Sign in');
      expect(signInBtn).toBeTruthy();
      act(() => signInBtn!.click());

      expect(host.querySelector('.gpa-otp.err')).toBeTruthy();
      expect(host.textContent).toContain(`That code is not right. ${GAPA_USER.left} tries left, then we send a new one.`);
      expect(host.textContent).toContain('We never say whether an email already has an account.');
      expect(host.querySelector('[data-feature="F405"]')).toBeTruthy();
    } finally {
      cleanup();
    }
  });

  it('handles Google sign-in cancel return with F405 banner and Try Google again', () => {
    const { host, cleanup } = mountAt('/masuk');
    try {
      const googleBtn = [...host.querySelectorAll('button')].find((b) => b.textContent?.includes('Continue with Google'));
      expect(googleBtn).toBeTruthy();
      act(() => googleBtn!.click());

      expect(host.textContent).toContain('Google sign-in was cancelled.');
      expect(host.textContent).toContain('Try Google again');
      expect(host.textContent).toContain('name@company.com');
      expect(host.querySelector('[data-feature="F405"]')).toBeTruthy();
    } finally {
      cleanup();
    }
  });

  it('renders /syarat in Bahasa Indonesia with TOC, sample marking, and Read in English marked data-later', () => {
    const html = renderStatic('/syarat');
    expect(html).toContain('data-screen="S02"');
    expect(html).toContain('spekin.example/syarat');
    expect(html).toContain('data-feature="F407"');
    expect(html).toContain(GAPA_TERMS.title);
    expect(html).toContain(GAPA_TERMS.since);
    expect(html).toContain('Teks contoh, belum ditinjau hukum');
    for (const [heading] of GAPA_TERMS.items) expect(html).toContain(heading);
    expect(html).toContain('data-later="English text of Terms and Privacy follows the Bahasa launch"');
  });

  it('renders /privasi with data table and shows EN notice when EN is pressed', () => {
    const { host, cleanup } = mountAt('/privasi');
    try {
      expect(host.textContent).toContain(GAPA_PRIVACY.title);
      expect(host.textContent).toContain('Teks contoh, belum ditinjau hukum');
      for (const [data] of GAPA_PRIVACY.rows) expect(host.textContent).toContain(data);
      // Default is ID: no English notice yet
      expect(host.textContent).not.toContain('English text is not available yet.');

      const enBtn = [...host.querySelectorAll('button')].find((b) => b.textContent === 'EN');
      expect(enBtn).toBeTruthy();
      act(() => enBtn!.click());
      expect(host.textContent).toContain('English text is not available yet.');
      expect(host.querySelector('[data-feature="F408"]')).toBeTruthy();
    } finally {
      cleanup();
    }
  });
});
