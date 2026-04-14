export default function AboutPage() {
    return (
        <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0c4a6e', marginBottom: 12 }}>About SkillConnect</h1>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                SkillConnect is a digital platform that helps customers in Sri Lanka discover, book, and review
                trusted skilled workers and equipment suppliers. Our goal is to make it simple and safe to hire
                the right professional for every job.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Our Mission</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                We want to bring transparency, convenience, and fair opportunity to the local skilled worker
                ecosystem by connecting customers, workers, and suppliers through one easy-to-use platform.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>What We Care About</h3>
            <ul style={{ fontSize: 14, color: '#475569', marginLeft: 18, marginBottom: 16, listStyle: 'disc' }}>
                <li>Trust and safety for both customers and workers</li>
                <li>Clear communication and transparent information</li>
                <li>Fair access to opportunities for independent workers and suppliers</li>
                <li>Continuous improvement of the booking experience</li>
            </ul>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>How SkillConnect Works</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}><strong>For customers:</strong> browse verified worker profiles, post jobs, compare options, and leave reviews after the work is complete.</p>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 8 }}><strong>For workers:</strong> create a professional profile, manage availability, receive booking requests, and build a reputation with ratings and reviews.</p>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 24 }}><strong>For suppliers:</strong> list construction tools and equipment, manage inventory, and accept or manage rental bookings.</p>

            <p style={{ fontSize: 12, color: '#94a3b8' }}>
                This page is provided for academic and demonstration purposes only and does not represent a
                live commercial service.
            </p>
        </div>
    );
}
