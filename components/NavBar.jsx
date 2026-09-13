import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/', label: 'Competitor Scraper' },
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
      <span style={{ fontWeight: 700, marginRight: 16, color: '#ff8c00', fontSize: 20 }}>CompetitorSpy</span>
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
