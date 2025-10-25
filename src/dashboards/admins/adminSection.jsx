import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Alert, Badge } from "react-bootstrap";
import { FaEye, FaTrash, FaUserPlus, FaUserShield, FaEdit } from "react-icons/fa";
import "./AdminSection.css"; // Import the CSS file

function AdminsSection() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalError, setModalError] = useState(""); // Error for modal

  const [newAdmin, setNewAdmin] = useState({
    email: "",
    username: "",
    password: "",
    adminId: "",
    phoneNumber: "",
    secretReg: "",
    gender: "",
    amountPaid: ""
  });

  const [editAdmin, setEditAdmin] = useState({
    email: "",
    username: "",
    adminId: "",
    phoneNumber: "",
    gender: "",
    amountPaid: ""
  });

  // Fetch admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://hospitalbackend-pfva.onrender.com/admins", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(response.data);
      } catch (error) {
        console.error("Error fetching admins:", error.response?.data || error.message);
        setError("Failed to fetch admins");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
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

  // Add new admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setModalError(""); // Clear modal error
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://hospitalbackend-pfva.onrender.com/register/admins",
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdmins([...admins, response.data]);
      setSuccess("Admin added successfully!");
      setNewAdmin({
        email: "",
        username: "",
        password: "",
        adminId: "",
        phoneNumber: "",
        secretReg: "",
        gender: "",
        amountPaid: ""
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding admin:", error.response?.data || error.message);
      setModalError(error.response?.data?.message || "Failed to add admin");
    }
  };

  // Edit admin
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setModalError(""); // Clear modal error
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://hospitalbackend-pfva.onrender.com/admins/${selectedAdmin._id}`,
        editAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdmins(admins.map(admin => 
        admin._id === selectedAdmin._id ? response.data : admin
      ));
      setSuccess("Admin updated successfully!");
      setShowEditModal(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error updating admin:", error.response?.data || error.message);
      setModalError(error.response?.data?.message || "Failed to update admin");
    }
  };

  // Delete admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-pfva.onrender.com/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(admins.filter((admin) => admin._id !== id));
      setSuccess("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error.response?.data || error.message);
      setError("Failed to delete admin");
    }
  };

  // Open edit modal
  const handleOpenEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditAdmin({
      email: admin.email,
      username: admin.username,
      adminId: admin.adminId,
      phoneNumber: admin.phoneNumber,
      gender: admin.gender,
      amountPaid: admin.amountPaid || ""
    });
    setShowEditModal(true);
    setModalError(""); // Clear any previous modal errors
  };

  // Reset forms when modal closes
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewAdmin({
      email: "",
      username: "",
      password: "",
      adminId: "",
      phoneNumber: "",
      secretReg: "",
      gender: "",
      amountPaid: ""
    });
    setModalError(""); // Clear modal error
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAdmin(null);
    setModalError(""); // Clear modal error
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter admins
  const filteredAdmins = admins.filter((admin) =>
    admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.adminId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get gender badge variant
  const getGenderVariant = (gender) => {
    switch (gender) {
      case 'Male': return 'primary';
      case 'Female': return 'pink';
      default: return 'secondary';
    }
  };

  // Get role badge variant
  const getRoleVariant = (role) => {
    switch (role) {
      case 'admin': return 'success';
      case 'superadmin': return 'danger';
      case 'moderator': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="admins-section">
      {/* Alert Messages */}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {/* Header + Search + Add */}
      <div className="section-header">
        <h4 className="section-title">
          <FaUserShield className="me-2" />
          System Administrators
        </h4>
        <div className="search-add-container">
          <Form.Control
            type="text"
            placeholder="Search by name, admin ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button variant="success" onClick={() => setShowAddModal(true)} className="add-button">
            <FaUserPlus className="me-2" /> Add Admin
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-container">
        <div className="stat-card primary">
          <div className="stat-content">
            <h5 className="stat-title">Total Admins</h5>
            <h3 className="stat-value">{admins.length}</h3>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-content">
            <h5 className="stat-title">Active</h5>
            <h3 className="stat-value">{admins.length}</h3>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-content">
            <h5 className="stat-title">Roles</h5>
            <h3 className="stat-value">{new Set(admins.map(a => a.roles)).size}</h3>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p className="loading-text">Loading administrators...</p>
        </div>
      ) : (
        <>
          {filteredAdmins.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">
                {searchTerm ? "No administrators match your search." : "No administrators found."}
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admins-table">
                <thead>
                  <tr>
                    <th>Admin ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>Amount Paid</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id}>
                      <td className="admin-id">{admin.adminId}</td>
                      <td className="username">{admin.username}</td>
                      <td className="email">{admin.email}</td>
                      <td className="phone">{admin.phoneNumber}</td>
                      <td className="gender">
                        <Badge bg={getGenderVariant(admin.gender)}>
                          {admin.gender}
                        </Badge>
                      </td>
                      <td className="role">
                        <Badge bg={getRoleVariant(admin.roles)}>
                          {admin.roles?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="amount">
                        {admin.amountPaid ? (
                          <span className="amount-paid">
                            ${admin.amountPaid.toLocaleString()}
                          </span>
                        ) : (
                          <span className="amount-na">N/A</span>
                        )}
                      </td>
                      <td className="registered">{formatDate(admin.createdAt)}</td>
                      <td className="actions">
                        <div className="action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowModal(true);
                            }}
                            title="View Details"
                            className="action-btn"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleOpenEditModal(admin)}
                            title="Edit Admin"
                            className="action-btn"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(admin._id)}
                            title="Delete Admin"
                            className="action-btn"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Admin Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="modal-header-primary">
          <Modal.Title>Admin Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAdmin && (
            <div className="admin-details">
              <div className="details-column">
                <div className="detail-item">
                  <strong>Admin ID:</strong> {selectedAdmin.adminId}
                </div>
                <div className="detail-item">
                  <strong>Username:</strong> {selectedAdmin.username}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {selectedAdmin.email}
                </div>
                <div className="detail-item">
                  <strong>Phone Number:</strong> {selectedAdmin.phoneNumber}
                </div>
              </div>
              <div className="details-column">
                <div className="detail-item">
                  <strong>Gender:</strong> 
                  <Badge bg={getGenderVariant(selectedAdmin.gender)} className="ms-2">
                    {selectedAdmin.gender}
                  </Badge>
                </div>
                <div className="detail-item">
                  <strong>Role:</strong> 
                  <Badge bg={getRoleVariant(selectedAdmin.roles)} className="ms-2">
                    {selectedAdmin.roles?.toUpperCase()}
                  </Badge>
                </div>
                <div className="detail-item">
                  <strong>Amount Paid:</strong> 
                  <span className="amount-detail">
                    {selectedAdmin.amountPaid ? `$${selectedAdmin.amountPaid.toLocaleString()}` : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Registered At:</strong> {formatDate(selectedAdmin.createdAt)}
                </div>
                {selectedAdmin.registeredBy && (
                  <div className="detail-item">
                    <strong>Registered By:</strong>Admin {selectedAdmin.registeredBy}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Admin Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton className="modal-header-success">
          <Modal.Title>Add New Administrator</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddAdmin}>
          <Modal.Body>
            {/* Modal Error Alert */}
            {modalError && <Alert variant="danger" dismissible onClose={() => setModalError("")}>{modalError}</Alert>}
            
            <div className="form-grid">
              <Form.Group className="form-group">
                <Form.Label>Username <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Email <span className="required">*</span></Form.Label>
                <Form.Control
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Admin ID <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAdmin.adminId}
                  onChange={(e) => setNewAdmin({ ...newAdmin, adminId: e.target.value })}
                  required
                  placeholder="e.g., AD001"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Phone Number <span className="required">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  value={newAdmin.phoneNumber}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })}
                  required
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Password <span className="required">*</span></Form.Label>
                <Form.Control
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  placeholder="Enter password"
                  minLength={6}
                />
                <Form.Text className="form-text">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Secret Registration Code <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAdmin.secretReg}
                  onChange={(e) => setNewAdmin({ ...newAdmin, secretReg: e.target.value })}
                  required
                  placeholder="Enter secret code"
                />
                <Form.Text className="form-text">
                  Required for admin verification
                </Form.Text>
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Gender <span className="required">*</span></Form.Label>
                <Form.Select
                  value={newAdmin.gender}
                  onChange={(e) => setNewAdmin({ ...newAdmin, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Amount Paid</Form.Label>
                <Form.Control
                  type="number"
                  value={newAdmin.amountPaid || ""}
                  onChange={(e) => setNewAdmin({ ...newAdmin, amountPaid: e.target.value })}
                  placeholder="Enter amount paid"
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Add Administrator
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton className="modal-header-warning">
          <Modal.Title>Edit Administrator</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditAdmin}>
          <Modal.Body>
            {/* Modal Error Alert */}
            {modalError && <Alert variant="danger" dismissible onClose={() => setModalError("")}>{modalError}</Alert>}
            
            <div className="form-grid">
              <Form.Group className="form-group">
                <Form.Label>Username <span className="required">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={editAdmin.username}
                  onChange={(e) => setEditAdmin({ ...editAdmin, username: e.target.value })}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Email <span className="required">*</span></Form.Label>
                <Form.Control
                  type="email"
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </Form.Group>

              {/* <Form.Group className="form-group"> */}
            {/* <Form.Label>Admin ID <span className="required">*</span></Form.Label> */}
            {/* <Form.Control
              type="text"
              value={editAdmin.adminId}
              disabled // 👈 disables editing
              readOnly // 👈 extra safety (user can’t even focus it)
              placeholder="e.g., AD001"
            />
            <Form.Text className="text-muted">
              Admin ID cannot be changed once created.
            </Form.Text> */}
          {/* </Form.Group> */}

              <Form.Group className="form-group">
                <Form.Label>Phone Number <span className="required">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  value={editAdmin.phoneNumber}
                  onChange={(e) => setEditAdmin({ ...editAdmin, phoneNumber: e.target.value })}
                  required
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Gender <span className="required">*</span></Form.Label>
                <Form.Select
                  value={editAdmin.gender}
                  onChange={(e) => setEditAdmin({ ...editAdmin, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Amount Paid</Form.Label>
                <Form.Control
                  type="number"
                  value={editAdmin.amountPaid || ""}
                  onChange={(e) => setEditAdmin({ ...editAdmin, amountPaid: e.target.value })}
                  placeholder="Enter amount paid"
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button type="submit" variant="warning">
              Update Administrator
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminsSection;