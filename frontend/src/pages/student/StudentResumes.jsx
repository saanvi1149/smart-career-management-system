import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function StudentResumes() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

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

  return (
    <div className="dash-page">
      <h1>My Resumes</h1>

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
            <button className="dash-btn-secondary" onClick={() => handleDownload(r.id, r.title)}>
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentResumes;