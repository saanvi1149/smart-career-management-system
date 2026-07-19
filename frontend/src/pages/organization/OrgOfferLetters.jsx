import { useEffect, useState } from 'react';
import api from '../../services/api';

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
    <div>
      <h1>Issue Offer Letter</h1>
      <form onSubmit={handleIssue} style={{ maxWidth: 400, marginBottom: 30 }}>
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required style={{ width: '100%', marginBottom: 10, padding: 8 }}>
          <option value="">Select Template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          placeholder="Student Email"
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          placeholder="Stipend"
          value={stipend}
          onChange={(e) => setStipend(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit">Issue Offer Letter</button>
        {message && <p>{message}</p>}
      </form>

      <h3>Issued Offer Letters</h3>
      <ul>
        {offers.map((o) => (
          <li key={o.id} style={{ marginBottom: 8 }}>
            Offer #{o.id} — verification: {o.verification_id}{' '}
            <button onClick={() => handleDownload(o.id)}>Download PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrgOfferLetters;