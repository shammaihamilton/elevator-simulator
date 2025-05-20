
import { Link } from 'react-router-dom';

export default function HomeContent() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <h1>Welcome to the Advanced Elevator Simulator!</h1>
      <p style={{ fontSize: '1.2rem', margin: '1.5rem 0', lineHeight: '1.6' }}>
        Experience realistic elevator behavior, configure system parameters,
        and watch the simulation unfold in real-time.
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to="/simulation"
          style={{
            padding: '0.8rem 1.5rem',
            fontSize: '1.1rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Go to Simulation
        </Link>
        <Link
          to="/configure"
          style={{
            padding: '0.8rem 1.5rem',
            fontSize: '1.1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#545b62')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6c757d')}
        >
          Initial Configuration
        </Link>
      </div>
      {/* You can add more features, images, or descriptions here */}
      <div style={{marginTop: '3rem', fontSize: '0.9rem', color: '#555'}}>
        <p>Features include multiple elevators, configurable timings, and dynamic request handling.</p>
      </div>
    </div>
  );
}
