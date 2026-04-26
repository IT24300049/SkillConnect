import { Link } from 'react-router-dom';
import './LandingPage.css';

const NAV_ITEMS = [
	{ label: 'Platform', href: '#platform' },
	{ label: 'Categories', href: '#categories' },
	{ label: 'Solutions', href: '#process' },
	{ label: 'Success Stories', href: '#trust' },
];

const PROCESS_STEPS = [
	{
		icon: 'person_add',
		title: 'Create account',
		description:
			'Choose a role - Professional, Hirer, or Client - and unlock a dashboard tailored to your workflow.',
	},
	{
		icon: 'post_add',
		title: 'Post jobs',
		description:
			'Describe the work in detail and match with vetted talent or the right equipment in minutes.',
	},
	{
		icon: 'calendar_today',
		title: 'Book & track',
		description:
			'Manage milestones, payments, and logistics from a single secure operating hub.',
	},
];

const CATEGORIES = [
	{
		name: 'Electrician',
		icon: 'bolt',
		description: 'Certified masters of high-voltage systems and residential smart grids.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuA6IR41GHoHhNTSwchldsQ0pDL3aNQ5OEVd0T463E-k5NS2aOIPeTkITHa1xW12MaeszK6DJ8MOp7EA-7cXAKpNI7DIedCWSRqC8VeTcQzEYy-XX7faERvZe2tJHDzy0y98AXQndUHE81QaPhC2NoiLeQkxpzXBfnSbnxfazZ1LUYy0t9ZWiVaM33DVSUVFV9MuG2J9DHQUqxhODcJdI9pyapxP0Bq5_Gnr8Dkb_Kxh_NkOhCqzYY5lezmu1DvTP-wY7EEGiCMkbHY',
		featured: true,
	},
	{
		name: 'Plumbing',
		icon: 'faucet',
		description: 'Emergency response and long-term fixes for homes and businesses.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDIYuN86VZOBgeK-_Pof-JNdS378ByLOrroGO7hSo--Lyxu9OrI_LTQ5_x0hazxkGQsZtCkSQF0E65VjGkBod0upk6FNZoo0-T4EPl0O4uficOwx25j4Cgz5GneWQB3v_rogocT2qlaZg-53qrL8LqXggYNVQbVhNVMpNQCLLFUFSZ9bmvkfH2U3edvI9qfxQp5T64aPawx6vesDQ1KzxAnRBHtoX7biD0n1d3xX3ki1rsLUONvmrjIteJt8mJaOGKD-40Kevbt3kw',
	},
	{
		name: 'Equipment Hire',
		icon: 'precision_manufacturing',
		description: 'Power tools to heavy machinery with trusted suppliers and delivery support.',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCktXfiv2_DBwHQ3p7a8LB1g9B20JeEJoPQaWDg_xuMqKvNunluqBnjSh6fgvPKXy8qWFRxYRRMSI68L_bHiGro6DEfP2C3QZXB0FtoJAJ2l8nIoFz1F2YJ5l-MEORCMSmTvHaN3JTA9dPZOF8nj__bEglSUbyIFHahkM_C5yHSuxUs4m4Wg3QxrPoU1tQMRiWyr37ICdZs24XZzcSA-RnEZgDfFHipM8hmOFXdoz0FmDBjOJ2lPgGXf9BI1rRfswgy_96YhyRizZ0',
	},
	{
		name: 'HVAC',
		icon: 'ac_unit',
		description: 'Industrial climate control and ventilation systems built for scale.',
		compact: true,
	},
];

const METRICS = [
	{ value: '18+', label: 'Industry Categories' },
	{ value: '3', label: 'Core User Roles' },
	{ value: '2', label: 'Booking Protocols' },
	{ value: '99%', label: 'Trust Rating', highlight: true },
];

const FOOTER_LINK_GROUPS = [
	{
		title: 'Platform',
		links: [
			{ label: 'Services', to: '/about' },
			{ label: 'Hire Hub', to: '/register' },
			{ label: 'Pro Network', to: '/workers' },
		],
	},
	{
		title: 'Company',
		links: [
			{ label: 'Our Story', to: '/about' },
			{ label: 'Careers', to: '/contact' },
			{ label: 'Contact', to: '/contact' },
		],
	},
];

function MaterialIcon({ name, filled = false }) {
	return (
		<span
			className="material-symbols-outlined"
			style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
			aria-hidden="true"
		>
			{name}
		</span>
	);
}

function CategoryCard({ category }) {
	return (
		<article className={`category-card ${category.featured ? 'category-card--featured' : ''} ${category.compact ? 'category-card--compact' : ''}`}>
			{category.image ? (
				<img className="category-card__media" src={category.image} alt="" loading="lazy" />
			) : (
				<div className="category-card__abstract" />
			)}
			<div className="category-card__overlay" />
			<div className="category-card__content">
				<div className="category-card__icon">
					<MaterialIcon name={category.icon} filled />
				</div>
				<h3>{category.name}</h3>
				{category.description ? <p>{category.description}</p> : null}
			</div>
		</article>
	);
}

export default function LandingPage() {
	return (
		<div className="landing-page" id="platform">
			<header className="landing-page__header">
				<div className="landing-page__shell landing-page__nav-shell">
					<Link to="/" className="landing-page__brand" aria-label="SkillConnect home">
						<strong>SKILLCONNECT</strong>
					</Link>

					<nav className="landing-page__nav" aria-label="Primary">
						{NAV_ITEMS.map((item) => (
							<a key={item.label} href={item.href}>
								{item.label}
							</a>
						))}
					</nav>

					<div className="landing-page__actions">
						<Link to="/login" className="landing-page__link-button">
							Log In
						</Link>
						<Link to="/register" className="landing-page__button landing-page__button--primary">
							Join Now
						</Link>
					</div>
				</div>
			</header>

			<main>
				<section className="landing-page__hero">
					<div className="landing-page__hero-bg" aria-hidden="true" />
					<div className="landing-page__shell landing-page__hero-grid">
						<div className="landing-page__hero-copy">
							<span className="landing-page__eyebrow">Evolution of Service</span>
							<h1>
								Where skilled work and <span>trusted equipment</span> meet.
							</h1>
							<p>
								The premium ecosystem for industry professionals and equipment hire. Precision-matched skills for every demanding project.
							</p>
							<div className="landing-page__cta-row">
								<Link to="/register" className="landing-page__button landing-page__button--primary">
									Get Started Today
								</Link>
								<a href="#process" className="landing-page__button landing-page__button--ghost">
									<MaterialIcon name="play_circle" />
									Watch Narrative
								</a>
							</div>
						</div>
					</div>
				</section>

				<section className="landing-page__section landing-page__section--dark" id="process">
					<div className="landing-page__shell">
						<div className="landing-page__section-header">
							<div>
								<span className="landing-page__eyebrow">Precision in every step</span>
								<h2>How SkillConnect works</h2>
							</div>
							<p>Three clear steps from posting your job to releasing secure payment.</p>
							<div className="landing-page__section-counter">01-03</div>
						</div>

						<div className="landing-page__process-grid">
							{PROCESS_STEPS.map((step, index) => (
								<article key={step.title} className="landing-page__process-card">
									<div className="landing-page__process-index">0{index + 1}</div>
									<div className="landing-page__process-icon">
										<MaterialIcon name={step.icon} filled />
									</div>
									<h3>{step.title}</h3>
									<p>{step.description}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="landing-page__section" id="categories">
					<div className="landing-page__shell">
						<div className="landing-page__centered-heading">
							<span className="landing-page__eyebrow">The right hands for every job</span>
							<h2>The premium network for skilled labor and equipment hire</h2>
							<p>
								From precision electrical engineering to heavy industry equipment hire, we bridge the gap between expertise and execution.
							</p>
						</div>

						<div className="landing-page__category-grid">
							{CATEGORIES.map((category) => (
								<CategoryCard key={category.name} category={category} />
							))}
						</div>
					</div>
				</section>

				<section className="landing-page__section landing-page__section--panel" id="trust">
					<div className="landing-page__shell landing-page__trust-grid">
						<div className="landing-page__trust-copy">
							<span className="landing-page__eyebrow">Why customers and pros trust SkillConnect</span>
							<h2>Reliability, curation, and professional integrity.</h2>
							<p>
								Our network is built for high-performance outcomes, with a focus on verified expertise and dependable equipment access.
							</p>

							<div className="landing-page__avatars" aria-hidden="true">
								<span />
								<span />
								<span />
							</div>
							<strong className="landing-page__trust-note">Join 15,000+ verified experts</strong>
						</div>

						<div className="landing-page__metrics-grid">
							{METRICS.map((metric) => (
								<article key={metric.label} className={`landing-page__metric ${metric.highlight ? 'landing-page__metric--highlight' : ''}`}>
									<strong>{metric.value}</strong>
									<span>{metric.label}</span>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="landing-page__section landing-page__section--cta">
					<div className="landing-page__shell landing-page__cta-panel">
						<span className="landing-page__eyebrow">The industry shift is here</span>
						<h2>Ignite your workflow</h2>
						<p>Join the premier network of skilled professionals and equipment hirers today.</p>
						<Link to="/register" className="landing-page__button landing-page__button--primary landing-page__button--large">
							Create your SkillConnect account today
						</Link>
					</div>
				</section>
			</main>

			<footer className="landing-page__footer">
				<div className="landing-page__shell landing-page__footer-grid">
					<div className="landing-page__footer-brand">
						<strong className="landing-page__footer-title">SKILLCONNECT</strong>
						<p>Advanced orchestration of skilled labor and high-precision equipment hire for the modern industrial age.</p>
					</div>

					<div className="landing-page__footer-links">
						{FOOTER_LINK_GROUPS.map((group) => (
							<div key={group.title}>
								<strong>{group.title}</strong>
								{group.links.map((link) => (
									<Link key={link.label} to={link.to}>
										{link.label}
									</Link>
								))}
							</div>
						))}

						<div>
							<strong>Connect</strong>
							<div className="landing-page__socials">
								<a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
									<MaterialIcon name="share" />
								</a>
								<a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
									<MaterialIcon name="business_center" />
								</a>
							</div>
						</div>
					</div>
				</div>

				<div className="landing-page__shell landing-page__footer-bottom">
					<span>© 2026 SkillConnect. Engineered for the kinetic noir.</span>
					<div>
						<Link to="/privacy">Privacy Policy</Link>
						<Link to="/terms">Terms of Service</Link>
						<Link to="/contact">Contact Support</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
