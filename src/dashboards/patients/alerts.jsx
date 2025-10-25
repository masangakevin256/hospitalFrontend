import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Alert, Badge, Card, Row, Col } from "react-bootstrap";
import { FaEye, FaTrash, FaBell, FaCheckCircle, FaPlus, FaUser } from "react-icons/fa";

function AlertsSection({ patientData }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for new alert
  const [newAlert, setNewAlert] = useState({
    alertType: "general",
    message: "",
    priority: "medium"
  });

  // Fetch alerts for current patient
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3500/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter alerts for current patient only
        const patientAlerts = response.data.filter(alert => 
          alert.patientId === patientData?.patientId || 
          alert.patientId === patientData?._id ||
          alert.patientName === patientData?.name
        );
        
        setAlerts(patientAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error.response?.data || error.message);
        setError("Failed to fetch alerts");
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [patientData]);

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

  // Add new alert
  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const alertData = {
        patientId: patientData?.patientId || patientData?._id,
        patientName: patientData?.name,
        alertType: newAlert.alertType,
        message: newAlert.message,
        priority: newAlert.priority,
        status: "pending",
        timeStamp: new Date().toISOString()
      };

      const response = await axios.post("http://localhost:3500/alerts", alertData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlerts(prev => [response.data, ...prev]);
      setShowAddModal(false);
      setNewAlert({ alertType: "general", message: "", priority: "medium" });
      setSuccess("Alert created successfully!");
    } catch (error) {
      console.error("Error creating alert:", error.response?.data || error.message);
      setError("Failed to create alert");
    }
  };

  // Delete alert
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3500/alerts/${id}`, {
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
        `http://localhost:3500/alerts/${id}`,
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
      case 'general': return 'dark';
      case 'symptoms': return 'warning';
      case 'test results': return 'success';
      default: return 'dark';
    }
  };

  // Get priority badge variant
  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getUnreadCount = () => {
    return alerts.filter(alert => alert.status === 'pending').length;
  };

  const getUrgentCount = () => {
    return alerts.filter(alert => alert.priority === 'high').length;
  };

  return (
    <div className="container-fluid mt-4">
      {/* Alert Messages */}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {/* Header + Search + Filters */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-primary mb-0">
            <FaBell className="me-2" />
            My Health Alerts
          </h4>
          <p className="text-muted mb-0">Manage your health notifications and concerns</p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Search alerts..."
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
          </Form.Select>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" />
            New Alert
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaBell className="text-primary" size={20} />
              </div>
              <h5 className="card-title text-muted">Total Alerts</h5>
              <h3 className="mb-0 text-primary">{alerts.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaBell className="text-warning" size={20} />
              </div>
              <h5 className="card-title text-muted">Pending</h5>
              <h3 className="mb-0 text-warning">{getUnreadCount()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-sm bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaBell className="text-danger" size={20} />
              </div>
              <h5 className="card-title text-muted">Urgent</h5>
              <h3 className="mb-0 text-danger">{getUrgentCount()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaCheckCircle className="text-success" size={20} />
              </div>
              <h5 className="card-title text-muted">Resolved</h5>
              <h3 className="mb-0 text-success">{alerts.filter(a => a.status === 'resolved').length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Patient Info Card */}
      {patientData && (
        <Card className="mb-4 border-0 shadow-sm bg-light">
          <Card.Body className="py-3">
            <Row className="align-items-center">
              <Col md={6}>
                <div className="d-flex align-items-center">
                  <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                    <FaUser className="text-primary" size={16} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{patientData.name || patientData.username}</h6>
                    <small className="text-muted">Patient ID: {patientData.patientId}</small>
                  </div>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <small className="text-muted">
                  You can create alerts for medication concerns, symptoms, or general health questions
                </small>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Alerts Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading your alerts...</p>
        </div>
      ) : (
        <>
          {filteredAlerts.length === 0 ? (
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <FaBell size={48} className="text-muted mb-3 opacity-25" />
                <h5 className="text-muted">
                  {searchTerm || filterStatus !== "all" 
                    ? "No alerts match your search criteria." 
                    : "You don't have any alerts yet."
                  }
                </h5>
                <p className="text-muted mb-3">
                  {!searchTerm && filterStatus === "all" && "Create your first alert to get started."}
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddModal(true)}
                  className="d-flex align-items-center mx-auto"
                >
                  <FaPlus className="me-2" />
                  Create Your First Alert
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th>Alert Type</th>
                    <th>Message</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert._id} className={alert.priority === 'high' ? 'table-warning' : ''}>
                      <td>
                        <Badge bg={getAlertTypeVariant(alert.alertType)}>
                          {alert.alertType}
                        </Badge>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '250px' }} title={alert.message}>
                        {alert.message}
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(alert.priority)}>
                          {alert.priority?.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(alert.status)}>
                          {alert.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td>{formatTimestamp(alert.timeStamp)}</td>
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
                  <strong>Alert Type:</strong>
                  <p>
                    <Badge bg={getAlertTypeVariant(selectedAlert.alertType)}>
                      {selectedAlert.alertType}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Priority:</strong>
                  <p>
                    <Badge bg={getPriorityVariant(selectedAlert.priority)}>
                      {selectedAlert.priority?.toUpperCase()}
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
                  <strong>Date & Time:</strong>
                  <p>{formatTimestamp(selectedAlert.timeStamp)}</p>
                </div>
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

      {/* Add Alert Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Create New Alert</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddAlert}>
          <Modal.Body>
            <div className="row">
              <div className="col-12">
                <Form.Group className="mb-3">
                  <Form.Label>Alert Type</Form.Label>
                  <Form.Select
                    value={newAlert.alertType}
                    onChange={(e) => setNewAlert({...newAlert, alertType: e.target.value})}
                    required
                  >
                    <option value="general">General Question</option>
                    <option value="medication">Medication Concern</option>
                    <option value="symptoms">Symptoms</option>
                    <option value="appointment">Appointment Related</option>
                    <option value="test results">Test Results</option>
                    <option value="blood pressure">Blood Pressure</option>
                    <option value="heart rate">Heart Rate</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={newAlert.priority}
                    onChange={(e) => setNewAlert({...newAlert, priority: e.target.value})}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe your concern or question..."
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                    required
                  />
                  <Form.Text className="text-muted">
                    Please provide detailed information about your health concern.
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FaPlus className="me-2" />
              Create Alert
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AlertsSection;