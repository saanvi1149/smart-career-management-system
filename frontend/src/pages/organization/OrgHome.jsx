import '../../components/DashboardStyles.css';

function OrgHome() {
  return (
    <div className="dash-page">
      <h1>Welcome, Organization</h1>
      <div className="dash-card">
        <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6 }}>
          Use the sidebar to manage certificate/offer letter templates and issue documents to students.
        </p>
      </div>
    </div>
  );
}

export default OrgHome;