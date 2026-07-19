import { useEffect, useState } from 'react';
import api from '../../services/api';

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
    <div>
      <h1>Pending Organizations</h1>
      {message && <p>{message}</p>}
      {pendingOrgs.length === 0 && <p>No pending organizations.</p>}
      <ul>
        {pendingOrgs.map((org) => (
          <li key={org.id} style={{ marginBottom: 10 }}>
            <strong>{org.org_name}</strong> — {org.contact_email}{' '}
            <button onClick={() => handleApprove(org.id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminOrganizations;