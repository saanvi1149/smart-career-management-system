import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function OrgCertificates() {
  const [templates, setTemplates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState('');
  const [message, setMessage] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const tRes = await api.get('/organizations/templates');
    setTemplates(tRes.data);
    const cRes = await api.get('/organizations/certificates');
    setCertificates(cRes.data);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/organizations/certificates', {
        template_id: parseInt(templateId),
        student_email: studentEmail,
        certificate_data: { course_name: courseName, grade: grade, date: new Date().toISOString().split('T')[0] },
      });
      setMessage('Certificate issued successfully!');
      setStudentEmail('');
      setCourseName('');
      setGrade('');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to issue certificate');
    }
  };

  const handleBulkIssue = async (e) => {
    e.preventDefault();
    setBulkMessage('');
    try {
      const emails = bulkEmails.split(',').map((em) => em.trim()).filter(Boolean);
      const res = await api.post('/organizations/certificates/bulk', {
        template_id: parseInt(templateId),
        student_emails: emails,
        certificate_data: { course_name: courseName, grade: grade, date: new Date().toISOString().split('T')[0] },
      });
      setBulkMessage(`Issued: ${res.data.issued.length}, Failed: ${res.data.failed.length}`);
      setBulkEmails('');
      fetchData();
    } catch (err) {
      setBulkMessage(err.response?.data?.detail || 'Bulk issue failed');
    }
  };

  const handleDownload = async (id) => {
    const res = await api.get(`/organizations/certificates/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="dash-page">
      <h1>Issue Certificate</h1>

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
            placeholder="Course Name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
          <input
            className="dash-input"
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <button type="submit" className="dash-btn">Issue Certificate</button>
          {message && <p className="dash-message">{message}</p>}
        </form>
      </div>

      <div className="dash-card" style={{ maxWidth: 450 }}>
        <h3>📦 Bulk Issue Certificate</h3>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
          Uses the Template, Course Name, and Grade selected above.
        </p>
        <form onSubmit={handleBulkIssue}>
          <input
            className="dash-input"
            placeholder="Student emails, comma separated"
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            required
          />
          <button type="submit" className="dash-btn">Issue to All</button>
          {bulkMessage && <p className="dash-message">{bulkMessage}</p>}
        </form>
      </div>

      <div className="dash-card">
        <h3>Issued Certificates</h3>
        {certificates.length === 0 && <p className="dash-empty">No certificates issued yet.</p>}
        {certificates.map((c) => (
          <div key={c.id} className="dash-list-item">
            <span>
              Certificate #{c.id}
              <br />
              <span style={{ fontSize: 12, color: '#999' }}>verification: {c.verification_id}</span>
            </span>
            <button className="dash-btn-secondary" onClick={() => handleDownload(c.id)}>
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrgCertificates;