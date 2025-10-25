import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { 
  FaBell, FaBars, FaTimes, FaHome, FaUserInjured, FaHandsHelping, 
  FaHandSparkles, FaExclamationTriangle, FaHeartbeat, FaSignOutAlt, 
  FaUserCircle, FaCalendarCheck, FaPills, FaEnvelope, FaStethoscope
} from "react-icons/fa";
import profile from "../../assets/bg.jpg";
import PatientOverview from "./patientOverView";
import AppointmentsSection from "./appointments";
import PrescriptionsSection from "./prescription";
// import MessagesSection from "./messagesSection";
import ProfileSection from "./profile";
import VitalsSection from "./vitals";
import AlertsSection from "./alerts";
import "./patients.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PatientDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Show welcome animation on component mount
  useEffect(() => {
    setShowWelcome(true);
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch patient data
  useEffect(() => {
    fetchPatientData();
  }, []);

        const fetchPatientData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            
            if (!token) {
            console.error("No token found");
            navigate("/login");
            return;
            }

            // Decode token to get current patient info
            const decoded = jwtDecode(token);
            // console.log("Decoded token:", decoded);
            
            const currentPatientName = decoded.userInfo?.name || decoded.userInfo?.username;

            if (!currentPatientName) {
            console.error("No patient name found in token");
            return;
            }

            // Fetch ALL patients and find the current one by name
            const patientsRes = await axios.get("http://localhost:3500/patients", {
            headers: { Authorization: `Bearer ${token}` },
            });

            // console.log("All patients from API:", patientsRes.data);

            // Find current patient by name since we don't have ID in token
            const currentPatient = patientsRes.data.find(patient => 
            patient.name === currentPatientName || 
            patient.username === currentPatientName
            );

            if (!currentPatient) {
            console.error("Current patient not found. Available patients:", patientsRes.data.map(p => ({ id: p._id, name: p.name })));
            return;
            }

            // console.log("Found current patient:", currentPatient);
            setPatientData(currentPatient);

            // Use the found patient's ID for subsequent requests
            const patientId = currentPatient._id || currentPatient.patientId;

            // Fetch appointments
            try {
            const appointmentsRes = await axios.get("http://localhost:3500/appointments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const patientAppointments = appointmentsRes.data.filter(
                apt => apt.patientId === patientId || apt.patientName === currentPatientName
            );
            // console.log("Patient appointments:", patientAppointments);
            setAppointments(patientAppointments);
            } catch (appointmentError) {
            console.error("Error fetching appointments:", appointmentError);
            setAppointments([]);
            }

            // Fetch vitals
            try {
            const vitalsRes = await axios.get("http://localhost:3500/vitals", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const patientVitals = vitalsRes.data.filter(
                vital => vital.patientId === patientId || vital.patientName === currentPatientName
            );
            // console.log("Patient vitals:", patientVitals);
            setVitals(patientVitals);
            } catch (vitalsError) {
            console.error("Error fetching vitals:", vitalsError);
            setVitals([]);
            }

            // Set notifications based on patient data
            const patientNotifications = [
            { 
                id: 1, 
                message: `Appointment with Dr. ${currentPatient.assignedDoctor?.name || 'your doctor'} tomorrow`, 
                type: "appointment", 
                time: "10 min ago", 
                read: false 
            },
            { 
                id: 2, 
                message: "New vital signs recorded", 
                type: "vitals", 
                time: "30 min ago", 
                read: false 
            },
            { 
                id: 3, 
                message: `Message from ${currentPatient.assignedCareGiver?.name || 'your caregiver'}`, 
                type: "message", 
                time: "1 hour ago", 
                read: true 
            },
            { 
                id: 4, 
                message: "Prescription ready for review", 
                type: "prescription", 
                time: "2 hours ago", 
                read: true 
            },
            { 
                id: 5, 
                message: "Health checkup reminder", 
                type: "reminder", 
                time: "3 hours ago", 
                read: false 
            },
            ];
            setNotifications(patientNotifications);
            setUnreadCount(patientNotifications.filter(n => !n.read).length);

        } catch (error) {
            console.error("Error fetching patient data:", error);
            if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            }
        } finally {
            setLoading(false);
        }
        };

  const getToken = () => localStorage.getItem("token");

  const handleNavClick = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    setShowLogout(true);
    setTimeout(async () => {
      try {
        await axios.post("http://localhost:3500/logout/patients");
        localStorage.removeItem("token");
        navigate("/");
      } catch (error) {
        console.log("Logout failed:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    }, 2000);
  };

  // Decode JWT token for username
  const token = getToken();
  let username = "Patient";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.userInfo?.name || decoded.userInfo?.username || "Patient";
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "appointments", label: "Appointments", icon: <FaCalendarCheck /> },
    { key: "prescriptions", label: "Prescriptions", icon: <FaPills /> },
    { key: "vitals", label: "Vitals", icon: <FaHeartbeat /> },
    // { key: "messages", label: "Messages", icon: <FaEnvelope /> },
    { key: "alerts", label: "Alerts", icon: <FaExclamationTriangle /> },
    { key: "profile", label: "Profile", icon: <FaUserCircle /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": 
        return (
          <PatientOverview 
            patientData={patientData} 
            appointments={appointments} 
            vitals={vitals} 
          />
        );
      case "appointments": return <AppointmentsSection appointments={appointments} patientData={patientData} />;
      case "prescriptions": return <PrescriptionsSection patientData={patientData}  />;
      case "vitals": return <VitalsSection vitals={vitals} patientData={patientData} />;
      // case "messages": return <MessagesSection patientData={patientData} />;
      case "alerts": return <AlertsSection patientData={patientData} />;
      case "profile": return <ProfileSection patientData={patientData} onUpdate={fetchPatientData} />;
      default: 
        return (
          <PatientOverview 
            patientData={patientData} 
            appointments={appointments} 
            vitals={vitals} 
          />
        );
    }
  };

  return (
    <div className="patient-dashboard">
      {/* Welcome Animation */}
      {showWelcome && (
        <div className="welcome-animation">
          <div className="welcome-content">
            <div className="welcome-icon">
              <FaHandSparkles/>
            </div>
            <h2 className="welcome-text">Welcome back, {username}!</h2>
            <div className="welcome-progress"></div>
          </div>
        </div>
      )}

      {/* Logout Animation */}
      {showLogout && (
        <div className="logout-animation">
          <div className="logout-content">
            <div className="logout-icon"><FaSignOutAlt/> </div>
            <div className="logout-text">Bye  {username}</div>
            <h2 className="logout-text">Logging out...</h2>
            <div className="logout-progress"></div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h2 className="mobile-title">Patient Dashboard</h2>
        <div className="notification-wrapper">
          <button 
            className="notification-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <FaBell />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`patient-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="text-light text-center fw-bold mt-3">PATIENT PANEL</h3>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-section">
          <img
            src={profile}
            className="profile-pic"
            alt="profile"
          />
          <h5 className="patient-name">{username}</h5>
          <p className="patient-role">Registered Patient</p>
          {patientData && patientData.condition && (
            <div className="patient-status">
              <span className={`status-badge ${patientData.condition.toLowerCase() === 'stable' ? 'status-stable' : 'status-critical'}`}>
                {patientData.condition}
              </span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href="#"
                  className={`nav-link ${activeSection === item.key ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.key);
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="#"
                className="nav-link logout-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <span className="nav-icon"><FaSignOutAlt /></span>
                <span className="nav-text">Logout</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Care Team Info */}
        {patientData && (patientData.assignedDoctor || patientData.assignedCareGiver) && (
          <div className="care-team-info">
            <h6 className="text-light mb-2">Your Care Team</h6>
            {patientData.assignedDoctor && (
              <div className="care-team-member">
                <FaStethoscope className="text-info me-2" size={12} />
                <small>Dr. {patientData.assignedDoctor.name}</small>
              </div>
            )}
            {patientData.assignedCareGiver && (
              <div className="care-team-member">
                <FaHandsHelping className="text-warning me-2" size={12} />
                <small>{patientData.assignedCareGiver.name}</small>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Desktop Header */}
        <div className="desktop-header">
          <h1 className="page-title">
            {navItems.find(item => item.key === activeSection)?.label || "Dashboard"}
          </h1>
          <div className="header-actions">
            <div className="notification-wrapper">
              <button 
                className="notification-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <FaBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <h6>Health Notifications</h6>
                    <button 
                      className="mark-all-read"
                      onClick={markAllAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <small className="notification-time">{notification.time}</small>
                          </div>
                          {!notification.read && <div className="unread-dot"></div>}
                        </div>
                      ))
                    ) : (
                      <p className="no-notifications">No notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="user-info">
              <span>Welcome, {username}</span>
              {patientData && patientData.condition && (
                <span className={`status-indicator ${patientData.condition.toLowerCase()}`}>
                  {patientData.condition}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-area">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading your health data...</p>
              </div>
            </div>
          ) : (
            renderSection()
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;