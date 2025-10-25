import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaPlus, FaEdit } from "react-icons/fa";
import { Modal, Button, Table, Form, Spinner, Alert } from "react-bootstrap";

function CaregiversSection() {
  const [caregivers, setCaregivers] = useState([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // New caregiver state
  const [newCaregiver, setNewCaregiver] = useState({
    name: "",
    phoneNumber: "",
    regId: "",
    careGiverId: "",
    password: "",
    gender: "",
    email: "",
  });

  // Edit caregiver state
  const [editCaregiver, setEditCaregiver] = useState({
    name: "",
    phoneNumber: "",
    regId: "",
    careGiverId: "",
    gender: "",
    email: "",
  });

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setAddError("");
      setAddMessage("");
      setEditError("");
      setEditMessage("");
    }, 5000);
    return () => clearTimeout(timeOut);
  }, [addError, addMessage, editError, editMessage]);

  // Fetch caregivers on mount
  useEffect(() => {
    fetchCaregivers();
  }, []);

  // Fetch caregivers
  const fetchCaregivers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/careGivers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaregivers(res.data);
    } catch (error) {
      console.error("Error fetching caregivers:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new caregiver
  const handleAddCaregiver = async (e) => {
    e.preventDefault();
    try {
      setAddError("");
      const token = localStorage.getItem("token");
      const res = await axios.post("https://hospitalbackend-1-eail.onrender.com/caregivers", newCaregiver, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaregivers([...caregivers, res.data]);
      setNewCaregiver({
        name: "",
        phoneNumber: "",
        regId: "",
        careGiverId: "",
        password: "",
        gender: "",
        email: "",
      });
      setAddMessage(res.data.message || "Caregiver added successfully!");
      setTimeout(() => {
        setShowAddModal(false);
        setAddMessage("");
      }, 1500);
    } catch (error) {
      console.error("Error adding caregiver:", error.response?.data || error.message);
      setAddError(error.response?.data?.message || "Failed to add caregiver");
    }
  };

  // Edit caregiver
  const handleEditCaregiver = async (e) => {
    e.preventDefault();
    try {
      setEditError("");
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/caregivers/${selectedCaregiver._id}`,
        editCaregiver,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      setCaregivers(caregivers.map(cg => 
        cg._id === selectedCaregiver._id ? { ...cg, ...editCaregiver } : cg
      ));
      
      setEditMessage(res.data.message || "Caregiver updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        setEditMessage("");
        setSelectedCaregiver(null);
      }, 1500);
    } catch (error) {
      console.error("Error updating caregiver:", error.response?.data || error.message);
      setEditError(error.response?.data?.message || "Failed to update caregiver");
    }
  };

  // Delete caregiver
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this caregiver?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-1-eail.onrender.com/caregivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaregivers(caregivers.filter((c) => c._id !== id));
      alert("Caregiver deleted successfully!");
    } catch (error) {
      console.error("Error deleting caregiver:", error.response?.data || error.message);
      alert("Failed to delete caregiver.");
    }
  };

  // Open edit modal
  const openEditModal = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setEditCaregiver({
      name: caregiver.name || "",
      phoneNumber: caregiver.phoneNumber || "",
      regId: caregiver.regId || "",
      careGiverId: caregiver.careGiverId || "",
      gender: caregiver.gender || "",
      email: caregiver.email || "",
    });
    setEditError("");
    setEditMessage("");
    setShowEditModal(true);
  };

  // Close modals and reset states
  const closeAddModal = () => {
    setShowAddModal(false);
    setAddError("");
    setAddMessage("");
    setNewCaregiver({
      name: "",
      phoneNumber: "",
      regId: "",
      careGiverId: "",
      password: "",
      gender: "",
      email: "",
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditError("");
    setEditMessage("");
    setSelectedCaregiver(null);
  };

  // Filter caregivers
  const filteredCaregivers = caregivers.filter((caregiver) =>
    caregiver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caregiver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caregiver.careGiverId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      {/* Header + Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-primary">Caregivers Management</h4>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="text"
            placeholder="Search caregiver..."
            className="w-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Caregiver
          </Button>
        </div>
      </div>

      {/* Caregivers Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading caregivers...</p>
        </div>
      ) : filteredCaregivers.length === 0 ? (
        <div className="text-center my-5">
          <p className="text-muted">No caregivers found.</p>
        </div>
      ) : (
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-primary text-center">
            <tr>
              <th>Name</th>
              <th>CareGiver ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Registered by</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="align-middle text-center">
            {filteredCaregivers.map((caregiver) => (
              <tr key={caregiver._id}>
                <td className="fw-semibold">{caregiver.name}</td>
                <td>
                  <span className="badge bg-secondary">{caregiver?.careGiverId || "N/A"}</span>
                </td>
                <td>{caregiver.email}</td>
                <td>{caregiver.phoneNumber || "N/A"}</td>
                <td>
                  <span className={`badge ${
                    caregiver.gender === 'Male' ? 'bg-primary' : 'bg-pink'
                  }`}>
                    {caregiver.gender || "N/A"}
                  </span>
                </td>
                <td>{caregiver.registeredBy || "System"}</td>
                <td>
                  <div className="btn-group" role="group">
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="m-1"
                      onClick={() => setSelectedCaregiver(caregiver)}
                      title="View Details"
                    >
                      <FaEye />
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      className="m-1"
                      onClick={() => openEditModal(caregiver)}
                      title="Edit Caregiver"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="m-1"
                      onClick={() => handleDelete(caregiver._id)}
                      title="Delete Caregiver"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* View Caregiver Modal */}
      <Modal
        show={!!selectedCaregiver && !showEditModal}
        onHide={() => setSelectedCaregiver(null)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaEye className="me-2" />
            Caregiver Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCaregiver && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-semibold text-muted mb-3">Personal Information</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <p className="form-control-static">{selectedCaregiver.name}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <p className="form-control-static">{selectedCaregiver.email}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <p className="form-control-static">{selectedCaregiver.phoneNumber || "N/A"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Gender</label>
                  <p className="form-control-static">
                    <span className={`badge ${
                      selectedCaregiver.gender === 'Male' ? 'bg-primary' : 'bg-pink'
                    }`}>
                      {selectedCaregiver.gender || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="fw-semibold text-muted mb-3">Professional Information</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Registration ID</label>
                  <p className="form-control-static">{selectedCaregiver.regId || "N/A"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Caregiver ID</label>
                  <p className="form-control-static">
                    <span className="badge bg-secondary">{selectedCaregiver.careGiverId || "N/A"}</span>
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Registered By</label>
                  <p className="form-control-static">{selectedCaregiver.registeredBy || "System"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Assigned Patients</label>
                  {selectedCaregiver.assignedPatients && selectedCaregiver.assignedPatients.length > 0 ? (
                    <div className="mt-2">
                      {selectedCaregiver.assignedPatients.map((patient, index) => (
                        <span key={index} className="badge bg-success me-1 mb-1">
                          {patient}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No patients assigned</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedCaregiver(null)}>
            Close
          </Button>
          <Button 
            variant="warning" 
            onClick={() => openEditModal(selectedCaregiver)}
          >
            <FaEdit className="me-2" />
            Edit Caregiver
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Caregiver Modal */}
      <Modal show={showAddModal} onHide={closeAddModal} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Add New Caregiver
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddCaregiver}>
          <Modal.Body>
            {addError && (
              <Alert variant="danger" className="mb-3">
                {addError}
              </Alert>
            )}
            {addMessage && (
              <Alert variant="success" className="mb-3">
                {addMessage}
              </Alert>
            )}
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCaregiver.name}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    value={newCaregiver.email}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCaregiver.phoneNumber}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, phoneNumber: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Gender *</Form.Label>
                  <Form.Select
                    value={newCaregiver.gender}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Registration ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCaregiver.regId}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, regId: e.target.value })}
                    placeholder="Enter registration ID"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Caregiver ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={newCaregiver.careGiverId}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, careGiverId: e.target.value })}
                    placeholder="Enter caregiver ID"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password *</Form.Label>
                  <Form.Control
                    type="password"
                    value={newCaregiver.password}
                    onChange={(e) => setNewCaregiver({ ...newCaregiver, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeAddModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={!!addMessage}>
              {addMessage ? "Success!" : "Save Caregiver"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Caregiver Modal */}
      <Modal show={showEditModal} onHide={closeEditModal} centered size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Caregiver
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditCaregiver}>
          <Modal.Body>
            {editError && (
              <Alert variant="danger" className="mb-3">
                {editError}
              </Alert>
            )}
            {editMessage && (
              <Alert variant="success" className="mb-3">
                {editMessage}
              </Alert>
            )}
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCaregiver.name}
                    onChange={(e) => setEditCaregiver({ ...editCaregiver, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    value={editCaregiver.email}
                    onChange={(e) => setEditCaregiver({ ...editCaregiver, email: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCaregiver.phoneNumber}
                    onChange={(e) => setEditCaregiver({ ...editCaregiver, phoneNumber: e.target.value })}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Gender *</Form.Label>
                  <Form.Select
                    value={editCaregiver.gender}
                    onChange={(e) => setEditCaregiver({ ...editCaregiver, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Registration ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCaregiver.regId}
                    onChange={(e) => setEditCaregiver({ ...editCaregiver, regId: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Caregiver ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={editCaregiver.careGiverId}
                    onChange={(e) => setEditCaregiver({ ...editCaregiver, careGiverId: e.target.value })}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button type="submit" variant="warning" disabled={!!editMessage}>
              {editMessage ? "Updated!" : "Update Caregiver"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default CaregiversSection;