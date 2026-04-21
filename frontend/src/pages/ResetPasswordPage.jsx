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
        <div className="auth-shell">
            <div className="auth-panel-left">
                <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
                <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Set New Password</h2>
                <p style={{ opacity: 0.85, fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
                    Enter your reset token and choose a strong new password.
                </p>
            </div>

            <div className="auth-panel-right">
                <div style={{ width: '100%', maxWidth: 420 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0c4a6e', marginBottom: 6 }}>Reset Password</h3>
                    <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                        Your new password must include uppercase, lowercase and a symbol.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label className="hm-label">Reset Token</label>
                            <input
                                className="hm-input"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Paste reset token"
                                required
                            />
                        </div>

                        <div>
                            <label className="hm-label">New Password</label>
                            <input
                                className="hm-input"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                minLength={8}
                                required
                            />
                        </div>

                        <div>
                            <label className="hm-label">Confirm Password</label>
                            <input
                                className="hm-input"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                minLength={8}
                                required
                            />
                        </div>

                        {error && <div className="alert-error">{error}</div>}
                        {message && <div className="alert-success">{message}</div>}

                        <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <Link
                            to="/login"
                            style={{
                                textAlign: 'center',
                                textDecoration: 'none',
                                color: '#0891b2',
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            Back to Login
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
