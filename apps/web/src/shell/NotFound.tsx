import { Link } from 'react-router';

// Unknown, forbidden or deleted links fail safely and say how to get back (AC-SPK-18).
export function NotFound() {
  return (
    <div className="ap-root" data-screen="NOTFOUND" style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ font: '600 22px/1.2 var(--font)', margin: '0 0 8px' }}>This page does not exist</h1>
        <p style={{ color: 'var(--ink-dim)', margin: '0 0 16px' }}>The project or stage in the link is unknown, or you no longer have access.</p>
        <Link to="/" data-does="Goes back to the start page" data-feature="F103">
          Go to the start page
        </Link>
      </div>
    </div>
  );
}
