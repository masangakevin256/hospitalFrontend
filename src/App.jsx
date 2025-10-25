
import Login from "./login_reg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./dashboards/admins/admin-dashboard";
import DoctorDashboard from "./dashboards/doctors/DoctorDashboard";
import PatientDashboard from "./dashboards/patients/patient-dashboard";
import CareGiverDashboard from "./dashboards/careGivers/careGiver-dashboard";
import Footer from "./footer";
function App() {

  return (
    <>
       
       <Router> 
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboards/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/dashboards/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/dashboards/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/dashboards/careGiver-dashboard" element={<CareGiverDashboard />} />
          </Routes>
      </Router>
    
    </>
  )
}

export default App
