import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  const handleToggle = async (id) => {
    await api.put(`/admin/users/${id}/toggle-active`);
    fetchUsers();
  };

  return (
    <div className="dash-page">
      <h1>Manage Users</h1>
      <div className="dash-card">
        {users.map((u) => (
          <div key={u.id} className="dash-list-item">
            <span>
              {u.email}
              <br />
              <span style={{ fontSize: 12, color: '#999', textTransform: 'capitalize' }}>{u.role}</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: u.is_active ? '#1a7d1a' : '#c0392b', fontWeight: 600 }}>
                {u.is_active ? 'Active' : 'Deactivated'}
              </span>
              <button
                className="dash-btn-secondary"
                onClick={() => handleToggle(u.id)}
                style={u.is_active ? { background: '#ffe4e4', color: '#c0392b' } : {}}
              >
                {u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsers;