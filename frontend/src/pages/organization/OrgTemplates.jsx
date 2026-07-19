import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function OrgTemplates() {
  const [certTemplates, setCertTemplates] = useState([]);
  const [offerTemplates, setOfferTemplates] = useState([]);
  const [certName, setCertName] = useState('');
  const [certHtml, setCertHtml] = useState('');
  const [offerName, setOfferName] = useState('');
  const [offerHtml, setOfferHtml] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const certRes = await api.get('/organizations/templates');
      setCertTemplates(certRes.data);
      const offerRes = await api.get('/organizations/offer-templates');
      setOfferTemplates(offerRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCertTemplate = async (e) => {
    e.preventDefault();
    await api.post('/organizations/templates', { name: certName, design_html: certHtml });
    setCertName('');
    setCertHtml('');
    fetchTemplates();
  };

  const handleCreateOfferTemplate = async (e) => {
    e.preventDefault();
    await api.post('/organizations/offer-templates', { name: offerName, design_html: offerHtml });
    setOfferName('');
    setOfferHtml('');
    fetchTemplates();
  };

  return (
    <div className="dash-page">
      <h1>Templates</h1>

      <div className="dash-card" style={{ maxWidth: 600 }}>
        <h3>Certificate Templates</h3>
        <form onSubmit={handleCreateCertTemplate}>
          <input
            className="dash-input"
            placeholder="Template name"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            required
          />
          <input
            className="dash-input"
            placeholder="Design HTML (e.g. <h1>{{student_name}}</h1>)"
            value={certHtml}
            onChange={(e) => setCertHtml(e.target.value)}
            required
          />
          <button type="submit" className="dash-btn">Create</button>
        </form>
        {certTemplates.map((t) => (
          <div key={t.id} className="dash-list-item">
            <span>{t.name}</span>
            <span style={{ fontSize: 12, color: '#999' }}>id: {t.id}</span>
          </div>
        ))}
      </div>

      <div className="dash-card" style={{ maxWidth: 600 }}>
        <h3>Offer Letter Templates</h3>
        <form onSubmit={handleCreateOfferTemplate}>
          <input
            className="dash-input"
            placeholder="Template name"
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
            required
          />
          <input
            className="dash-input"
            placeholder="Design HTML"
            value={offerHtml}
            onChange={(e) => setOfferHtml(e.target.value)}
            required
          />
          <button type="submit" className="dash-btn">Create</button>
        </form>
        {offerTemplates.map((t) => (
          <div key={t.id} className="dash-list-item">
            <span>{t.name}</span>
            <span style={{ fontSize: 12, color: '#999' }}>id: {t.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrgTemplates;