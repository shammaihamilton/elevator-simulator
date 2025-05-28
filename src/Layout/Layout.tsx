
import { Link, Outlet } from 'react-router-dom';
import styles from './Layout.module.scss';

export default function Layout() {
  return (
    <div>
      <nav role="navigation" className={styles.navbar}>
        <ul className={styles.navList}>
          <li>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/simulation" className={styles.navLink}>
              Simulation
            </Link>
          </li>
          <li>
            <Link to="/configure" className={styles.navLink}>
              Full Configure
            </Link>
          </li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
