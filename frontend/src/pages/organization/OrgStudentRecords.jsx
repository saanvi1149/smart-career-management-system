import { useEffect, useState } from 'react';
import api from '../../services/api';
import '../../components/DashboardStyles.css';

function OrgStudentRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get('/organizations/student-records');
    setRecords(res.data);
  };

  return (
    <div className="dash-page">
      <h1>Student Records</h1>
      <div className="dash-card">
        {records.length === 0 && <p className="dash-empty">No student records yet.</p>}
        {records.map((r) => (
          <div key={r.student_id} className="dash-list-item">
            <span>
              <strong>{r.full_name}</strong>
              <br />
              <span style={{ fontSize: 12, color: '#999' }}>{r.university}</span>
            </span>
            <span style={{ fontSize: 13, color: '#2b1055' }}>
              {r.certificates_issued} certificate(s), {r.offer_letters_issued} offer letter(s)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrgStudentRecords;