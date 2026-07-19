import { useEffect, useState } from 'react';
import api from '../../services/api';

function StudentProfile() {
  const [bioText, setBioText] = useState('');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setBioText(res.data.bio_text || '');
      setSkills((res.data.skills || []).join(', '));
    } catch (err) {
      console.log('No profile yet');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/students/profile', {
        bio_text: bioText,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMessage('Profile saved successfully!');
    } catch (err) {
      setMessage('Failed to save profile');
    }
  };

  return (
    <div className="dash-page">
      <h1>My Profile</h1>
      <div className="dash-card" style={{ maxWidth: 500 }}>
        <form onSubmit={handleSave}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#555' }}>Bio</label>
          <textarea
            className="dash-textarea"
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            rows={4}
          />
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#555' }}>Skills (comma separated)</label>
          <input
            className="dash-input"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
          <button type="submit" className="dash-btn">Save Profile</button>
          {message && <p className="dash-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default StudentProfile;