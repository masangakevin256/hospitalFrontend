import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Alert, Badge } from "react-bootstrap";
import { FaEye, FaTrash, FaBell, FaCheckCircle } from "react-icons/fa";

function AlertsSection() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://hospitalbackend-1-eail.onrender.com/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlerts(response.data);
      } catch (error) {
        console.error("Error fetching alerts:", error.response?.data || error.message);
        setError("Failed to fetch alerts");
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Delete alert
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-1-eail.onrender.com/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(alerts.filter((alert) => alert._id !== id));
      setSuccess("Alert deleted successfully!");
    } catch (error) {
      console.error("Error deleting alert:", error.response?.data || error.message);
      setError("Failed to delete alert");
    }
  };

  // Update alert status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `https://hospitalbackend-1-eail.onrender.com/alerts/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAlerts(alerts.map(alert => 
        alert._id === id ? response.data : alert
      ));
      setSuccess(`Alert marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating alert:", error.response?.data || error.message);
      setError("Failed to update alert status");
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  };

  // Get alert type badge variant
  const getAlertTypeVariant = (alertType) => {
    switch (alertType?.toLowerCase()) {
      case 'blood pressure': return 'danger';
      case 'heart rate': return 'info';
      case 'medication': return 'primary';
      case 'appointment': return 'secondary';
      default: return 'dark';
    }
  };

  return (
    <div className="container-fluid mt-4">
      {/* Alert Messages */}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {/* Header + Search + Filters */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="fw-bold text-primary mb-0">
          <FaBell className="me-2" />
          Alerts & Notifications
        </h4>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Search by patient ID, alert type, or message..."
            className="w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Form.Select
            className="w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="urgent">Urgent</option>
          </Form.Select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Total Alerts</h5>
              <h3 className="mb-0">{alerts.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body text-center">
              <h5 className="card-title">Pending</h5>
              <h3 className="mb-0">{alerts.filter(a => a.status === 'pending').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Urgent</h5>
              <h3 className="mb-0">{alerts.filter(a => a.status === 'urgent').length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5 className="card-title">Resolved</h5>
              <h3 className="mb-0">{alerts.filter(a => a.status === 'resolved').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading alerts...</p>
        </div>
      ) : (
        <>
          {filteredAlerts.length === 0 ? (
            <div className="text-center my-5">
              <p className="text-muted">
                {searchTerm || filterStatus !== "all" 
                  ? "No alerts match your search criteria." 
                  : "No alerts found."
                }
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th>Patient ID</th>
                    <th>Alert Type</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert._id} className={alert.status === 'urgent' ? 'table-danger' : ''}>
                      <td className="fw-semibold">{alert.patientId}</td>
                      <td>
                        <Badge bg={getAlertTypeVariant(alert.alertType)}>
                          {alert.alertType}
                        </Badge>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }} title={alert.message}>
                        {alert.message}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(alert.status)}>
                          {alert.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{formatTimestamp(alert.timestamp || alert.createdAt || alert.timeStamp)}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowModal(true);
                            }}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          {alert.status !== 'resolved' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleStatusUpdate(alert._id, 'resolved')}
                              title="Mark as Resolved"
                            >
                              <FaCheckCircle />
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(alert._id)}
                            title="Delete Alert"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Alert Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Alert Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAlert && (
            <div className="row">
              <div className="col-12">
                <div className="mb-3">
                  <strong>Patient ID:</strong>
                  <p className="fw-semibold">{selectedAlert.patientId}</p>
                </div>
                <div className="mb-3">
                  <strong>Alert Type:</strong>
                  <p>
                    <Badge bg={getAlertTypeVariant(selectedAlert.alertType)}>
                      {selectedAlert.alertType}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Message:</strong>
                  <p className="p-2 bg-light rounded">{selectedAlert.message}</p>
                </div>
                <div className="mb-3">
                  <strong>Status:</strong>
                  <p>
                    <Badge bg={getStatusVariant(selectedAlert.status)}>
                      {selectedAlert.status?.toUpperCase()}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Timestamp:</strong>
                  <p>{formatTimestamp(selectedAlert.timestamp || selectedAlert.createdAt || selectedAlert.timeStamp)}</p>
                </div>
                {selectedAlert._id && (
                  <div className="mb-3">
                    <strong>Alert ID:</strong>
                    <p className="text-muted small">{selectedAlert._id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedAlert && selectedAlert.status !== 'resolved' && (
            <Button 
              variant="success" 
              onClick={() => {
                handleStatusUpdate(selectedAlert._id, 'resolved');
                setShowModal(false);
              }}
            >
              <FaCheckCircle className="me-2" />
              Mark as Resolved
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AlertsSection;