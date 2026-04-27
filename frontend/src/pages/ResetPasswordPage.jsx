import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [token, setToken] = useState(searchParams.get('token') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordStrengthScore = [
        newPassword.length >= 8,
        /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
        /[^A-Za-z0-9]/.test(newPassword),
    ].filter(Boolean).length;

    const passwordStrengthMeta = [
        { label: 'Start typing your new password', color: '#7c7c7c' },
        { label: 'Strength: Weak', color: '#ef4444' },
        { label: 'Strength: Medium', color: '#f59e0b' },
        { label: 'Strength: Strong', color: '#22c55e' },
    ][newPassword.length > 0 ? passwordStrengthScore : 0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token.trim()) {
            setError('Reset token is required.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await authAPI.resetPassword(token.trim(), newPassword);
            setMessage(res.data?.message || 'Password reset successful. You can now log in.');
            setTimeout(() => navigate('/login'), 1400);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

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
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(255,107,0,0.20) 0%, rgba(20,20,20,0.92) 40%, rgba(0,0,0,0.98) 100%)', zIndex: 0 }} />
                <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,145,89,0.30), rgba(255,145,89,0))', top: -120, left: -100, zIndex: 0 }} />
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,47,0.24), rgba(255,122,47,0))', right: -80, bottom: -90, zIndex: 0 }} />

                <div style={{ position: 'relative', zIndex: 1, padding: '28px 34px 0' }}>
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
                </div>

                <div style={{ position: 'relative', zIndex: 1, padding: '0 34px 48px' }}>
                    <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,145,89,0.12)', border: '1px solid rgba(255,145,89,0.28)', color: '#ffb375', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
                        Secure Access Recovery
                    </span>
                    <h2 style={{ fontSize: 'clamp(34px, 4.5vw, 54px)', lineHeight: 1.03, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em', color: '#f8f8f8' }}>
                        Reset
                        <span style={{ color: '#ff9159' }}> Your Password.</span>
                    </h2>
                    <p style={{ maxWidth: 420, color: '#c8c8c8', fontSize: 18, lineHeight: 1.5 }}>
                        Enter your reset token and create a new secure password to continue.
                    </p>
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
                    <h3 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 6, letterSpacing: '-0.2px' }}>Reset Password</h3>
                    <p style={{ fontSize: 13, color: '#adaaaa', marginBottom: 22 }}>
                        Your new password must include uppercase, lowercase and a symbol.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label className="hm-label" style={{ color: '#7c7c7c' }}>Reset Token</label>
                            <input
                                className="hm-input"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste reset token"
                                required
                                style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                            />
                        </div>

                        <div>
                            <label className="hm-label" style={{ color: '#7c7c7c' }}>New Password</label>
                            <input
                                className="hm-input"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                minLength={8}
                                required
                                style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                            />
                            <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                                <span style={{ height: 4, borderRadius: 99, flex: 1, background: newPassword.length >= 8 ? '#ef4444' : '#2b2b2b' }} />
                                <span style={{ height: 4, borderRadius: 99, flex: 1, background: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? '#f59e0b' : '#2b2b2b' }} />
                                <span style={{ height: 4, borderRadius: 99, flex: 1, background: /[^A-Za-z0-9]/.test(newPassword) ? '#22c55e' : '#2b2b2b' }} />
                            </div>
                            <p style={{ marginTop: 6, marginBottom: 0, fontSize: 11.5, color: passwordStrengthMeta.color, opacity: 0.9 }}>
                                {passwordStrengthMeta.label}
                            </p>
                        </div>

                        <div>
                            <label className="hm-label" style={{ color: '#7c7c7c' }}>Confirm Password</label>
                            <input
                                className="hm-input"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                minLength={8}
                                required
                                style={{ background: '#262626', borderColor: '#2f2f2f', color: '#fff' }}
                            />
                        </div>

                        {error && <div className="alert-error">{error}</div>}
                        {message && <div className="alert-success">{message}</div>}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
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
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <Link
                            to="/login"
                            style={{ textAlign: 'center', textDecoration: 'none', color: '#ff9159', fontSize: 13, fontWeight: 800 }}
                        >
                            Back to Login
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
