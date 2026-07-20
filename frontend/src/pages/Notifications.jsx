import { useEffect, useState } from 'react';
import api from '../services/api';
import '../components/DashboardStyles.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await api.get('/notifications');
    setNotifications(res.data);
  };

  const handleMarkRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  return (
    <div className="dash-page">
      <h1>Notifications</h1>
      <div className="dash-card">
        {notifications.length === 0 && <p className="dash-empty">No notifications yet.</p>}
        {notifications.map((n) => (
          <div key={n.id} className="dash-list-item" style={{ opacity: n.is_read ? 0.5 : 1 }}>
            <span>
              {n.message}
              <br />
              <span style={{ fontSize: 12, color: '#999' }}>
                {new Date(n.created_at).toLocaleString()}
              </span>
            </span>
            {!n.is_read && (
              <button className="dash-btn-secondary" onClick={() => handleMarkRead(n.id)}>
                Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;