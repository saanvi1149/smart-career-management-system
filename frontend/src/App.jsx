import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicPortfolio from './pages/PublicPortfolio';
import PublicVerify from './pages/PublicVerify';
import DashboardLayout from './components/DashboardLayout';

import StudentHome from './pages/student/StudentHome';
import StudentProfile from './pages/student/StudentProfile';
import StudentResumes from './pages/student/StudentResumes';
import StudentPortfolios from './pages/student/StudentPortfolios';

import OrgHome from './pages/organization/OrgHome';
import OrgTemplates from './pages/organization/OrgTemplates';
import OrgCertificates from './pages/organization/OrgCertificates';
import OrgOfferLetters from './pages/organization/OrgOfferLetters';
import OrgProfile from './pages/organization/OrgProfile';
import OrgStudentRecords from './pages/organization/OrgStudentRecords';

import AdminHome from './pages/admin/AdminHome';
import AdminOrganizations from './pages/admin/AdminOrganizations';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTemplates from './pages/admin/AdminTemplates';
import Notifications from './pages/Notifications';


const studentMenu = [
  { path: '/student/dashboard', label: 'Home' },
  { path: '/student/profile', label: 'Profile' },
  { path: '/student/resumes', label: 'Resumes' },
  { path: '/student/portfolios', label: 'Portfolios' },
  { path: '/student/notifications', label: 'Notifications' },
];

const orgMenu = [
  { path: '/organization/dashboard', label: 'Home' },
  { path: '/organization/profile', label: 'Profile' },
  { path: '/organization/templates', label: 'Templates' },
  { path: '/organization/certificates', label: 'Certificates' },
  { path: '/organization/offer-letters', label: 'Offer Letters' },
  { path: '/organization/notifications', label: 'Notifications' },
  { path: '/organization/student-records', label: 'Student Records' },
];

const adminMenu = [
  { path: '/admin/dashboard', label: 'Home' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/organizations', label: 'Organizations' },
  { path: '/admin/activity-logs', label: 'Activity Logs' },
  { path: '/admin/notifications', label: 'Notifications' },
  { path: '/admin/analytics', label: 'Analytics' },
  { path: '/admin/templates', label: 'Templates' },
];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
        <Route path="/verify/:verificationId" element={<PublicVerify />} />

        <Route element={<DashboardLayout menuItems={studentMenu} roleLabel="Student" />}>
          <Route path="/student/dashboard" element={<StudentHome />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/resumes" element={<StudentResumes />} />
          <Route path="/student/portfolios" element={<StudentPortfolios />} />
          <Route path="/student/notifications" element={<Notifications />} />
        </Route>

        <Route element={<DashboardLayout menuItems={orgMenu} roleLabel="Organization" />}>
          <Route path="/organization/dashboard" element={<OrgHome />} />
          <Route path="/organization/profile" element={<OrgProfile />} />
          <Route path="/organization/templates" element={<OrgTemplates />} />
          <Route path="/organization/certificates" element={<OrgCertificates />} />
          <Route path="/organization/offer-letters" element={<OrgOfferLetters />} />
          <Route path="/organization/notifications" element={<Notifications />} />
          <Route path="/organization/student-records" element={<OrgStudentRecords />} />
          
        </Route>

        <Route element={<DashboardLayout menuItems={adminMenu} roleLabel="Super Admin" />}>
          <Route path="/admin/dashboard" element={<AdminHome />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/organizations" element={<AdminOrganizations />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/templates" element={<AdminTemplates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;