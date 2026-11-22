import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, ArrowRight, LockKeyhole, LoaderCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { content } from './content';
import { getMembership } from './data.functions';
export function Login({ recovery = false }: { recovery?: boolean }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  useEffect(() => {
    if (recovery) {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const isRecovery = ['recovery', 'invite'].includes(hash.get('type') ?? '');
      const check = () => {
        void supabase.auth
          .getUser()
          .then(({ data }) =>
            setRecoveryReady(
              (isRecovery || window.sessionStorage.getItem('anniversary-recovery') === 'true') &&
                Boolean(data.user)
            )
          );
      };
      check();
      window.addEventListener('anniversary-recovery', check);
      return () => window.removeEventListener('anniversary-recovery', check);
    }
    void supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        try {
          await getMembership();
          void navigate({ to: '/home', replace: true });
        } catch {
          /* A nonmember remains at login. */
        }
      }
    });
    return undefined;
  }, [navigate, recovery]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError(false);
    try {
      if (recovery) {
        if (!recoveryReady)
          throw new Error('Open the secure password reset link in your email to continue.');
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Your password has been updated. You can sign in now.');
        window.sessionStorage.removeItem('anniversary-recovery');
        await supabase.auth.signOut();
        setRecoveryReady(false);
      } else if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMessage('If this email belongs to an account, a secure reset link is on its way.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try {
          await getMembership();
        } catch {
          await supabase.auth.signOut();
          throw new Error('This account is not one of the two members of this private space.');
        }
        await navigate({ to: '/home', replace: true });
      }
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : 'We could not connect. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-shell">
      <section className="login-photo" aria-label="Our anniversary">
        <img src={content.loginPhoto} alt="A couple embracing on a coastal hillside at sunset" />
        <div className="photo-top">
          Always, Us<span className="ml-2 text-sm italic">.</span>
        </div>
        <div className="photo-copy">
          <div className="eyebrow">A love worth keeping</div>
          <h2>
            Seven years.
            <br />A lifetime to go.
          </h2>
          <div className="photo-line" />
          <p>
            Every little moment. Every beautiful memory.
            <br />A place for everything that makes us, us.
          </p>
          <p className="mt-6">24 March 2020 — forever</p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <div className="login-seal">{content.monogram}</div>
          <div className="eyebrow">Our own little world</div>
          <h1>
            {recovery ? (
              'A fresh beginning.'
            ) : forgot ? (
              'Find your way back.'
            ) : (
              <>
                Just you.
                <br />
                Just me. Just us.
              </>
            )}
          </h1>
          <p className="intro">
            {recovery ? (
              'Choose a new password for our private space.'
            ) : forgot ? (
              'A little help finding your way back to our memories.'
            ) : (
              <>
                Welcome to our little corner of the world.
                <br />
                Our story, kept close.
              </>
            )}
          </p>
          <form onSubmit={submit}>
            {!recovery && (
              <div className="field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            {(!forgot || recovery) && (
              <div className="field">
                <div className="password-label">
                  <label htmlFor="password">{recovery ? 'New password' : 'Password'}</label>
                  {!recovery && (
                    <Button
                      type="button"
                      variant="link"
                      className="forgot"
                      onClick={() => {
                        setForgot(true);
                        setMessage('');
                      }}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <div className="password-wrap">
                  <input
                    id="password"
                    type={visible ? 'text' : 'password'}
                    autoComplete={recovery ? 'new-password' : 'current-password'}
                    minLength={recovery ? 8 : undefined}
                    placeholder={recovery ? 'At least 8 characters' : 'Your password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    className="password-toggle"
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    onClick={() => setVisible((v) => !v)}
                  >
                    {visible ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
            )}
            {message && (
              <p
                role={error ? 'alert' : 'status'}
                className={`form-message ${error ? 'form-error' : ''}`}
              >
                {message}
              </p>
            )}
            <Button
              className="login-submit"
              type="submit"
              disabled={busy || (recovery && !recoveryReady)}
            >
              {busy ? (
                <>
                  <span>One little moment…</span>
                  <LoaderCircle className="animate-spin" />
                </>
              ) : (
                <>
                  <span>
                    {recovery
                      ? 'Save new password'
                      : forgot
                        ? 'Send reset link'
                        : 'Enter our little world'}
                  </span>
                  <ArrowRight />
                </>
              )}
            </Button>
          </form>
          {(forgot || recovery) && (
            <Button
              variant="link"
              className="mt-4 px-0"
              onClick={() => {
                if (recovery) void navigate({ to: '/auth' });
                else {
                  setForgot(false);
                  setMessage('');
                }
              }}
            >
              <ArrowLeft />
              Back to sign in
            </Button>
          )}
          <p className="login-lock">
            <LockKeyhole />A private space, only for the two of us.
          </p>
        </div>
        <div className="login-footer">Some things are too special to share with the world.</div>
      </section>
    </main>
  );
}
