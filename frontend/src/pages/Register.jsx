import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

function Register() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = role === 'student'
      ? 'http://127.0.0.1:8000/auth/register/student'
      : 'http://127.0.0.1:8000/auth/register/organization';

    try {
      const res = await axios.post(endpoint, formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>

        <div className="role-toggle">
          <button
            className={role === 'student' ? 'role-btn active' : 'role-btn'}
            onClick={() => setRole('student')}
            type="button"
          >
            Student
          </button>
          <button
            className={role === 'organization' ? 'role-btn active' : 'role-btn'}
            onClick={() => setRole('organization')}
            type="button"
          >
            Organization
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

          {role === 'student' ? (
            <>
              <input name="full_name" placeholder="Full Name" onChange={handleChange} required />
              <input name="university" placeholder="University" onChange={handleChange} />
              <input name="degree" placeholder="Degree" onChange={handleChange} />
              <input name="year_of_study" type="number" placeholder="Year of Study" onChange={handleChange} />
              <input name="phone" placeholder="Phone" onChange={handleChange} />
            </>
          ) : (
            <>
              <input name="org_name" placeholder="Organization Name" onChange={handleChange} required />
              <input name="org_type" placeholder="Organization Type" onChange={handleChange} />
              <input name="contact_email" placeholder="Contact Email" onChange={handleChange} />
            </>
          )}

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-submit-btn">REGISTER</button>
        </form>

        <p className="auth-switch">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;