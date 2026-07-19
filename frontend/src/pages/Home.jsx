import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h2 className="logo">SCMS</h2>
        <div className="nav-links">
          <span onClick={() => navigate('/login')} className="nav-link">Login</span>
          <button onClick={() => navigate('/register')} className="register-btn">REGISTER</button>
        </div>
      </nav>

      <div className="home-content">
        <h1 className="headline">
          Build your career,<br />the smart way.
        </h1>
        <p className="subtext">
          One platform to build your portfolio, generate resumes, and manage
          career documents — powered by AI, verified with trust.
        </p>
        <button className="get-started-btn" onClick={() => navigate('/register')}>
          GET STARTED
        </button>
        <p className="login-hint">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="login-link">Login</span>
        </p>
      </div>
    </div>
  );
}

export default Home;