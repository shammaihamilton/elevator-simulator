
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
 
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#333',
        padding: '1rem',
        zIndex: 1000, 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <li><Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem' }}>Home</Link></li>
          <li><Link to="/simulation" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem' }}>Simulation</Link></li>
          <li><Link to="/configure" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem' }}>Full Configure</Link></li>
        </ul>
      </nav>

      <main style={{ padding: '1rem 2rem', marginTop: 'calc(4rem + 2px)' }}> 
        <Outlet />
      </main>
    </div>
  );
}

