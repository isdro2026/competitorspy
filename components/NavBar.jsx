import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/', label: 'Niche Finder' },
  { href: '/keyword-research', label: 'Keyword Research' },
  { href: '/landing-page-builder', label: 'Landing Page Builder' },
  { href: '/content-engine', label: 'Content Engine' },
  { href: '/blog', label: 'Blog' },
];

export default function NavBar() {
  const router = useRouter();

  return (
    <nav
      style={{
        display: 'flex',
        gap: 24,
        padding: '16px 24px',
        borderBottom: '1px solid #e0e0e0',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 700, marginRight: 16 }}>CompetitorSpy</span>
      {links.map((link) => {
        const isActive = router.pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: 'none',
              color: isActive ? '#0070f3' : '#333',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
