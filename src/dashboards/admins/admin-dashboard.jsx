import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { FaBell, FaBars, FaTimes, FaHome, FaUserShield, FaUserMd , FaUserInjured, FaHandsHelping,FaHandSparkles, FaExclamationTriangle, FaHeartbeat, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import profile from "../../assets/bg.jpg";
import DashboardCharts from "./dashboardCharts";
import DoctorsSection from "./doctorsSection";
import PatientsSection from "./patientSection";
import CaregiversSection from "./careGiverSection";
import AlertsSection from "./alert-section";
import AdminsSection from "./adminSection";
import VitalsSection from "./vitalDashboard";
import AdminProfileSection from "./profilePicture"
import "./admins.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";



function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  // Show welcome animation on component mount
  useEffect(() => {
    setShowWelcome(true);
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mock notifications data - replace with actual API calls
  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: "New patient registration pending approval", type: "patient", time: "2 min ago", read: false },
      { id: 2, message: "Critical alert: High blood pressure detected", type: "alert", time: "5 min ago", read: false },
      { id: 3, message: "Doctor appointment scheduled for tomorrow", type: "appointment", time: "1 hour ago", read: true },
      { id: 4, message: "System backup completed successfully", type: "system", time: "2 hours ago", read: true },
      { id: 5, message: "New caregiver assigned to patient", type: "caregiver", time: "3 hours ago", read: false },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

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

  setTimeout(() => {
    const performLogout = async () => {
      try {
        await axios.post("http://localhost:3500/logout/admins");
        localStorage.removeItem("token");
        navigate("/");
      } catch (error) {
        console.log("Logout failed:", error);
        // Optionally show error to user
      }
    };

    performLogout();
  }, 2000);
};


  // Decode JWT token
  const token = getToken();
  let username = "Admin";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.userInfo?.username || "Admin";
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { key: "admins", label: "Admins", icon: <FaUserShield /> },
    { key: "doctors", label: "Doctors", icon: <FaUserMd /> },
    { key: "patients", label: "Patients", icon: <FaUserInjured /> },
    { key: "careGivers", label: "Caregivers", icon: <FaHandsHelping /> },
    { key: "alerts", label: "Alerts", icon: <FaExclamationTriangle /> },
    { key: "vitals", label: "Vitals", icon: <FaHeartbeat /> },
    { key: "profile", label: "Profile", icon: <FaUserCircle /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardCharts />;
      case "admins": return <AdminsSection />;
      case "doctors": return <DoctorsSection />;
      case "patients": return <PatientsSection />;
      case "careGivers": return <CaregiversSection />;
      case "alerts": return <AlertsSection />;
      case "vitals": return <VitalsSection />;
      case "profile": return <AdminProfileSection />;
      default: return <DashboardCharts />;
    }
  };

  return (
    <div className="">
        <div className="admin-dashboard">
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
        <h2 className="mobile-title mb-2">Admin Dashboard</h2>
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
      <div className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="text-light text-center fw-bold mt-3">ADMIN PANEL</h3>
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
          <h5 className="admin-name">{username}</h5>
          <p className="admin-role">System Administrator</p>
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
                    <h6>Notifications</h6>
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
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-area">
          {renderSection()}
        </div>
      </div>
    </div>
    </div>
    
  );
}

export default AdminDashboard;