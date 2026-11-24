import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { sampleData } from '../data/source';
import { Btn } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Pill } from '../ui/Pill';

const { GAPA_PRIVACY, GAPA_TERMS, GAPA_USER } = sampleData;

const PRIVACY_TOC = ['Data yang kami simpan', 'Hak Anda', 'Pihak lain'];
const VALID_SAMPLE_CODE = '481000';

export type SignInPage = 'signin' | 'terms' | 'privacy';

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function SignInScreen({ page }: { page: SignInPage }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'id'>(page === 'signin' ? 'en' : 'id');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState<string>(GAPA_USER.email);
  const [emailFocused, setEmailFocused] = useState<boolean>(true);
  const [emailError, setEmailError] = useState<string>('');
  const [googleCancelled, setGoogleCancelled] = useState<boolean>(false);
  const [digits, setDigits] = useState<string[]>([...GAPA_USER.code]);
  const [activeOtp, setActiveOtp] = useState<number>(3);
  const [codeError, setCodeError] = useState<boolean>(false);
  const [triesLeft, setTriesLeft] = useState<number>(GAPA_USER.left + 1);
  const [resentNotice, setResentNotice] = useState<boolean>(false);
  const [activeToc, setActiveToc] = useState<number>(0);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    setLang(page === 'signin' ? 'en' : 'id');
    setActiveToc(0);
  }, [page]);

  const en = lang === 'en';
  const routeLabel =
    page === 'terms' ? 'spekin.example/syarat' : page === 'privacy' ? 'spekin.example/privasi' : 'spekin.example/masuk';

  function openLegal(target: 'terms' | 'privacy') {
    setLang('id');
    setActiveToc(0);
    navigate(target === 'terms' ? '/syarat' : '/privasi');
  }

  function backToSignIn() {
    setLang('en');
    setStep('email');
    setGoogleCancelled(false);
    setEmail(GAPA_USER.email);
    setEmailFocused(true);
    setEmailError('');
    navigate('/masuk');
  }

  function handleSendCode() {
    if (!isValidEmail(email)) {
      setEmailError('Enter a valid email address so we can send your six-digit code.');
      return;
    }
    setEmailError('');
    setGoogleCancelled(false);
    setDigits([...GAPA_USER.code]);
    setActiveOtp(GAPA_USER.code.findIndex((c) => c === ''));
    setCodeError(false);
    setTriesLeft(GAPA_USER.left + 1);
    setResentNotice(false);
    setStep('code');
  }

  function handleGoogle() {
    setEmailError('');
    setEmail('');
    setEmailFocused(false);
    setGoogleCancelled(true);
  }

  function updateOtpDigit(index: number, raw: string) {
    const clean = raw.replace(/\D/g, '');
    if (codeError) {
      const next = ['', '', '', '', '', ''];
      for (let k = 0; k < Math.min(clean.length, 6); k++) next[k] = clean[k] ?? '';
      setDigits(next);
      setCodeError(false);
      const nextIdx = Math.min(clean.length, 5);
      setActiveOtp(nextIdx);
      otpRefs.current[nextIdx]?.focus();
      return;
    }
    if (clean.length > 1) {
      const next = [...digits];
      for (let k = 0; k < clean.length && index + k < 6; k++) next[index + k] = clean[k] ?? '';
      setDigits(next);
      const nextIdx = Math.min(index + clean.length, 5);
      setActiveOtp(nextIdx);
      otpRefs.current[nextIdx]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 5) {
      setActiveOtp(index + 1);
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i] ?? '';
    setDigits(next);
    setCodeError(false);
    const nextIdx = Math.min(pasted.length, 5);
    setActiveOtp(nextIdx);
    otpRefs.current[nextIdx]?.focus();
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      setActiveOtp(index - 1);
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleVerifyCode() {
    const joined = digits.join('');
    if (joined === VALID_SAMPLE_CODE) {
      navigate('/');
      return;
    }
    const nextTries = Math.max(0, triesLeft - 1);
    if (nextTries === 0) {
      setDigits(['', '', '', '', '', '']);
      setActiveOtp(0);
      setCodeError(false);
      setTriesLeft(GAPA_USER.left + 1);
      setResentNotice(true);
      return;
    }
    setTriesLeft(nextTries);
    setCodeError(true);
  }

  function handleResend() {
    setDigits([...GAPA_USER.code]);
    setActiveOtp(3);
    setCodeError(false);
    setTriesLeft(GAPA_USER.left + 1);
    setResentNotice(true);
  }

  function handleUseAnotherEmail() {
    setStep('email');
    setCodeError(false);
    setEmailFocused(true);
  }

  function jumpToSection(index: number) {
    setActiveToc(index);
    const el = sectionRefs.current[index];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const legalLinks = (
    <>
      By continuing you accept the{' '}
      <button
        type="button"
        className="gpa-link"
        data-does="Opens the Terms page (/syarat) in Bahasa Indonesia"
        data-feature="F409"
        onClick={() => openLegal('terms')}
      >
        Syarat
      </button>{' '}
      and{' '}
      <button
        type="button"
        className="gpa-link"
        data-does="Opens the Privacy page (/privasi) in Bahasa Indonesia"
        data-feature="F409"
        onClick={() => openLegal('privacy')}
      >
        Privasi
      </button>
      . Both pages are in Bahasa Indonesia.
    </>
  );

  const tocItems = page === 'terms' ? GAPA_TERMS.items.map((item) => item[0]) : PRIVACY_TOC;

  return (
    <div className="ap-root" data-screen="S02">
      <div className="gpa-pub">
        <header className="gpa-ph">
          <span className="sp-mark" aria-hidden="true">
            S
          </span>
          <b className="gpa-brand">Spekin</b>
          <span className="gpa-route">{routeLabel}</span>
          <span className="sp-fill" />
          <Btn
            label="Syarat"
            cls="plain"
            sm
            does="Opens /syarat, the Terms page, in Bahasa Indonesia"
            feature="F409"
            onClick={() => openLegal('terms')}
          />
          <Btn
            label="Privasi"
            cls="plain"
            sm
            does="Opens /privasi, the Privacy page, in Bahasa Indonesia"
            feature="F409"
            onClick={() => openLegal('privacy')}
          />
          <div className="sp-lang" role="group" aria-label="Language" data-feature="F406">
            <button
              type="button"
              aria-pressed={en}
              data-does="Shows the screen in English; the Terms and Privacy pages stay in Bahasa and say so"
              data-feature="F406"
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={!en}
              data-does="Shows the screen in Bahasa Indonesia, the default"
              data-feature="F406"
              onClick={() => setLang('id')}
            >
              ID
            </button>
          </div>
        </header>

        {page === 'signin' ? (
          <div className="gpa-pb">
            <div className="gpa-hero">
              <h1>Turn an idea into a spec your team can build from</h1>
              <p>
                Answer one question at a time. Spekin writes down every decision and shapes the answers into a short
                pitch.
              </p>
              <ol className="gpa-steps">
                <li>
                  <i>1</i>
                  <span>
                    <b>Sign in</b> with an email code or Google. No password.
                  </span>
                </li>
                <li>
                  <i>2</i>
                  <span>
                    <b>Describe your idea</b> in one box and pick a domain.
                  </span>
                </li>
                <li>
                  <i>3</i>
                  <span>
                    <b>Answer</b> short questions. Each has a recommended answer.
                  </span>
                </li>
              </ol>
              <div className="gpa-peek" aria-hidden="true">
                <span className="t">What you get after the interview</span>
                <div className="r">
                  <b>D-001</b>
                  <span>Project controls lead reads it first</span>
                </div>
                <div className="r">
                  <b>D-003</b>
                  <span>Flag a package over 3% of budget</span>
                </div>
                <div className="r">
                  <b>Pitch</b>
                  <span>Problem, appetite, solution, rabbit holes, no-gos</span>
                </div>
              </div>
            </div>

            {step === 'email' ? (
              <div className="gpa-card" data-feature="F401">
                <div>
                  <h2>Sign in</h2>
                  <p className="gpa-sub">
                    No password. We email you a six-digit code, or you can continue with Google.
                  </p>
                </div>
                {googleCancelled ? (
                  <div className="gpa-bn warn" data-feature="F405">
                    <Icon name="alert" size={16} />
                    <p>
                      <b>Google sign-in was cancelled.</b> Nothing changed and no account was made. Try Google again or
                      use the email code.
                    </p>
                  </div>
                ) : null}
                <div className="gpa-fl">
                  <span className="l">Email</span>
                  <div
                    className={'gpa-in ap-ta-wrap' + (emailFocused ? ' focus' : '') + (emailError ? ' err' : '')}
                    role="textbox"
                    aria-label="Email address"
                  >
                    {email ? <span>{email}</span> : <span className="ph">name@company.com</span>}
                    <input
                      type="email"
                      aria-label="Email address"
                      className="ap-gpa-input"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </div>
                  {emailError ? (
                    <span className="gpa-hint err">
                      <Icon name="alert" size={14} />
                      <span>{emailError}</span>
                    </span>
                  ) : (
                    <span className="gpa-hint">We send one code. It works for 10 minutes.</span>
                  )}
                </div>
                <Btn
                  label="Send me a code"
                  cls="ink"
                  does="Sends a six-digit code to the email address and opens the code step; an invalid address shows a message under the field and sends nothing"
                  feature="F402"
                  onClick={handleSendCode}
                />
                <div className="gpa-or">or</div>
                <Btn
                  label={googleCancelled ? 'Try Google again' : 'Continue with Google'}
                  icon="globe"
                  does="Hands off to Google sign-in; on return the same account is used as the email code for that address"
                  feature="F404"
                  onClick={handleGoogle}
                />
                <p className="gpa-fine">{legalLinks}</p>
              </div>
            ) : (
              <div className="gpa-card" data-feature="F403">
                <div>
                  <h2>Check your email</h2>
                  <p className="gpa-sub">
                    We sent a six-digit code to <b>{email}</b>. Type it here or paste it.
                  </p>
                </div>
                <div className={'gpa-otp' + (codeError ? ' err' : '')} role="group" aria-label="Six-digit code">
                  {digits.map((digit, i) => (
                    <span key={i} className={'ap-otp-box' + (!codeError && i === activeOtp ? ' on' : '')}>
                      {digit}
                      <input
                        ref={(el) => {
                          otpRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        aria-label={'Digit ' + (i + 1)}
                        className="ap-otp-in"
                        value={digit}
                        onChange={(e) => updateOtpDigit(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        onFocus={() => setActiveOtp(i)}
                      />
                    </span>
                  ))}
                </div>
                {codeError ? (
                  <span className="gpa-hint err">
                    <Icon name="alert" size={14} />
                    <span>
                      That code is not right. {triesLeft} tries left, then we send a new one.
                    </span>
                  </span>
                ) : resentNotice ? (
                  <span className="gpa-hint">We sent a fresh code and voided the old one. It works for 10 minutes.</span>
                ) : (
                  <span className="gpa-hint">The code works for 10 minutes. Check spam if it does not arrive.</span>
                )}
                <Btn
                  label="Sign in"
                  cls="ink"
                  does="Checks the six digits with the server; on success opens the app, on failure keeps the boxes and shows the message"
                  feature="F403"
                  onClick={handleVerifyCode}
                />
                <button
                  type="button"
                  className="gpa-link"
                  data-does="Sends a fresh code and voids the old one; the button waits for the countdown"
                  data-feature="F403"
                  onClick={handleResend}
                >
                  Send a new code{codeError ? '' : ' in ' + GAPA_USER.resend}
                </button>
                <Btn
                  label="Use another email"
                  cls="plain"
                  sm
                  does="Goes back to the email step without sending anything"
                  feature="F402"
                  onClick={handleUseAnotherEmail}
                />
                {codeError ? (
                  <p className="gpa-fine">
                    <span className="gpa-bn warn" data-feature="F405">
                      We never say whether an email already has an account. The same message shows either way.
                    </span>
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="gpa-legal">
            <nav className="gpa-toc" aria-label="On this page">
              <span className="t">On this page</span>
              {tocItems.map((title, i) => (
                <button
                  key={title}
                  type="button"
                  aria-current={i === activeToc ? 'true' : undefined}
                  data-does={'Jumps to ' + title + ' on this page'}
                  data-feature="F407"
                  onClick={() => jumpToSection(i)}
                >
                  {title}
                </button>
              ))}
            </nav>

            {page === 'terms' ? (
              <div className="gpa-art" data-feature="F407">
                <h1>{GAPA_TERMS.title}</h1>
                <div className="meta">
                  <Pill tone="ok" label="Bahasa Indonesia" />
                  <span>{GAPA_TERMS.since}</span>
                  <span>·</span>
                  <span>Teks contoh, belum ditinjau hukum</span>
                </div>
                {GAPA_TERMS.items.map(([heading, body], i) => (
                  <section
                    key={heading}
                    ref={(el) => {
                      sectionRefs.current[i] = el;
                    }}
                  >
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{heading}</h3>
                    <p>{body}</p>
                  </section>
                ))}
              </div>
            ) : (
              <div className="gpa-art" data-feature="F408">
                <h1>{GAPA_PRIVACY.title}</h1>
                <div className="meta">
                  <Pill tone="ok" label="Bahasa Indonesia" />
                  <span>{GAPA_PRIVACY.since}</span>
                  <span>·</span>
                  <span>Teks contoh, belum ditinjau hukum</span>
                </div>
                {en ? (
                  <div className="gpa-bn warn">
                    <Icon name="alert" size={16} />
                    <p>
                      <b>English text is not available yet.</b> This page stays in Bahasa Indonesia at launch.
                    </p>
                  </div>
                ) : null}
                <section
                  ref={(el) => {
                    sectionRefs.current[0] = el;
                  }}
                >
                  <span className="n">01</span>
                  <h3>Data yang kami simpan</h3>
                  <p>Kami hanya menyimpan data yang dibutuhkan untuk menjalankan Spekin.</p>
                </section>
                <table className="sp-tbl">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Tujuan</th>
                      <th style={{ width: 150 }}>Lama simpan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GAPA_PRIVACY.rows.map(([data, purpose, retention]) => (
                      <tr key={data}>
                        <td>
                          <b>{data}</b>
                        </td>
                        <td>{purpose}</td>
                        <td>{retention}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <section
                  ref={(el) => {
                    sectionRefs.current[1] = el;
                  }}
                >
                  <span className="n">02</span>
                  <h3>Hak Anda</h3>
                  <p>
                    Anda dapat meminta unduhan atau penghapusan data kapan saja. Kirim permintaan ke
                    halo@spekin.example (contoh).
                  </p>
                </section>
                <section
                  ref={(el) => {
                    sectionRefs.current[2] = el;
                  }}
                >
                  <span className="n">03</span>
                  <h3>Pihak lain</h3>
                  <p>
                    Kami tidak menjual data Anda. Penyedia model hanya menerima konteks yang Anda lihat di daftar
                    konteks sebelum Anda menekan Kirim.
                  </p>
                </section>
              </div>
            )}

            <aside className="gpa-side">
              <div className="gpa-sc" data-feature="F409">
                <h4>Dua halaman hukum</h4>
                <p>Kedua halaman bisa dibuka tanpa masuk.</p>
                <Btn
                  label="Syarat Penggunaan"
                  cls={page === 'terms' ? 'ink' : 'ghost'}
                  sm
                  does="Opens the Terms page (/syarat)"
                  feature="F409"
                  onClick={() => openLegal('terms')}
                />
                <Btn
                  label="Kebijakan Privasi"
                  cls={page === 'privacy' ? 'ink' : 'ghost'}
                  sm
                  does="Opens the Privacy page (/privasi)"
                  feature="F409"
                  onClick={() => openLegal('privacy')}
                />
              </div>
              <div className="gpa-sc">
                <h4>English</h4>
                <p>At launch both pages are in Bahasa Indonesia only. An English text follows later.</p>
                <Btn
                  label="Read in English"
                  sm
                  later="English text of Terms and Privacy follows the Bahasa launch"
                />
              </div>
              <div className="gpa-sc">
                <h4>Back to sign-in</h4>
                <Btn
                  label="Kembali ke masuk"
                  cls="plain"
                  sm
                  does="Returns to the sign-in screen"
                  feature="F401"
                  onClick={backToSignIn}
                />
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
