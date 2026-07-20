import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function AdminTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await api.get('/admin/templates');
    setTemplates(res.data);
  };

  return (
    <div className="dash-page">
      <h1>All Templates</h1>
      <div className="dash-card">
        {templates.length === 0 && <p className="dash-empty">No templates created yet.</p>}
        {templates.map((t) => (
          <div key={`${t.type}-${t.id}`} className="dash-list-item">
            <span>
              <strong>{t.name}</strong>
              <br />
              <span style={{ fontSize: 12, color: '#999' }}>by {t.organization_name}</span>
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: t.type === 'certificate' ? '#e8e4f8' : '#e4f0f8',
                color: t.type === 'certificate' ? '#2b1055' : '#1a5d8f',
                padding: '4px 10px',
                borderRadius: 12,
              }}
            >
              {t.type === 'certificate' ? 'Certificate' : 'Offer Letter'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminTemplates;