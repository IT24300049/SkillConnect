import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f0f9ff', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: 24,
        }}>
            <div>
                <div style={{ fontSize: 120, fontWeight: 900, color: '#bae6fd', lineHeight: 1, marginBottom: 16 }}>404</div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0c4a6e', marginBottom: 8 }}>Page Not Found</h1>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button className="btn-primary" onClick={() => navigate('/')}>← Go Home</button>
            </div>
        </div>
    );
}
