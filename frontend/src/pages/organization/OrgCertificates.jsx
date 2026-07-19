import { useEffect, useState } from 'react';
import api from '../../services/api';

function OrgCertificates() {
  const [templates, setTemplates] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState('');
  const [message, setMessage] = useState('');

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
    <div>
      <h1>Issue Certificate</h1>
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
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          style={{ width: '100%', marginBottom: 10, padding: 8 }}
        />
        <button type="submit">Issue Certificate</button>
        {message && <p>{message}</p>}
      </form>

      <h3>Issued Certificates</h3>
      <ul>
        {certificates.map((c) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            Certificate #{c.id} — verification: {c.verification_id}{' '}
            <button onClick={() => handleDownload(c.id)}>Download PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrgCertificates;