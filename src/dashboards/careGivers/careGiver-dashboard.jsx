import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { 
  FaBell, FaBars, FaTimes, FaHome, FaUserInjured, 
  FaClipboardList, FaHeartbeat, FaExclamationTriangle, 
  FaUserMd, FaSignOutAlt, FaUser, FaHandsHelping,
  FaCalendarCheck, FaChartLine, FaUserCircle, FaProcedures,
  FaTasks, FaUsers
} from "react-icons/fa";
import profile from "../../assets/bg.jpg";
import AssignedPatientsSection from "./careGiverPatientSection";
import TasksSection from "./TaskSection";
import VitalsSection from "./VitalSection";
import AlertsSection from "./AlertSection";
import ProfileSection from "./ProfileSection";
import "./CaregiverDashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CaregiverDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [caregiverStats, setCaregiverStats] = useState({
    totalPatients: 0,
    todayTasks: 0,
    pendingAlerts: 0,
    criticalCases: 0
  });
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

  // Fetch real data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch all data in parallel
      const [statsRes, notificationsRes] = await Promise.all([
        axios.get("https://hospitalbackend-1-eail.onrender.com/caregivers/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://hospitalbackend-1-eail.onrender.com/notifications/caregiver", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setCaregiverStats(statsRes.data);
      setNotifications(notificationsRes.data);
      setUnreadCount(notificationsRes.data.filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      // Fallback to empty data
      setCaregiverStats({
        totalPatients: 0,
        todayTasks: 0,
        pendingAlerts: 0,
        criticalCases: 0
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => localStorage.getItem("token");

  const handleNavClick = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const handleNotificationClick = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://hospitalbackend-1-eail.onrender.com/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, read: true } : notification
      ));
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("https://hospitalbackend-1-eail.onrender.com/notifications/mark-all-read", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleLogout = async () => {
    setShowLogout(true);
    setTimeout(async () => {
      try {
        await axios.post("https://hospitalbackend-1-eail.onrender.com/logout/caregivers");
        localStorage.removeItem("token");
        navigate("/");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }, 2000);
  };

  // Decode JWT token
  const token = getToken();
  let username = "Caregiver";
//   let caregiverId = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.userInfo?.username || decoded.userInfo?.name || "Caregiver";
    //   caregiverId = decoded.userInfo?.userId || decoded.userInfo?.id || "";
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: <FaHome />, color: "primary" },
    // { key: "patients", label: "All Patients", icon: <FaUserInjured />, color: "info" },
    { key: "patients", label: "My Patients", icon: <FaUserMd />, color: "success" },
    { key: "tasks", label: "Care Tasks", icon: <FaTasks />, color: "warning" },
    { key: "vitals", label: "Vitals Monitor", icon: <FaHeartbeat />, color: "danger" },
    { key: "alerts", label: "Alerts", icon: <FaExclamationTriangle />, color: "danger" },
    { key: "profile", label: "My Profile", icon: <FaUserCircle />, color: "secondary" },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'patient': return <FaUserInjured />;
      case 'alert': return <FaExclamationTriangle />;
      case 'task': return <FaTasks />;
      case 'vitals': return <FaHeartbeat />;
      default: return <FaBell />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const renderSection = () => {
    switch (activeSection) {
      case "patients": return <AssignedPatientsSection />;
      case "tasks": return <TasksSection />;
      case "vitals": return <VitalsSection />;
      case "alerts": return <AlertsSection />;
      case "profile": return <ProfileSection />;
      default: 
        return (
          <div className="dashboard-overview">
            {/* Welcome Header */}
            <div className="welcome-header mb-4">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h1 className="display-6 fw-bold text-dark mb-2">
                    Welcome, {username}!
                  </h1>
                  <p className="text-muted mb-0">
                    Here's your care overview for today
                  </p>
                </div>
                <div className="col-md-4 text-md-end">
                  <div className="date-display">
                    <span className="badge bg-light text-dark fs-6">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-xl-3 col-md-6">
                <div className="card stat-card border-0 shadow-sm bg-gradient-primary">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon me-3">
                        <FaUsers className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="stat-number text-white mb-0">{caregiverStats.totalPatients}</h3>
                        <p className="stat-label text-white-50 mb-0">Total Patients</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card stat-card border-0 shadow-sm bg-gradient-success">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon me-3">
                        <FaTasks className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="stat-number text-white mb-0">{caregiverStats.todayTasks}</h3>
                        <p className="stat-label text-white-50 mb-0">Today's Tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card stat-card border-0 shadow-sm bg-gradient-warning">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon me-3">
                        <FaExclamationTriangle className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="stat-number text-white mb-0">{caregiverStats.pendingAlerts}</h3>
                        <p className="stat-label text-white-50 mb-0">Pending Alerts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="card stat-card border-0 shadow-sm bg-gradient-danger">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stat-icon me-3">
                        <FaHeartbeat className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="stat-number text-white mb-0">{caregiverStats.criticalCases}</h3>
                        <p className="stat-label text-white-50 mb-0">Critical Cases</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold">Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-lg-3 col-md-6">
                        <button 
                          className="btn btn-outline-primary w-100 h-100 p-3 text-start quick-action-btn"
                          onClick={() => handleNavClick("assignedPatients")}
                        >
                          <FaUserMd className="mb-2" size={20} />
                          <h6 className="fw-bold">My Patients</h6>
                          <small className="text-muted">View assigned patients</small>
                        </button>
                      </div>
                      <div className="col-lg-3 col-md-6">
                        <button 
                          className="btn btn-outline-success w-100 h-100 p-3 text-start quick-action-btn"
                          onClick={() => handleNavClick("tasks")}
                        >
                          <FaTasks className="mb-2" size={20} />
                          <h6 className="fw-bold">Care Tasks</h6>
                          <small className="text-muted">Manage daily tasks</small>
                        </button>
                      </div>
                      <div className="col-lg-3 col-md-6">
                        <button 
                          className="btn btn-outline-warning w-100 h-100 p-3 text-start quick-action-btn"
                          onClick={() => handleNavClick("vitals")}
                        >
                          <FaChartLine className="mb-2" size={20} />
                          <h6 className="fw-bold">Vitals Monitor</h6>
                          <small className="text-muted">Check patient vitals</small>
                        </button>
                      </div>
                      <div className="col-lg-3 col-md-6">
                        <button 
                          className="btn btn-outline-danger w-100 h-100 p-3 text-start quick-action-btn"
                          onClick={() => handleNavClick("alerts")}
                        >
                          <FaExclamationTriangle className="mb-2" size={20} />
                          <h6 className="fw-bold">Alerts</h6>
                          <small className="text-muted">View critical alerts</small>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 py-3">
                    <h5 className="card-title mb-0 fw-bold">Recent Activity</h5>
                  </div>
                  <div className="card-body">
                    <div className="activity-list">
                      {notifications.length === 0 ? (
                        <p className="text-muted text-center py-3">No recent activity</p>
                      ) : (
                        notifications.slice(0, 4).map(notification => (
                          <div key={notification._id} className="activity-item d-flex align-items-center py-2 border-bottom">
                            <div className={`activity-dot dot-${notification.type} me-3`}></div>
                            <div className="flex-grow-1">
                              <p className="mb-1 small">{notification.message}</p>
                              <small className="text-muted">{formatTime(notification.createdAt)}</small>
                            </div>
                            {!notification.read && <span className="badge bg-primary ms-2">New</span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="caregiver-dashboard">
      {/* Welcome Animation */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-container">
            <div className="welcome-card text-center">
              <FaHandsHelping className="welcome-main-icon" />
              <h2 className="welcome-title">Welcome back, {username}!</h2>
              <p className="welcome-subtitle">Ready to provide excellent patient care today?</p>
              <div className="welcome-progress-container">
                <div className="welcome-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Animation */}
      {showLogout && (
        <div className="welcome-overlay">
          <div className="welcome-container">
            <div className="welcome-card text-center">
              <FaSignOutAlt className="welcome-main-icon text-secondary" />
              <h2 className="welcome-title">Logging out...</h2>
              <p className="welcome-subtitle">Thank you for your care today!</p>
              <div className="welcome-progress-container">
                <div className="welcome-progress-bar logout-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <button 
            className="sidebar-toggle mobile-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="mobile-title-section">
            <FaHandsHelping className="mobile-title-icon" />
            <h2 className="mobile-title">Caregiver Dashboard</h2>
          </div>
          <div className="notification-wrapper">
            <button 
              className="notification-btn mobile-notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FaBell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          </div>
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
      <div className={`caregiver-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FaHandsHelping className="brand-icon" />
            <span className="brand-text">CAREGIVER PANEL</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-section">
          <div className="profile-image-container">
            <img
              src={profile}
              className="profile-pic"
              alt="Caregiver Profile"
            />
            <div className="profile-status"></div>
          </div>
          <h5 className="caregiver-name">{username}</h5>
          <p className="caregiver-role">Patient Care Specialist</p>
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="stat-value">{caregiverStats.todayTasks}</span>
              <span className="stat-label">Tasks</span>
            </div>
            <div className="profile-stat">
              <span className="stat-value">{caregiverStats.totalPatients}</span>
              <span className="stat-label">Patients</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.key} className="nav-item">
                <button
                  className={`nav-link ${activeSection === item.key ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="nav-icon-wrapper">
                    <span className="nav-icon">{item.icon}</span>
                  </span>
                  <span className="nav-text">{item.label}</span>
                  <span className="nav-indicator"></span>
                </button>
              </li>
            ))}
          </ul>
          
          <div className="sidebar-footer">
            <button
              className="nav-link logout-link"
              onClick={handleLogout}
            >
              <span className="nav-icon-wrapper">
                <span className="nav-icon"><FaSignOutAlt /></span>
              </span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Desktop Header */}
        <div className="desktop-header">
          <div className="header-content">
            <div className="page-title-section">
              <h1 className="page-title">
                {navItems.find(item => item.key === activeSection)?.label || "Dashboard"}
              </h1>
              <p className="page-subtitle">
                {activeSection === "dashboard" 
                  ? "Care overview and quick actions" 
                  : `Manage ${navItems.find(item => item.key === activeSection)?.label.toLowerCase()}`
                }
              </p>
            </div>
            
            <div className="header-actions">
              <div className="notification-wrapper">
                <button 
                  className="notification-btn header-notification-btn"
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
                            key={notification._id}
                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => handleNotificationClick(notification._id)}
                          >
                            <div className="notification-icon">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                              <p className="notification-message">{notification.message}</p>
                              <small className="notification-time">{formatTime(notification.createdAt)}</small>
                            </div>
                            {!notification.read && <div className="unread-indicator"></div>}
                          </div>
                        ))
                      ) : (
                        <div className="no-notifications">
                          <FaBell className="no-notifications-icon" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="user-profile">
                <div className="user-avatar">
                  <img src={profile} alt="User" />
                </div>
                <div className="user-info">
                  <span className="user-greeting">Welcome back,</span>
                  <span className="user-name">{username}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="content-area">
          {loading && activeSection === "dashboard" ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading dashboard data...</p>
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

export default CaregiverDashboard;