import { Link } from 'react-router-dom';

const CATEGORIES = [
    {
        name: 'Electrician',
        subtitle: 'Residential & industrial experts',
        accent: 'High-voltage precision for every project.',
        icon: '⚡',
    },
    {
        name: 'Plumbing',
        subtitle: 'From leaks to full installs',
        accent: 'Emergency response and long-term fixes.',
        icon: '🔧',
    },
    {
        name: 'Equipment Hire',
        subtitle: 'Power tools to heavy machinery',
        accent: 'Trusted suppliers with delivery support.',
        icon: '🚜',
    },
    {
        name: 'Carpentry',
        subtitle: 'Custom builds & restoration',
        accent: 'Detail-focused Sri Lankan craftsmanship.',
        icon: '🪚',
    },
    {
        name: 'Technicians',
        subtitle: 'Appliance & systems experts',
        accent: 'On-call professionals for repairs and maintenance.',
        icon: '🧰',
    },
];

export default function LandingPage() {
    return (
        <div
            style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                minHeight: '100vh',
                background: '#f8f9ff',
                color: '#0b1c30',
            }}
        >
            {/* Sticky editorial nav */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'rgba(248,249,255,0.92)',
                    backdropFilter: 'blur(18px)',
                    borderBottom: '1px solid rgba(195,198,215,0.35)',
                }}
            >
                <div
                    style={{
                        maxWidth: 1280,
                        margin: '0 auto',
                        padding: '14px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 24,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: 'linear-gradient(135deg,#004BC6,#2463EB)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 900,
                                fontSize: 18,
                            }}
                        >
                            S
                        </div>
                        <div>
                            <div
                                style={{
                                    fontWeight: 900,
                                    fontSize: 18,
                                    letterSpacing: '-0.04em',
                                }}
                            >
                                SkillConnect
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    color: '#6b7280',
                                }}
                            >
                                Skilled workers & equipment in Sri Lanka
                            </div>
                        </div>
                    </div>

                    <nav
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 20,
                            fontSize: 14,
                            color: '#4b5563',
                        }}
                    >
                        <a
                            href="#how-it-works"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            How it works
                        </a>
                        <a
                            href="#categories"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            Categories
                        </a>
                        <a
                            href="#why"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            Why SkillConnect
                        </a>
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Link
                            to="/login"
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#4b5563',
                                textDecoration: 'none',
                            }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            style={{
                                padding: '9px 20px',
                                borderRadius: 999,
                                fontSize: 14,
                                fontWeight: 700,
                                textDecoration: 'none',
                                color: '#ffffff',
                                background: 'linear-gradient(135deg,#004BC6,#2463EB)',
                                boxShadow: '0 12px 28px rgba(37,99,235,0.35)',
                            }}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero band */}
                <section
                    style={{
                        padding: '72px 24px 80px',
                        background:
                            'linear-gradient(120deg,#0b1120 0%,#0f172a 35%,#1d4ed8 72%,#dbeafe 100%)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1280,
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
                            gap: 40,
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '4px 11px',
                                    borderRadius: 999,
                                    background: 'rgba(15,23,42,0.85)',
                                    color: '#e5e7eb',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    marginBottom: 16,
                                    border: '1px solid rgba(148,163,184,0.25)',
                                }}
                            >
                                Hire skilled workers and rent equipment across Sri Lanka
                            </div>
                            <h1
                                style={{
                                    fontSize: 'clamp(34px,4.4vw,50px)',
                                    lineHeight: 1.02,
                                    fontWeight: 900,
                                    letterSpacing: '-0.05em',
                                    color: '#f9fafb',
                                    maxWidth: 580,
                                    marginBottom: 12,
                                }}
                            >
                                Where skilled work and trusted equipment meet.
                            </h1>
                            <p
                                style={{
                                    fontSize: 16,
                                    color: 'rgba(226,232,240,0.9)',
                                    maxWidth: 520,
                                    marginBottom: 28,
                                }}
                            >
                                Browse workers, post jobs, and manage equipment rentals from a single SkillConnect account.
                            </p>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 16,
                                    marginBottom: 18,
                                }}
                            >
                                <Link
                                    to="/register"
                                    style={{
                                        padding: '13px 26px',
                                        borderRadius: 999,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        color: '#ffffff',
                                        background: 'linear-gradient(135deg,#004BC6,#2463EB)',
                                        boxShadow: '0 18px 45px rgba(37,99,235,0.6)',
                                    }}
                                >
                                    Sign up as Customer
                                </Link>
                                <Link
                                    to="/register"
                                    style={{
                                        padding: '13px 24px',
                                        borderRadius: 999,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        color: '#0b1120',
                                        background: 'linear-gradient(135deg,#FDBA74,#F97316)',
                                        boxShadow: '0 18px 40px rgba(249,115,22,0.65)',
                                    }}
                                >
                                    Sign up as Worker / Supplier
                                </Link>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 16,
                                    fontSize: 12,
                                    color: 'rgba(148,163,184,0.9)',
                                }}
                            >
                                <span>Made for Sri Lankan customers, workers, and suppliers.</span>
                                <span
                                    style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '999px',
                                        background: 'rgba(148,163,184,0.7)',
                                        alignSelf: 'center',
                                    }}
                                />
                                <span>18+ job categories • service and equipment bookings</span>
                            </div>
                        </div>

                        {/* Layered cluster */}
                        <div
                            style={{
                                position: 'relative',
                                minHeight: 320,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Job card */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    left: 0,
                                    transform: 'translateX(-6%)',
                                    width: 250,
                                    borderRadius: 20,
                                    background: 'linear-gradient(145deg,rgba(15,23,42,0.85),rgba(15,23,42,0.6))',
                                    color: '#e5e7eb',
                                    padding: 16,
                                    boxShadow: '0 26px 60px rgba(15,23,42,0.75)',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: '#9ca3af',
                                    }}
                                >
                                    Active job
                                </div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                        marginTop: 6,
                                        marginBottom: 4,
                                    }}
                                >
                                    Modern staircase restoration
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: '#9ca3af',
                                    }}
                                >
                                    Location: Colombo 07 • Needed this week
                                </div>
                            </div>

                            {/* Worker card */}
                            <div
                                style={{
                                    position: 'relative',
                                    width: 270,
                                    borderRadius: 24,
                                    background: 'rgba(248,249,255,0.98)',
                                    padding: 18,
                                    boxShadow: '0 28px 70px rgba(15,23,42,0.55)',
                                    transform: 'translateY(10px)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}
                                >
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                fontSize: 14,
                                            }}
                                        >
                                            Aruna Perera
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: '#6b7280',
                                            }}
                                        >
                                            Master Artisan • Carpentry
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            padding: '5px 9px',
                                            borderRadius: 999,
                                            background: '#fee2e2',
                                            color: '#b91c1c',
                                            fontWeight: 600,
                                        }}
                                    >
                                        4.9 ★
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: '#4b5563',
                                    }}
                                >
                                    Specialised in structural restoration, bespoke staircases, and heritage timber work.
                                </div>
                            </div>

                            {/* Equipment card */}
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 10,
                                    right: -10,
                                    width: 230,
                                    borderRadius: 20,
                                    background: 'rgba(15,23,42,0.96)',
                                    color: '#e5e7eb',
                                    padding: 14,
                                    boxShadow: '0 26px 60px rgba(15,23,42,0.8)',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        color: '#9ca3af',
                                    }}
                                >
                                    Equipment hire
                                </div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                        marginTop: 6,
                                    }}
                                >
                                    Heavy duty mixer
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        marginTop: 4,
                                        color: '#e5e7eb',
                                    }}
                                >
                                    LKR 4,500 / day • Delivery available
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section
                    id="how-it-works"
                    style={{
                        padding: '60px 24px 64px',
                        background:
                            'linear-gradient(135deg,#eff4ff 0%,#e5eeff 60%,#ffffff 100%)',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1120,
                            margin: '0 auto',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                marginBottom: 32,
                                gap: 20,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.16em',
                                        color: '#6b7280',
                                        marginBottom: 8,
                                    }}
                                >
                                    Precision in every step
                                </div>
                                <h2
                                    style={{
                                        fontSize: 24,
                                        fontWeight: 800,
                                        letterSpacing: '-0.04em',
                                        color: '#0b1c30',
                                    }}
                                >
                                    How SkillConnect works
                                </h2>
                            </div>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: '#6b7280',
                                    maxWidth: 340,
                                    textAlign: 'right',
                                }}
                            >
                                Three clear steps from posting your job to releasing secure payment.
                            </p>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                                gap: 24,
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '10%',
                                    right: '10%',
                                    top: 38,
                                    height: 2,
                                    background:
                                        'linear-gradient(90deg,rgba(148,163,184,0.1),rgba(37,99,235,0.45),rgba(148,163,184,0.1))',
                                    zIndex: 0,
                                }}
                            />

                            {[1, 2, 3].map((step) => {
                                const stepContent = [
                                    {
                                        title: 'Create your account',
                                        desc: 'Register as a customer, worker, or equipment supplier in a few simple steps.',
                                    },
                                    {
                                        title: 'Post jobs or browse listings',
                                        desc: 'Use filters and categories to find workers, jobs, or equipment that match your need.',
                                    },
                                    {
                                        title: 'Book and track everything',
                                        desc: 'Confirm bookings and rentals, then follow their status from your SkillConnect dashboard.',
                                    },
                                ][step - 1];

                                return (
                                    <div
                                        key={stepContent.title}
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            padding: 20,
                                            borderRadius: 20,
                                            background: '#ffffff',
                                            boxShadow: '0 18px 45px rgba(15,23,42,0.05)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: 999,
                                                background:
                                                    step === 2
                                                        ? 'linear-gradient(135deg,#FDBA74,#F97316)'
                                                        : 'linear-gradient(135deg,#004BC6,#2463EB)',
                                                color: '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                marginBottom: 14,
                                            }}
                                        >
                                            {step}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 700,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {stepContent.title}
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                color: '#4b5563',
                                            }}
                                        >
                                            {stepContent.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Curated experts / categories */}
                <section
                    id="categories"
                    style={{
                        padding: '64px 24px 72px',
                        background: '#f8f9ff',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1120,
                            margin: '0 auto',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                gap: 20,
                                marginBottom: 32,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.16em',
                                        color: '#6b7280',
                                        marginBottom: 8,
                                    }}
                                >
                                    Curated experts
                                </div>
                                <h2
                                    style={{
                                        fontSize: 24,
                                        fontWeight: 800,
                                        letterSpacing: '-0.04em',
                                        color: '#0b1c30',
                                    }}
                                >
                                    The right hands for every job
                                </h2>
                            </div>
                            <Link
                                to="/workers"
                                style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: '#2463EB',
                                    textDecoration: 'none',
                                }}
                            >
                                View all categories →
                            </Link>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4,minmax(0,1fr))',
                                gap: 18,
                            }}
                        >
                            {CATEGORIES.map((cat, index) => (
                                <div
                                    key={cat.name}
                                    style={{
                                        gridColumn:
                                            index === 0 || index === 3
                                                ? 'span 2'
                                                : 'span 1',
                                        borderRadius: 20,
                                        background: '#ffffff',
                                        padding: 18,
                                        boxShadow: '0 16px 40px rgba(15,23,42,0.04)',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                {cat.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {cat.subtitle}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 16,
                                                background:
                                                    index % 2 === 0
                                                        ? 'linear-gradient(135deg,#EFF4FF,#DBEAFE)'
                                                        : 'linear-gradient(135deg,#FEF3C7,#FFEDD5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 18,
                                            }}
                                        >
                                            {cat.icon}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#4b5563',
                                        }}
                                    >
                                        {cat.accent}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why SkillConnect */}
                <section
                    id="why"
                    style={{
                        padding: '68px 24px 72px',
                        background:
                            'radial-gradient(circle at 0% 0%,#0f172a 0,#020617 45%,#020617 100%)',
                        color: '#e5e7eb',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 1120,
                            margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
                            gap: 40,
                            alignItems: 'flex-start',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 12,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.16em',
                                    color: '#9ca3af',
                                    marginBottom: 10,
                                }}
                            >
                                Crafting the standard for reliability
                            </div>
                            <h2
                                style={{
                                    fontSize: 26,
                                    fontWeight: 800,
                                    letterSpacing: '-0.04em',
                                    color: '#f9fafb',
                                    marginBottom: 16,
                                }}
                            >
                                Why customers and pros trust SkillConnect
                            </h2>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: '#9ca3af',
                                    marginBottom: 20,
                                }}
                            >
                                A single, transparent workflow for posting jobs, booking work, and managing equipment rentals.
                            </p>

                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    display: 'grid',
                                    gap: 12,
                                }}
                            >
                                <li
                                    style={{
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: 999,
                                            background:
                                                'radial-gradient(circle,#22c55e,#16a34a)',
                                            display: 'inline-block',
                                            marginTop: 2,
                                        }}
                                    />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Rich worker profiles
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                            }}
                                        >
                                            See skills, districts, rates, and reviews before you decide who to book.
                                        </p>
                                    </div>
                                </li>
                                <li
                                    style={{
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: 999,
                                            background:
                                                'radial-gradient(circle,#fb923c,#f97316)',
                                            display: 'inline-block',
                                            marginTop: 2,
                                        }}
                                    />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Booking-aware reviews
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                            }}
                                        >
                                            Reviews are tied to real bookings so feedback reflects completed work.
                                        </p>
                                    </div>
                                </li>
                                <li
                                    style={{
                                        display: 'flex',
                                        gap: 10,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: 999,
                                            background:
                                                'radial-gradient(circle,#38bdf8,#0ea5e9)',
                                            display: 'inline-block',
                                            marginTop: 2,
                                        }}
                                    />
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Jobs, bookings and rentals together
                                        </div>
                                        <p
                                            style={{
                                                fontSize: 12,
                                                color: '#9ca3af',
                                            }}
                                        >
                                            Customers, workers, and suppliers share one place to manage every request.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Trust panel */}
                        <div
                            style={{
                                borderRadius: 22,
                                background:
                                    'linear-gradient(145deg,rgba(15,23,42,0.95),rgba(37,99,235,0.75))',
                                padding: 20,
                                boxShadow: '0 28px 70px rgba(15,23,42,0.85)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                                    gap: 14,
                                    marginBottom: 18,
                                }}
                            >
                                <div>
                                    <div
                                        style={{ fontSize: 18, fontWeight: 800 }}
                                    >
                                        18+
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.12em',
                                            color: '#cbd5f5',
                                        }}
                                    >
                                        Job categories ready
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{ fontSize: 18, fontWeight: 800 }}
                                    >
                                        3
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.12em',
                                            color: '#cbd5f5',
                                        }}
                                    >
                                        Core user roles
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{ fontSize: 18, fontWeight: 800 }}
                                    >
                                        2
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.12em',
                                            color: '#cbd5f5',
                                        }}
                                    >
                                        Booking types
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{ fontSize: 18, fontWeight: 800 }}
                                    >
                                        1
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.12em',
                                            color: '#cbd5f5',
                                        }}
                                    >
                                        Unified dashboard
                                    </div>
                                </div>
                            </div>

                            <p
                                style={{
                                    fontSize: 12,
                                    color: '#e5e7eb',
                                    marginBottom: 14,
                                }}
                            >
                                SkillConnect connects customers, workers, and suppliers around real jobs, bookings, and rentals in Sri Lanka.
                            </p>

                            <Link
                                to="/register"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 18px',
                                    borderRadius: 999,
                                    background: '#ffffff',
                                    color: '#0b1120',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                }}
                            >
                                Apply as a Master Pro →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Final CTA + footer */}
                <section
                    style={{
                        padding: '40px 24px 0',
                        background:
                            'linear-gradient(135deg,#eff4ff 0%,#dbeafe 40%,#ffffff 100%)',
                    }}
                >
                    {/* Compact CTA bar */}
                    <div
                        style={{
                            maxWidth: 1120,
                            margin: '0 auto 40px',
                            borderRadius: 16,
                            background: '#ffffff',
                            padding: 20,
                            boxShadow: '0 14px 40px rgba(15,23,42,0.05)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: 16,
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.16em',
                                    color: '#6b7280',
                                    marginBottom: 4,
                                }}
                            >
                                Ready to get started?
                            </div>
                            <h3
                                style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    letterSpacing: '-0.03em',
                                    color: '#0b1c30',
                                    marginBottom: 2,
                                }}
                            >
                                Create your SkillConnect account today.
                            </h3>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: '#6b7280',
                                }}
                            >
                                Start posting jobs, booking work, or listing equipment in a few minutes.
                            </p>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10,
                            }}
                        >
                            <Link
                                to="/register"
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: 999,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    color: '#ffffff',
                                    background: 'linear-gradient(135deg,#004BC6,#2463EB)',
                                }}
                            >
                                Create free account
                            </Link>
                            <Link
                                to="/about"
                                style={{
                                    padding: '9px 16px',
                                    borderRadius: 999,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    color: '#1f2937',
                                    background: '#f3f4f6',
                                }}
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>

                    {/* Minimal site footer */}
                    <footer
                        style={{
                            borderTop: '1px solid rgba(203,213,225,0.7)',
                            padding: '18px 0 24px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: 1120,
                                margin: '0 auto',
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 12,
                                fontSize: 12,
                                color: '#6b7280',
                            }}
                        >
                            <div>
                                © {new Date().getFullYear()} SkillConnect. All
                                rights reserved.
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 16,
                                }}
                            >
                                <Link
                                    to="/about"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#6b7280',
                                    }}
                                >
                                    About
                                </Link>
                                <Link
                                    to="/terms"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#6b7280',
                                    }}
                                >
                                    Terms
                                </Link>
                                <Link
                                    to="/privacy"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#6b7280',
                                    }}
                                >
                                    Privacy
                                </Link>
                                <Link
                                    to="/contact"
                                    style={{
                                        textDecoration: 'none',
                                        color: '#6b7280',
                                    }}
                                >
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </footer>
                </section>
            </main>
        </div>
    );
}
