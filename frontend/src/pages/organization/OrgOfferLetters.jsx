import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function OrgOfferLetters() {
  const [templates, setTemplates] = useState([]);
  const [offers, setOffers] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [position, setPosition] = useState('');
  const [stipend, setStipend] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const tRes = await api.get('/organizations/offer-templates');
    setTemplates(tRes.data);
    const oRes = await api.get('/organizations/offer-letters');
    setOffers(oRes.data);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/organizations/offer-letters', {
        template_id: parseInt(templateId),
        student_email: studentEmail,
        offer_data: { position, stipend, joining_date: new Date().toISOString().split('T')[0] },
      });
      setMessage('Offer letter issued successfully!');
      setStudentEmail('');
      setPosition('');
      setStipend('');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to issue offer letter');
    }
  };

  const handleDownload = async (id) => {
    const res = await api.get(`/organizations/offer-letters/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `offer_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="dash-page">
      <h1>Issue Offer Letter</h1>

      <div className="dash-card" style={{ maxWidth: 450 }}>
        <form onSubmit={handleIssue}>
          <select className="dash-select" value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
            <option value="">Select Template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input
            className="dash-input"
            placeholder="Student Email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            required
          />
          <input
            className="dash-input"
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
          <input
            className="dash-input"
            placeholder="Stipend"
            value={stipend}
            onChange={(e) => setStipend(e.target.value)}
          />
          <button type="submit" className="dash-btn">Issue Offer Letter</button>
          {message && <p className="dash-message">{message}</p>}
        </form>
      </div>

      <div className="dash-card">
        <h3>Issued Offer Letters</h3>
        {offers.length === 0 && <p className="dash-empty">No offer letters issued yet.</p>}
        {offers.map((o) => (
          <div key={o.id} className="dash-list-item">
            <span>
              Offer #{o.id}
              <br />
              <span style={{ fontSize: 12, color: '#999' }}>verification: {o.verification_id}</span>
            </span>
            <button className="dash-btn-secondary" onClick={() => handleDownload(o.id)}>
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrgOfferLetters;