// src/components/Layout.tsx
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
      {/* Fixed nav at top of viewport */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: '1rem',
        zIndex: 1000
      }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
          <li><Link to="/simulation" style={{ color: 'white', textDecoration: 'none' }}>Simulation</Link></li>
          <li><Link to="/configure" style={{ color: 'white', textDecoration: 'none' }}>Full Configure</Link></li>
        </ul>
      </nav>

      {/* Push content below fixed nav */}
      <main style={{ padding: '0 2rem', marginTop: '4rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
