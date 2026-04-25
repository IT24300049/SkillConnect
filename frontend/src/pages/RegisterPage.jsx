import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ROLES = [
  { value: 'customer', label: 'Customer', icon: '🏠', desc: 'Hire professionals' },
  { value: 'worker', label: 'Worker', icon: '👷', desc: 'Find gigs' },
  { value: 'supplier', label: 'Supplier', icon: '🔧', desc: 'Rent out equipment' },
];

const WORKER_CATEGORIES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Mason',
  'Painter',
  'Cleaner',
  'Driver',
  'Gardener',
  'Technician',
  'Handyman',
  'Other',
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const googleSource = location.state?.source === 'google';
  const googleEmail = location.state?.email || '';
  const [form, setForm] = useState({
    email: googleEmail,
    password: '',
    confirmPassword: '',
    role: 'customer',
    firstName: '',
    lastName: '',
    phone: '',
    workerCategory: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleCardStyle = (active) => ({
    flex: 1,
    minWidth: 0,
    padding: '14px 12px',
    borderRadius: 14,
    cursor: 'pointer',
    textAlign: 'center',
    color: active ? '#fff6f0' : '#b3b3b3',
    background: active
      ? 'linear-gradient(180deg, rgba(255,145,89,0.18) 0%, rgba(255,122,47,0.10) 100%)'
      : 'rgba(255,255,255,0.02)',
    border: active ? '1px solid rgba(255,145,89,0.6)' : '1px solid rgba(255,255,255,0.08)',
    boxShadow: active ? '0 0 0 1px rgba(255,145,89,0.18), 0 14px 30px rgba(255,107,0,0.10)' : 'none',
    transition: 'all 0.18s ease',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedPhone = form.phone.trim();

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.role === 'worker' && !form.workerCategory) {
      setError('Please select your primary skill category.');
      return;
    }

    // Password: at least 8 chars, upper, lower, symbol
    const strongPwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPwRegex.test(form.password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase and a symbol.');
      return;
    }

    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await register({ ...form, phone: normalizedPhone });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell" style={{ background: '#0e0e0e', color: '#fff' }}>
      <div className="auth-panel-left" style={{
        justifyContent: 'space-between',
        alignItems: 'stretch',
        padding: 0,
        background: '#0e0e0e',
        color: '#fff',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(145deg, rgba(255,107,0,0.22) 0%, rgba(20,20,20,0.92) 38%, rgba(0,0,0,0.98) 100%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,145,89,0.30), rgba(255,145,89,0))',
          top: -120,
          left: -100,
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,122,47,0.24), rgba(255,122,47,0))',
          right: -80,
          bottom: -90,
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          opacity: 0.14,
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '28px 34px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
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
            }}>SC</div>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.02em', color: '#ff8c3a' }}>SkillConnect</span>
          </div>
          <button type="button" style={{
            border: 'none',
            background: 'linear-gradient(135deg, #ff9159, #ff6b00)',
            color: '#1b120d',
            borderRadius: 999,
            padding: '9px 16px',
            fontWeight: 800,
            fontSize: 12,
            cursor: 'default',
            boxShadow: '0 10px 24px rgba(255,107,0,0.22)'
          }}>Join Now</button>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '32px 46px 22px' }}>
          <div style={{
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
          }}>
            The kinetic noir experience
          </div>
          <h1 style={{ fontSize: 36, lineHeight: 1.02, fontWeight: 900, marginBottom: 12, letterSpacing: '-1px', color: '#fff' }}>
            Define the <span style={{ color: '#ff9159' }}>Future of Work.</span>
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(243,244,246,0.82)', maxWidth: 360 }}>
            Connect with mentors, lead ambitious projects, and master the skills that matter. SkillConnect is where potential meets kinetic energy.
          </p>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { bg: '#2a2a2a', border: 'rgba(255,255,255,0.12)', initial: 'A' },
                { bg: '#1f1f1f', border: 'rgba(255,255,255,0.12)', initial: 'K' },
                { bg: '#141414', border: 'rgba(255,255,255,0.12)', initial: 'M' },
              ].map((a, idx) => (
                <div key={a.initial} style={{
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
                }}>{a.initial}</div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.76)' }}>
              <strong style={{ color: '#fff' }}>12k+ innovators</strong> already in the network
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '0 46px 56px' }}>
          <div style={{
            borderRadius: 16,
            padding: '10px 14px',
            marginBottom: 14,
            background: 'rgba(255,107,0,0.07)',
            border: '1px solid rgba(255,145,89,0.12)',
            boxShadow: 'inset 0 0 0 1px rgba(255,145,89,0.04)',
          }}>
            <div style={{ display: 'grid', gap: 12 }}>
              {ROLES.map((r) => (
                <div key={r.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(2px)'
                }}>
                  <span style={{ fontSize: 18 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#ffffff' }}>{r.label}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(226,232,240,0.82)' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
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
            color: '#fff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            {['Account', 'Profile', 'Verify'].map((step, idx) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: idx < 2 ? 1 : 0 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: idx === 0 ? 'linear-gradient(135deg, #ff9159, #ff6b00)' : '#2a2a2a',
                  color: idx === 0 ? '#111' : '#9ca3af',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{idx + 1}</div>
                <span style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? '#fff' : '#9ca3af' }}>{step}</span>
                {idx < 2 && <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }} />}
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 4, letterSpacing: '-0.2px' }}>
            Create Account
          </h2>
          <p style={{ fontSize: 13, color: '#adaaaa', marginBottom: 22 }}>
            Choose your role and join the kinetic ecosystem.
          </p>

          {error && <div className="alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div style={{ marginBottom: 18 }}>
            <label className="hm-label" style={{ marginBottom: 8, display: 'block', color: '#bdbdbd' }}>I am a</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={roleCardStyle(form.role === r.value)}
                >
                  <div style={{ fontSize: 17, marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.1 }}>{r.label}</div>
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.82 }}>{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label className="hm-label" style={{ color: '#7c7c7c' }}>First Name</label>
                <input className="hm-input" style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }} type="text" required placeholder="John"
                  value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <label className="hm-label" style={{ color: '#7c7c7c' }}>Last Name</label>
                <input className="hm-input" style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }} type="text" required placeholder="Doe"
                  value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="hm-label" style={{ color: '#7c7c7c' }}>Email Address</label>
              <input
                className="hm-input"
                style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                readOnly={googleSource}
              />
            </div>

            <div>
              <label className="hm-label" style={{ color: '#7c7c7c' }}>Phone (optional)</label>
              <input className="hm-input" style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }} type="tel" placeholder="07XXXXXXXX" inputMode="numeric" pattern="\d{10}" title="Enter a 10-digit mobile number"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            {form.role === 'worker' && (
              <div>
                <label className="hm-label" style={{ color: '#7c7c7c' }}>Primary Skill Category</label>
                <select
                  className="hm-input"
                  style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                  value={form.workerCategory}
                  onChange={e => setForm({ ...form, workerCategory: e.target.value })}
                  required
                >
                  <option value="">Select a category...</option>
                  {WORKER_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="hm-label" style={{ color: '#7c7c7c' }}>Password</label>
              <input
                className="hm-input"
                style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters, uppercase, lowercase & symbol"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                <span style={{ height: 4, borderRadius: 99, flex: 1, background: form.password.length > 0 ? '#ff9159' : '#2b2b2b' }} />
                <span style={{ height: 4, borderRadius: 99, flex: 1, background: form.password.length >= 8 ? '#ff7a2f' : '#2b2b2b' }} />
                <span style={{ height: 4, borderRadius: 99, flex: 1, background: /[A-Z]/.test(form.password) ? '#ffb375' : '#2b2b2b' }} />
              </div>
            </div>

            <div>
              <label className="hm-label" style={{ color: '#7c7c7c' }}>Confirm Password</label>
              <input
                className="hm-input"
                style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                type="password"
                required
                minLength={8}
                placeholder="Re-enter password"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px',
                marginTop: 10,
                borderRadius: 999,
                background: 'linear-gradient(135deg, #ff9159 0%, #ff7a2f 100%)',
                color: '#1b120d',
                boxShadow: '0 14px 30px rgba(255,107,0,0.22)'
              }}>
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</>
                : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#adaaaa', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff9159', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
