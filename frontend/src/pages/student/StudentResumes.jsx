import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function StudentResumes() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const [manualTitle, setManualTitle] = useState('');
  const [degree, setDegree] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [manualMessage, setManualMessage] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/students/resumes');
      setResumes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (id, title) => {
    const res = await api.get(`/students/resumes/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  const handleDelete = async (id) => {
    await api.delete(`/students/resumes/${id}`);
    fetchResumes();
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndParse = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please choose a PDF file first.');
      return;
    }
    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/students/resumes/upload-and-parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Resume parsed and saved! (Resume ID: ${res.data.resume_id})`);
      setFile(null);
      fetchResumes();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to parse resume');
    }
    setUploading(false);
  };

  const handleManualCreate = async (e) => {
    e.preventDefault();
    setManualMessage('');
    try {
      await api.post('/students/resumes', {
        title: manualTitle,
        template_id: 'modern',
        content: {
          education: [{ degree, college, year }],
          skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
          projects: [{ name: projectName, description: projectDesc }],
        },
      });
      setManualMessage('Resume created successfully!');
      setManualTitle('');
      setDegree('');
      setCollege('');
      setYear('');
      setSkillsText('');
      setProjectName('');
      setProjectDesc('');
      fetchResumes();
    } catch (err) {
      setManualMessage('Failed to create resume');
    }
  };

  return (
    <div className="dash-page">
      <h1>My Resumes</h1>

      <div className="dash-card" style={{ maxWidth: 500 }}>
        <h3>📝 Build Resume Manually</h3>
        <form onSubmit={handleManualCreate}>
          <input className="dash-input" placeholder="Resume Title" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} required />
          <input className="dash-input" placeholder="Degree (e.g. BTech CS)" value={degree} onChange={(e) => setDegree(e.target.value)} />
          <input className="dash-input" placeholder="College/University" value={college} onChange={(e) => setCollege(e.target.value)} />
          <input className="dash-input" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          <input className="dash-input" placeholder="Skills (comma separated)" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
          <input className="dash-input" placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <input className="dash-input" placeholder="Project Description" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
          <button type="submit" className="dash-btn">Create Resume</button>
          {manualMessage && <p className="dash-message">{manualMessage}</p>}
        </form>
      </div>

      <div className="dash-card" style={{ maxWidth: 500 }}>
        <h3>✨ Upload Existing Resume (AI Parse)</h3>
        <form onSubmit={handleUploadAndParse}>
          <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginBottom: 14 }} />
          <br />
          <button type="submit" className="dash-btn" disabled={uploading}>
            {uploading ? 'Parsing...' : 'Upload & Parse with AI'}
          </button>
          {message && <p className="dash-message">{message}</p>}
        </form>
      </div>

      <div className="dash-card">
        <h3>Saved Resumes</h3>
        {resumes.length === 0 && <p className="dash-empty">No resumes yet.</p>}
        {resumes.map((r) => (
          <div key={r.id} className="dash-list-item">
            <span>{r.title}</span>
            <div>
              <button className="dash-btn-secondary" onClick={() => handleDownload(r.id, r.title)}>
                Download PDF
              </button>
              <button className="dash-btn-secondary" onClick={() => handleDelete(r.id)} style={{ background: '#ffe4e4', color: '#c0392b' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentResumes;