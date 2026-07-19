import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './DashboardLayout.css';

function DashboardLayout({ menuItems, roleLabel }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="sidebar-logo">SCMS</h2>
        <p className="sidebar-role">{roleLabel}</p>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-logout" onClick={handleLogout}>
          Logout
        </div>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;