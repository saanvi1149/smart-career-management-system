import { useEffect, useState } from 'react';
import api from '../../services/api';

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
    <div>
      <h1>Activity Logs</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: 8 }}>User ID</th>
            <th style={{ padding: 8 }}>Action</th>
            <th style={{ padding: 8 }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{log.user_id}</td>
              <td style={{ padding: 8 }}>{log.action}</td>
              <td style={{ padding: 8 }}>{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminActivityLogs;