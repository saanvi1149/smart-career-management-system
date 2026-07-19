import { useEffect, useState } from 'react';
import api from '../../services/api';

function StudentPortfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [sectionsMap, setSectionsMap] = useState({});

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    const res = await api.get('/students/portfolios');
    setPortfolios(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/students/portfolios', { title, source: 'manual' });
    setTitle('');
    fetchPortfolios();
  };

  const handlePublish = async (id) => {
    await api.put(`/students/portfolios/${id}/publish`);
    fetchPortfolios();
  };

  const handleGenerateFromPrompt = async (e) => {
    e.preventDefault();
    if (!selectedPortfolioId) {
      setMessage('Please select a portfolio first.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post(`/students/portfolios/${selectedPortfolioId}/generate-from-prompt`, {
        prompt_text: promptText,
      });
      setMessage(`Success! ${res.data.sections_created} sections generated.`);
      setPromptText('');
      handleViewSections(selectedPortfolioId, true);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to generate portfolio content');
    }
    setLoading(false);
  };

  const handleViewSections = async (id, forceOpen = false) => {
    if (expandedId === id && !forceOpen) {
      setExpandedId(null);
      return;
    }
    const res = await api.get(`/students/portfolios/${id}/sections`);
    setSectionsMap({ ...sectionsMap, [id]: res.data });
    setExpandedId(id);
  };

  const renderSectionContent = (section) => {
    const { section_type, content } = section;

    if (section_type === 'about') {
      return <p style={{ lineHeight: 1.6, color: '#333' }}>{content.bio}</p>;
    }

    if (section_type === 'skills') {
      const items = content.items || [];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map((skill, i) => (
            <span
              key={i}
              style={{
                background: '#e8e4f8',
                color: '#2b1055',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      );
    }

    if (section_type === 'projects') {
      const items = content.items || [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((proj, i) => (
            <div key={i} style={{ background: 'white', padding: 14, borderRadius: 8, border: '1px solid #eee' }}>
              <strong style={{ color: '#2b1055' }}>{proj.name}</strong>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#555' }}>{proj.description}</p>
            </div>
          ))}
        </div>
      );
    }

    if (section_type === 'experience') {
      const items = content.items || [];
      if (items.length === 0) return <p style={{ color: '#999', fontStyle: 'italic' }}>No experience listed yet.</p>;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((exp, i) => (
            <div key={i} style={{ background: 'white', padding: 14, borderRadius: 8, border: '1px solid #eee' }}>
              <strong style={{ color: '#2b1055' }}>{exp.role}</strong> at {exp.company}
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>{exp.duration}</p>
            </div>
          ))}
        </div>
      );
    }

    // Fallback for education / certificates / anything else
    return <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{JSON.stringify(content, null, 2)}</pre>;
  };

  return (
    <div>
      <h1>My Portfolios</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: 30 }}>
        <input
          placeholder="Portfolio title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginRight: 10, padding: 8 }}
        />
        <button type="submit">Create Portfolio</button>
      </form>

      <ul style={{ marginBottom: 30, listStyle: 'none', padding: 0 }}>
        {portfolios.map((p) => (
          <li key={p.id} style={{ marginBottom: 15, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <div>
              <strong>{p.title}</strong> — {p.is_published ? 'Published' : 'Draft'} (slug: {p.slug})
              {!p.is_published && (
                <button onClick={() => handlePublish(p.id)} style={{ marginLeft: 10 }}>
                  Publish
                </button>
              )}
              <button onClick={() => handleViewSections(p.id)} style={{ marginLeft: 10 }}>
                {expandedId === p.id ? 'Hide Sections' : 'View Sections'}
              </button>
            </div>

            {expandedId === p.id && (
              <div style={{ marginTop: 14, background: '#f7f7fb', padding: 16, borderRadius: 8 }}>
                {(sectionsMap[p.id] || []).length === 0 && <p>No sections yet.</p>}
                {(sectionsMap[p.id] || []).map((s) => (
                  <div key={s.id} style={{ marginBottom: 20 }}>
                    <h4 style={{ textTransform: 'capitalize', color: '#2b1055', marginBottom: 8 }}>
                      {s.section_type}
                    </h4>
                    {renderSectionContent(s)}
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, maxWidth: 500 }}>
        <h3>✨ Generate Portfolio Content with AI</h3>
        <form onSubmit={handleGenerateFromPrompt}>
          <select
            value={selectedPortfolioId}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          >
            <option value="">Select a portfolio</option>
            {portfolios.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <textarea
            placeholder="Describe yourself — your skills, projects, experience, and career interests..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={5}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate with AI'}
          </button>
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default StudentPortfolios;