import '../../components/DashboardStyles.css';

function StudentHome() {
  return (
    <div className="dash-page">
      <h1>Welcome to your Dashboard</h1>
      <div className="dash-card">
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6 }}>
          Use the sidebar to manage your profile, build resumes, and create AI-powered portfolios.
        </p>
      </div>
    </div>
  );
}

export default StudentHome;