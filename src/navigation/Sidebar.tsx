import { NavLink } from 'react-router-dom';
import { AgGridIcon, ColumnsIcon, DatabaseIcon, RocketIcon } from './icons';

const navItems = [
  { label: 'Custom', to: '/custom', icon: RocketIcon },
  { label: 'Primitives', to: '/primitives', icon: ColumnsIcon },
  { label: 'Studio', to: '/studio', icon: DatabaseIcon },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <AgGridIcon />
        <span className="brand-name">AG Grid</span>
      </div>

      <nav className="nav">
        {navItems.map(({ label, to, icon: NavIcon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item${isActive ? ' nav-item--active' : ''}`
            }
          >
            <NavIcon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
