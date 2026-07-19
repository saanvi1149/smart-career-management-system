import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await api.get('/admin/activity-logs');
    setLogs(res.data);
  };

  return (
    <div className="dash-page">
      <h1>Activity Logs</h1>
      <div className="dash-card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Poppins', sans-serif" }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px 8px', fontSize: 13, color: '#2b1055' }}>User ID</th>
              <th style={{ padding: '10px 8px', fontSize: 13, color: '#2b1055' }}>Action</th>
              <th style={{ padding: '10px 8px', fontSize: 13, color: '#2b1055' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 8px', fontSize: 13 }}>{log.user_id}</td>
                <td style={{ padding: '10px 8px', fontSize: 13 }}>{log.action}</td>
                <td style={{ padding: '10px 8px', fontSize: 13, color: '#777' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminActivityLogs;