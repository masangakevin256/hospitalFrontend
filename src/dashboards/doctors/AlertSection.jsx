import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, 
  FaBell, FaSearch, FaFilter, FaSync, FaEye, FaCheckCircle,
  FaTimes, FaClock, FaUserInjured, FaStethoscope, FaHeartbeat
} from "react-icons/fa";

function AlertsSection() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data);
    } catch (err) {
      setError("Failed to fetch alerts.");
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://hospitalbackend-1-eail.onrender.com/alerts/${alertId}`, 
        { status: 'read' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAlerts();
    } catch (err) {
      setError("Failed to update alert status.");
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://hospitalbackend-1-eail.onrender.com/alerts/mark-all-read`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAlerts();
    } catch (err) {
      setError("Failed to mark all alerts as read.");
      console.error(err);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://hospitalbackend-1-eail.onrender.com/alerts/${alertId}`, 
        { status: 'resolved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAlerts();
    } catch (err) {
      setError("Failed to resolve alert.");
      console.error(err);
    }
  };

  const openDetailsModal = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  // Filter and search alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityConfig = (severity) => {
    const config = {
      critical: { 
        color: "danger", 
        icon: FaExclamationCircle,
        bgColor: "bg-danger",
        textColor: "text-danger"
      },
      high: { 
        color: "warning", 
        icon: FaExclamationTriangle,
        bgColor: "bg-warning",
        textColor: "text-warning"
      },
      medium: { 
        color: "info", 
        icon: FaInfoCircle,
        bgColor: "bg-info",
        textColor: "text-info"
      },
      low: { 
        color: "secondary", 
        icon: FaBell,
        bgColor: "bg-secondary",
        textColor: "text-secondary"
      }
    };
    return config[severity] || config.medium;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: "primary", text: "New" },
      read: { color: "secondary", text: "Read" },
      resolved: { color: "success", text: "Resolved" }
    };
    const config = statusConfig[status] || statusConfig.new;
    return <span className={`badge bg-${config.color}`}>{config.text}</span>;
  };

  const getAlertIcon = (type) => {
    const icons = {
      patient: FaUserInjured,
      vital: FaHeartbeat,
      system: FaStethoscope,
      appointment: FaClock
    };
    return icons[type] || FaBell;
  };

  const getCriticalCount = () => alerts.filter(a => a.severity === 'critical').length;
  const getUnreadCount = () => alerts.filter(a => a.status === 'new').length;
  const getTodayCount = () => alerts.filter(a => {
    const today = new Date().toDateString();
    const alertDate = new Date(a.createdAt).toDateString();
    return alertDate === today;
  }).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <FaExclamationTriangle className="me-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="section-container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaBell className="me-2 text-warning" />
            System Alerts & Notifications
          </h2>
          <p className="text-muted mb-0">Monitor and manage system alerts and patient notifications</p>
        </div>
        {getUnreadCount() > 0 && (
          <button 
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={markAllAsRead}
          >
            <FaCheckCircle className="me-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{alerts.length}</h3>
                  <p className="card-text mb-0 opacity-75">Total Alerts</p>
                </div>
                <FaBell size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{getCriticalCount()}</h3>
                  <p className="card-text mb-0 opacity-75">Critical</p>
                </div>
                <FaExclamationCircle size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{getUnreadCount()}</h3>
                  <p className="card-text mb-0 opacity-75">Unread</p>
                </div>
                <FaExclamationTriangle size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{getTodayCount()}</h3>
                  <p className="card-text mb-0 opacity-75">Today</p>
                </div>
                <FaClock size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Search Alerts</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search alerts or patient names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Filter by Severity</label>
              <select
                className="form-select"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Filter by Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                onClick={fetchAlerts}
              >
                <FaSync className="me-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3">
          <h5 className="card-title mb-0 fw-bold text-dark">
            Alert Notifications ({filteredAlerts.length})
          </h5>
        </div>
        <div className="card-body p-0">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={64} className="text-muted mb-3 opacity-25" />
              <h5 className="text-muted">No alerts found</h5>
              <p className="text-muted mb-0">
                {alerts.length === 0 
                  ? "No alerts in the system. Everything looks good!" 
                  : "No alerts match your search criteria."
                }
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredAlerts.map((alert) => {
                const severityConfig = getSeverityConfig(alert.severity);
                const IconComponent = severityConfig.icon;
                const AlertTypeIcon = getAlertIcon(alert.type);
                
                return (
                  <div
                    key={alert._id}
                    className={`list-group-item list-group-item-action ${
                      alert.status === 'new' ? 'bg-light bg-opacity-50' : ''
                    }`}
                    style={{ borderLeft: `4px solid var(--bs-${severityConfig.color})` }}
                  >
                    <div className="d-flex align-items-start">
                      {/* Alert Icon */}
                      <div className={`avatar-sm rounded-circle d-flex align-items-center justify-content-center me-3 ${severityConfig.bgColor} text-white`}>
                        <IconComponent size={16} />
                      </div>

                      {/* Alert Content */}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <h6 className="mb-1 fw-semibold">
                              <AlertTypeIcon className={`me-2 ${severityConfig.textColor}`} size={14} />
                              {alert.message}
                            </h6>
                            {alert.patientName && (
                              <div className="d-flex align-items-center mb-1">
                                <FaUserInjured className="me-2 text-muted" size={12} />
                                <small className="text-muted">Patient: {alert.patientName}</small>
                                {alert.patientId && (
                                  <small className="text-muted ms-2">(ID: {alert.patientId})</small>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="d-flex gap-2 align-items-center">
                          {getStatusBadge(alert.status)}
                          {alert.severity && (
                            <span className={`badge bg-${severityConfig.color}`}>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </span>
                          )}
                        </div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <FaClock className="me-1" size={12} />
                            {new Date(alert.timeStamp || alert.timestamp).toLocaleString()}
                          </small>
                          
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDetailsModal(alert)}
                              title="View Details"
                            >
                              <FaEye size={12} />
                            </button>
                            {alert.status === 'new' && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => markAsRead(alert._id)}
                                title="Mark as Read"
                              >
                                <FaCheckCircle size={12} />
                              </button>
                            )}
                            {alert.status !== 'resolved' && (
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => resolveAlert(alert._id)}
                                title="Resolve Alert"
                              >
                                <FaTimes size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {showDetailsModal && selectedAlert && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaBell className="me-2" />
                  Alert Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Alert Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Message</label>
                      <p className="form-control-static fw-semibold">{selectedAlert.message}</p>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                    <label className="form-label fw-semibold">Severity</label>
                    <p className="form-control-static">
                      {selectedAlert?.severity && (
                        <>
                          {(() => {
                            const config = getSeverityConfig(selectedAlert.severity);
                            const Icon = config.icon;
                            return (
                              <>
                                {Icon && (
                                  <Icon className={`me-2 text-${config.color}`} />
                                )}
                                <span className={`badge bg-${config.color}`}>
                                  {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                                </span>
                              </>
                            );
                          })()}
                        </>
                      )}
                      {!selectedAlert?.severity && (
                        <span className="badge bg-secondary">Unknown</span>
                      )}
                    </p>
                  </div>

                      <div className="col-6">
                        <label className="form-label fw-semibold">Status</label>
                        <p className="form-control-static">{getStatusBadge(selectedAlert.status)}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Alert Type</label>
                      <p className="form-control-static">
                        {getAlertIcon(selectedAlert.type) && 
                          React.createElement(getAlertIcon(selectedAlert.type), {
                            className: "me-2 text-muted"
                          })
                        }
                        {selectedAlert.type?.charAt(0).toUpperCase() + selectedAlert.type?.slice(1) || 'System'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Additional Details</h6>
                    {selectedAlert.patientName && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          <FaUserInjured className="me-2" />
                          Patient Information
                        </label>
                        <p className="form-control-static">
                          {selectedAlert.patientName}
                          {selectedAlert.patientId && (
                            <span className="text-muted ms-2">(ID: {selectedAlert.patientId})</span>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaClock className="me-2" />
                        Timestamp
                      </label>
                      <p className="form-control-static">
                        {new Date(selectedAlert.timestamp || selectedAlert.timeStamp).toLocaleString()}
                      </p>
                    </div>
                    {selectedAlert.details && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Additional Details</label>
                        <p className="form-control-static">{selectedAlert.details}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
                {selectedAlert.status === 'new' && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      markAsRead(selectedAlert._id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <FaCheckCircle className="me-2" />
                    Mark as Read
                  </button>
                )}
                {selectedAlert.status !== 'resolved' && (
                  <button 
                    type="button" 
                    className="btn btn-info"
                    onClick={() => {
                      resolveAlert(selectedAlert._id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <FaTimes className="me-2" />
                    Resolve Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertsSection;