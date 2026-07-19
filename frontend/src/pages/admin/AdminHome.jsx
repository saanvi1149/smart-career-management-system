import '../../components/DashboardStyles.css';

function AdminHome() {
  return (
    <div className="dash-page">
      <h1>Welcome, Super Admin</h1>
      <div className="dash-card">
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6 }}>
          Use the sidebar to approve organizations and monitor platform activity.
        </p>
      </div>
    </div>
  );
}

export default AdminHome;