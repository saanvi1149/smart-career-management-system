import { useEffect, useState } from 'react';
import api from '../../services/api';

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
    <div>
      <h1>Templates</h1>

      <h3>Certificate Templates</h3>
      <form onSubmit={handleCreateCertTemplate} style={{ marginBottom: 20 }}>
        <input
          placeholder="Template name"
          value={certName}
          onChange={(e) => setCertName(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Design HTML (e.g. <h1>{{student_name}}</h1>)"
          value={certHtml}
          onChange={(e) => setCertHtml(e.target.value)}
          required
          style={{ width: 400, marginRight: 10 }}
        />
        <button type="submit">Create</button>
      </form>
      <ul>
        {certTemplates.map((t) => (
          <li key={t.id}>{t.name} (id: {t.id})</li>
        ))}
      </ul>

      <h3 style={{ marginTop: 30 }}>Offer Letter Templates</h3>
      <form onSubmit={handleCreateOfferTemplate} style={{ marginBottom: 20 }}>
        <input
          placeholder="Template name"
          value={offerName}
          onChange={(e) => setOfferName(e.target.value)}
          required
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Design HTML"
          value={offerHtml}
          onChange={(e) => setOfferHtml(e.target.value)}
          required
          style={{ width: 400, marginRight: 10 }}
        />
        <button type="submit">Create</button>
      </form>
      <ul>
        {offerTemplates.map((t) => (
          <li key={t.id}>{t.name} (id: {t.id})</li>
        ))}
      </ul>
    </div>
  );
}

export default OrgTemplates;