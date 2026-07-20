import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function OrgProfile() {
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const [sigFile, setSigFile] = useState(null);
  const [sigMessage, setSigMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await api.get('/organizations/profile');
    setOrgName(res.data.org_name);
    setOrgType(res.data.org_type || '');
    setContactEmail(res.data.contact_email || '');
    setStatus(res.data.status);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/organizations/profile', {
        org_name: orgName,
        org_type: orgType,
        contact_email: contactEmail,
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  const handleSigUpload = async (e) => {
    e.preventDefault();
    if (!sigFile) return;
    const formData = new FormData();
    formData.append('file', sigFile);
    try {
      await api.post('/organizations/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSigMessage('Signature uploaded successfully!');
      setSigFile(null);
    } catch (err) {
      setSigMessage('Failed to upload signature');
    }
  };

  return (
    <div className="dash-page">
      <h1>Organization Profile</h1>
      <div className="dash-card" style={{ maxWidth: 450 }}>
        <p style={{ marginBottom: 14, fontSize: 13, color: status === 'approved' ? '#1a7d1a' : '#c0392b' }}>
          Status: <strong>{status}</strong>
        </p>
        <form onSubmit={handleSave}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#555' }}>Organization Name</label>
          <input className="dash-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#555' }}>Organization Type</label>
          <input className="dash-input" value={orgType} onChange={(e) => setOrgType(e.target.value)} />

          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#555' }}>Contact Email</label>
          <input className="dash-input" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />

          <button type="submit" className="dash-btn">Save Changes</button>
          {message && <p className="dash-message">{message}</p>}
        </form>
      </div>

      <div className="dash-card" style={{ maxWidth: 450 }}>
        <h3>✍️ Digital Signature</h3>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
          Upload a signature image to be stamped on all issued certificates and offer letters.
        </p>
        <form onSubmit={handleSigUpload}>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setSigFile(e.target.files[0])}
            style={{ marginBottom: 14 }}
          />
          <br />
          <button type="submit" className="dash-btn">Upload Signature</button>
          {sigMessage && <p className="dash-message">{sigMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default OrgProfile;