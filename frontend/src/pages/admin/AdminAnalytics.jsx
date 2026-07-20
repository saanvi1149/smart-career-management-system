import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function AdminAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await api.get('/admin/analytics');
    setStats(res.data);
  };

  if (!stats) return <div className="dash-page"><h1>Analytics</h1><p>Loading...</p></div>;

  const cards = [
    { label: 'Total Students', value: stats.total_students },
    { label: 'Total Organizations', value: stats.total_organizations },
    { label: 'Approved Organizations', value: stats.approved_organizations },
    { label: 'Pending Organizations', value: stats.pending_organizations },
    { label: 'Total Resumes', value: stats.total_resumes },
    { label: 'Total Portfolios', value: stats.total_portfolios },
    { label: 'Published Portfolios', value: stats.published_portfolios },
    { label: 'Certificates Issued', value: stats.total_certificates },
    { label: 'Offer Letters Issued', value: stats.total_offer_letters },
  ];

  return (
    <div className="dash-page">
      <h1>Platform Analytics</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="dash-card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#2b1055' }}>{c.value}</div>
            <div style={{ fontSize: 13, color: '#777', marginTop: 6 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAnalytics;