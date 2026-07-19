import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function AdminOrganizations() {
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/auth/admin/pending-organizations');
      setPendingOrgs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/auth/admin/approve-organization/${id}`);
      setMessage('Organization approved!');
      fetchPending();
    } catch (err) {
      setMessage('Failed to approve');
    }
  };

  return (
    <div className="dash-page">
      <h1>Pending Organizations</h1>
      <div className="dash-card">
        {message && <p className="dash-message">{message}</p>}
        {pendingOrgs.length === 0 && <p className="dash-empty">No pending organizations.</p>}
        {pendingOrgs.map((org) => (
          <div key={org.id} className="dash-list-item">
            <span>
              <strong>{org.org_name}</strong>
              <br />
              <span style={{ fontSize: 12, color: '#999' }}>{org.contact_email}</span>
            </span>
            <button className="dash-btn-secondary" onClick={() => handleApprove(org.id)}>
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminOrganizations;