import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const googleBtnRef = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotToken, setForgotToken] = useState('');

  const handleGoogleResponse = async (response) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleLogin(response.credential);
      if (result?.needRegistration) {
        navigate('/register', { state: { source: 'google', email: result.email } });
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: '100%',
      });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotToken('');
    try {
      const { authAPI } = await import('../api');
      const res = await authAPI.forgotPassword(forgotEmail);
      const rawMessage = String(res.data.data || res.data.message || 'Reset instructions sent.');
      setForgotMsg(rawMessage);

      const tokenMatch = rawMessage.match(/:\s*([A-Za-z0-9-]{20,})\s*$/);
      if (tokenMatch?.[1]) {
        setForgotToken(tokenMatch[1]);
      }
    } catch (err) {
      setForgotMsg(`Error: ${err.response?.data?.message || 'Something went wrong'}`);
    }
  };

  if (forgotMode) {
    return (
      <div className="auth-shell" style={{ background: '#0e0e0e', color: '#fff' }}>
        <div
          className="auth-panel-left"
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: 36,
            background:
              'linear-gradient(145deg, rgba(255,107,0,0.22) 0%, rgba(20,20,20,0.92) 38%, rgba(0,0,0,0.98) 100%)',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Forgot Password?</h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 320, lineHeight: 1.7 }}>
            No worries. Enter your email and we will send you a password reset link.
          </p>
        </div>

        <div className="auth-panel-right" style={{ alignItems: 'center', background: '#0e0e0e' }}>
          <div
            className="fade-in"
            style={{
              width: '100%',
              maxWidth: 460,
              borderRadius: 24,
              padding: '30px 28px',
              background: 'linear-gradient(180deg, rgba(18,18,18,0.96) 0%, rgba(24,24,24,0.95) 100%)',
              boxShadow: '0 28px 56px rgba(0,0,0,0.48)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#fff',
            }}
          >
            <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.2px' }}>Reset Password</h3>
            <p style={{ fontSize: 13, color: '#adaaaa', marginBottom: 20 }}>Enter your email to receive a reset link.</p>

            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="hm-label" style={{ color: '#7c7c7c' }}>Email Address</label>
                <input
                  className="hm-input"
                  style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #ff9159 0%, #ff7a2f 100%)',
                  color: '#1b120d',
                  boxShadow: '0 14px 30px rgba(255,107,0,0.22)',
                }}
              >
                Send Reset Link
              </button>

              {forgotMsg && <div className="alert-info">{forgotMsg}</div>}

              {forgotToken && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navigate(`/reset-password?token=${encodeURIComponent(forgotToken)}`)}
                >
                  Continue to Reset Password
                </button>
              )}

              <button
                type="button"
                onClick={() => setForgotMode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff9159',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  paddingTop: 4,
                }}
              >
                ← Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell" style={{ background: '#0e0e0e', color: '#fff' }}>
      <div
        className="auth-panel-left"
        style={{
          justifyContent: 'space-between',
          alignItems: 'stretch',
          padding: 0,
          background: '#0e0e0e',
          color: '#fff',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(145deg, rgba(255,107,0,0.22) 0%, rgba(20,20,20,0.92) 38%, rgba(0,0,0,0.98) 100%)',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,145,89,0.30), rgba(255,145,89,0))',
            top: -120,
            left: -100,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,122,47,0.24), rgba(255,122,47,0))',
            right: -80,
            bottom: -90,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            opacity: 0.14,
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '28px 34px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff9159, #ff6b00)',
                boxShadow: '0 0 0 6px rgba(255,107,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#111',
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              SC
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.02em', color: '#ff8c3a' }}>SkillConnect</span>
          </div>

          <button
            type="button"
            style={{
              border: 'none',
              background: 'linear-gradient(135deg, #ff9159, #ff6b00)',
              color: '#1b120d',
              borderRadius: 999,
              padding: '9px 16px',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'default',
              boxShadow: '0 10px 24px rgba(255,107,0,0.22)',
            }}
          >
            Join Now
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '36px 46px 40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255,107,0,0.08)',
              border: '1px solid rgba(255,145,89,0.18)',
              color: '#ffb37a',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            The kinetic noir experience
          </div>

          <h1 style={{ fontSize: 36, lineHeight: 1.02, fontWeight: 900, marginBottom: 12, letterSpacing: '-1px', color: '#fff' }}>
            Welcome Back to <span style={{ color: '#ff9159' }}>SkillConnect.</span>
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(243,244,246,0.82)', maxWidth: 380 }}>
            Sign in to connect with trusted workers, manage projects, and keep your bookings moving in one kinetic workspace.
          </p>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { bg: '#2a2a2a', border: 'rgba(255,255,255,0.12)', initial: 'A' },
                { bg: '#1f1f1f', border: 'rgba(255,255,255,0.12)', initial: 'K' },
                { bg: '#141414', border: 'rgba(255,255,255,0.12)', initial: 'M' },
              ].map((a, idx) => (
                <div
                  key={a.initial}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: a.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                    border: `1px solid ${a.border}`,
                    marginLeft: idx === 0 ? 0 : -8,
                  }}
                >
                  {a.initial}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>
              <strong style={{ color: '#fff' }}>12k+ innovators</strong> already in the network
            </div>
          </div>
        </div>
      </div>

      <div className="auth-panel-right" style={{ alignItems: 'center', background: '#0e0e0e' }}>
        <div
          className="fade-in"
          style={{
            width: '100%',
            maxWidth: 520,
            borderRadius: 26,
            padding: '26px 26px 22px',
            background: 'linear-gradient(180deg, rgba(18,18,18,0.96) 0%, rgba(24,24,24,0.95) 100%)',
            boxShadow: '0 28px 56px rgba(0,0,0,0.48)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {['Account', 'Access', 'Verify'].map((step, idx) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: idx < 2 ? 1 : 0 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: idx === 0 ? 'linear-gradient(135deg, #ff9159, #ff6b00)' : '#2a2a2a',
                    color: idx === 0 ? '#111' : '#9ca3af',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? '#fff' : '#9ca3af' }}>{step}</span>
                {idx < 2 && <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }} />}
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 4, letterSpacing: '-0.2px' }}>
            Sign In
          </h2>
          <p style={{ fontSize: 13, color: '#adaaaa', marginBottom: 22 }}>
            Continue your projects and bookings from your dashboard.
          </p>

          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="hm-label" style={{ color: '#7c7c7c' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 15,
                    color: '#9ca3af',
                  }}
                >
                  ✉️
                </span>
                <input
                  className="hm-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ paddingLeft: 40, background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label className="hm-label" style={{ marginBottom: 0, color: '#7c7c7c' }}>Password</label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff9159',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 15,
                    color: '#9ca3af',
                  }}
                >
                  🔒
                </span>
                <input
                  className="hm-input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingLeft: 40, background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px',
                marginTop: 6,
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff9159 0%, #ff7a2f 100%)',
                color: '#1b120d',
                boxShadow: '0 14px 30px rgba(255,107,0,0.22)',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
              <span style={{ fontSize: 11, color: '#8f8f8f', textTransform: 'uppercase', fontWeight: 700 }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
            </div>

            <div style={{ marginTop: 2 }}>
              {GOOGLE_CLIENT_ID ? (
                <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center' }} />
              ) : (
                <button
                  type="button"
                  onClick={() => alert('Set VITE_GOOGLE_CLIENT_ID in .env to enable Google login.')}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 999,
                    border: '1px solid #2f2f2f',
                    background: '#1f1f1f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: 'conic-gradient(from 45deg,#ea4335,#fbbc05,#34a853,#4285f4,#ea4335)',
                    }}
                  />
                  Google
                </button>
              )}
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 14 }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: '#ff9159', fontWeight: 800, textDecoration: 'none' }}>
                Join SkillConnect
              </Link>
            </p>
          </form>

          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'center',
              gap: 18,
              fontSize: 11,
              color: '#6f6f6f',
            }}
          >
            <Link to="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
              Terms of Service
            </Link>
            <Link to="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}