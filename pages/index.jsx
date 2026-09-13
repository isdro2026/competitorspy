// pages/index.jsx
// Home now sends people straight into the unified Dashboard.
// The old Competitor Scraper tool still lives at /scraper.
export function getServerSideProps() {
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}
