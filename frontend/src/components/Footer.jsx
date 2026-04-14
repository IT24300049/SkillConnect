import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#020617',
      borderTop: '1px solid rgba(148,163,184,0.4)',
      padding: '24px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 900,
          }}>S</div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: '#e5e7eb', letterSpacing: '-0.3px' }}>
            SkillConnect
          </span>
        </div>

        {/* Copyright */}
        <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500 }}>
          © 2026 SkillConnect — Sri Lanka's #1 Skilled Worker Platform
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[{ label: 'About', to: '/about' }, { label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }, { label: 'Contact', to: '/contact' }].map(link => (
            <Link
              key={link.label}
              to={link.to}
              style={{
                  color: '#9ca3af', fontSize: 12, textDecoration: 'none',
                fontWeight: 500, transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
