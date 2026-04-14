export default function TermsPage() {
    return (
        <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0c4a6e', marginBottom: 12 }}>Terms of Use</h1>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 12 }}>
                By creating an account or using SkillConnect you agree to follow these Terms of Use. This
                summary is provided for educational purposes only and does not replace professional legal
                terms.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Your Responsibilities</h2>
            <ul style={{ fontSize: 14, color: '#475569', marginLeft: 18, marginBottom: 16, listStyle: 'disc' }}>
                <li>Provide accurate information and keep your login details secure.</li>
                <li>Use the platform only for lawful purposes and respect other users.</li>
                <li>Comply with any applicable local laws and regulations when offering or booking services.</li>
            </ul>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Platform Role</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 12 }}>
                SkillConnect acts as a marketplace that connects customers, workers, and equipment suppliers.
                Workers and suppliers are independent and are not employees or agents of SkillConnect. We do
                not control how services are performed and cannot guarantee outcomes.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Reviews and Behaviour</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                Users are expected to communicate respectfully and leave fair, honest reviews. We may remove
                content or suspend accounts that are abusive, misleading, or that violate these Terms.
            </p>

            <p style={{ fontSize: 12, color: '#94a3b8' }}>
                The service is provided on an "as is" basis without warranties of any kind. For a production
                deployment, a full, legally reviewed Terms of Use document should be used instead of this
                simplified version.
            </p>
        </div>
    );
}
