import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PublicPortfolio.css';

function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/portfolio/${slug}`);
      setPortfolio(res.data);
    } catch (err) {
      setError('This portfolio was not found or is not published.');
    }
  };

  const renderSection = (section) => {
    const { section_type, content } = section;

    if (section_type === 'about') {
      return <p className="pp-bio">{content.bio}</p>;
    }
    if (section_type === 'skills') {
      const items = content.items || [];
      return (
        <div className="pp-skills">
          {items.map((skill, i) => (
            <span key={i} className="pp-skill-pill">{skill}</span>
          ))}
        </div>
      );
    }
    if (section_type === 'projects') {
      const items = content.items || [];
      return (
        <div className="pp-cards">
          {items.map((proj, i) => (
            <div key={i} className="pp-card">
              <strong>{proj.name}</strong>
              <p>{proj.description}</p>
            </div>
          ))}
        </div>
      );
    }
    if (section_type === 'experience') {
      const items = content.items || [];
      if (items.length === 0) return null;
      return (
        <div className="pp-cards">
          {items.map((exp, i) => (
            <div key={i} className="pp-card">
              <strong>{exp.role}</strong> at {exp.company}
              <p className="pp-muted">{exp.duration}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="pp-container">
        <div className="pp-notfound">{error}</div>
      </div>
    );
  }

  if (!portfolio) {
    return <div className="pp-container"><p style={{ color: 'white' }}>Loading...</p></div>;
  }

  return (
    <div className="pp-container">
      <div className="pp-header">
        <h1>{portfolio.student_name}</h1>
        <p className="pp-subtitle">
          {portfolio.degree} {portfolio.university && `• ${portfolio.university}`}
        </p>
      </div>

      <div className="pp-body">
        {portfolio.sections.map((s, i) => (
          <div key={i} className="pp-section">
            <h3>{s.section_type}</h3>
            {renderSection(s)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicPortfolio;