export default function ContactPage() {
    return (
        <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0c4a6e', marginBottom: 12 }}>Contact Us</h1>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                We are happy to hear from you. Use the channels below to report issues, share feedback, or ask
                questions about SkillConnect.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Support Email</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                Email: <a href="mailto:support@skillconnect.example" style={{ color: '#0ea5e9', textDecoration: 'none' }}>support@skillconnect.example</a>
                <br />
                We aim to respond within 1–2 business days.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Address</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                SkillConnect (Demo Project)
                <br />
                Colombo, Sri Lanka
            </p>

            <p style={{ fontSize: 12, color: '#94a3b8' }}>
                This contact information is for academic demonstration only. Do not use it for real customer
                support requests.
            </p>
        </div>
    );
}
