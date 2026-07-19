import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PublicVerify.css';

function PublicVerify() {
  const { verificationId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVerification();
  }, [verificationId]);

  const fetchVerification = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/verify/${verificationId}`);
      setData(res.data);
    } catch (err) {
      setError('This document could not be verified. It may be invalid or does not exist.');
    }
  };

  if (error) {
    return (
      <div className="pv-container">
        <div className="pv-card pv-invalid">
          <h2>❌ Not Verified</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pv-container">
        <p style={{ color: 'white' }}>Verifying...</p>
      </div>
    );
  }

  const details = data.document_type === 'certificate' ? data.certificate_data : data.offer_data;

  return (
    <div className="pv-container">
      <div className="pv-card pv-valid">
        <div className="pv-badge">✅ Verified Genuine</div>
        <h2>{data.document_type === 'certificate' ? 'Certificate' : 'Offer Letter'}</h2>

        <div className="pv-row">
          <span className="pv-label">Issued To</span>
          <span className="pv-value">{data.student_name}</span>
        </div>
        <div className="pv-row">
          <span className="pv-label">Issued By</span>
          <span className="pv-value">{data.issued_by}</span>
        </div>
        <div className="pv-row">
          <span className="pv-label">Issued On</span>
          <span className="pv-value">{new Date(data.issued_at).toLocaleDateString()}</span>
        </div>

        <hr className="pv-divider" />

        {Object.entries(details || {}).map(([key, value]) => (
          <div className="pv-row" key={key}>
            <span className="pv-label">{key.replace(/_/g, ' ')}</span>
            <span className="pv-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicVerify;