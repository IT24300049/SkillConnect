export default function PrivacyPage() {
    return (
        <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0c4a6e', marginBottom: 12 }}>Privacy Policy</h1>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 12 }}>
                This Privacy Policy explains how SkillConnect collects, uses, and protects information when you
                use our platform. This project is for academic demonstration only and is not intended as legal
                advice.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Information We Collect</h2>
            <ul style={{ fontSize: 14, color: '#475569', marginLeft: 18, marginBottom: 16, listStyle: 'disc' }}>
                <li>Account details such as your name, email address, and phone number.</li>
                <li>Profile details including location, bio, skill category, and optional profile photo.</li>
                <li>Booking, job, and review information created while using the platform.</li>
                <li>Technical data such as log information and basic device or browser details.</li>
            </ul>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>How We Use Your Information</h2>
            <ul style={{ fontSize: 14, color: '#475569', marginLeft: 18, marginBottom: 16, listStyle: 'disc' }}>
                <li>To create and manage user accounts and profiles.</li>
                <li>To connect customers with workers and suppliers and manage bookings.</li>
                <li>To communicate important updates, notifications, and support messages.</li>
                <li>To maintain the security, reliability, and quality of the service.</li>
            </ul>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Sharing of Information</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 12 }}>
                We share limited information with other users when necessary to provide the service (for example,
                showing profile information on bookings), and with trusted service providers that host or support
                the platform. Information may also be shared if required by law.
            </p>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Your Choices</h2>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 16 }}>
                You can review and update your profile information from within the app. You may request that your
                account be deactivated, after which we will retain only the information needed for legitimate
                business or legal purposes.
            </p>

            <p style={{ fontSize: 12, color: '#94a3b8' }}>
                For questions about this Privacy Policy, please use the contact details on the Contact page.
            </p>
        </div>
    );
}
