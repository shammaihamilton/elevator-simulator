// src/components/HomeContent.tsx
import { Link } from 'react-router-dom';

export default function HomeContent() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h1>Welcome to the Advanced Elevator Simulator!</h1>
      <p style={{ fontSize: '1.2rem', margin: '1.5rem 0' }}>
        Experience realistic elevator behavior, configure system parameters,
        and watch the simulation unfold in real-time.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <Link
          to="/simulation"
          style={{
            padding: '0.8rem 1.5rem',
            fontSize: '1.1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '1rem'
          }}
        >
          Go to Simulation
        </Link>
        <Link
          to="/configure" // Or directly open dialog from Simulation page
          style={{
            padding: '0.8rem 1.5rem',
            fontSize: '1.1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Initial Configuration
        </Link>
      </div>
      {/* You can add more features, images, or descriptions here */}
    </div>
  );
}
