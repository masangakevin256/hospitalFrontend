import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaEye, FaPlus, FaEdit } from "react-icons/fa";
import { Modal, Button, Table, Form, Spinner, Alert } from "react-bootstrap";

function PatientsSection() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    phoneNumber: "",
    address: "",
    sickness: "",
    regId: "",
    assignedDoctor: "",
    assignedCareGiver: "",
    gender: "",
    email: "",
    password: "",
  });

  const [editPatient, setEditPatient] = useState({
    name: "",
    age: "",
    patientId: "",
    phoneNumber: "",
    address: "",
    sickness: "",
    regId: "",
    assignedDoctor: "",
    assignedCareGiver: "",
    gender: "",
    email: "",
  });

  // Clear messages after 3 seconds
  useEffect(() => {
    if (globalError || globalSuccess) {
      const timer = setTimeout(() => {
        setGlobalError("");
        setGlobalSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [globalError, globalSuccess]);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await axios.get("https://hospitalbackend-1-eail.onrender.com/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error.response?.data || error.message);
        setGlobalError("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Add new patient
  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      setAddError("");
      const token = localStorage.getItem("token");
      const res = await axios.post("https://hospitalbackend-1-eail.onrender.com/patients", newPatient, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients([...patients, res.data]);
      setAddSuccess("Patient added successfully!");
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Error adding patient:", error.response?.data || error.message);
      setAddError(error.response?.data?.message || "Failed to add patient");
    }
  };

  // Edit patient
  const handleEditPatient = async (e) => {
    e.preventDefault();
    try {
      setEditError("");
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/patients/${selectedPatient._id}`,
        editPatient,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      setPatients(patients.map(patient => 
        patient._id === selectedPatient._id ? { ...patient, ...editPatient } : patient
      ));
      
      setEditSuccess("Patient updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess("");
        setSelectedPatient(null);
      }, 1500);
    } catch (error) {
      console.error("Error updating patient:", error.response?.data || error.message);
      setEditError(error.response?.data?.message || "Failed to update patient");
    }
  };

  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-1-eail.onrender.com/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(patients.filter((p) => p._id !== id));
      setGlobalSuccess("Patient deleted successfully!");
    } catch (error) {
      console.error("Error deleting patient:", error.response?.data || error.message);
      setGlobalError("Failed to delete patient");
    }
  };

  // Open edit modal
  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setEditPatient({
      name: patient.name || "",
      age: patient.age || "",
      patientId: patient.patientId || "",
      phoneNumber: patient.phoneNumber || "",
      address: patient.address || "",
      sickness: patient.sickness || "",
      regId: patient.regId || "",
      assignedDoctor: patient.assignedCareGiver ,
      assignedCareGiver: patient.assignedCareGiver || "" ,
      gender: patient.gender || "",
      email: patient.email || "",
    });
    setEditError("");
    setEditSuccess("");
    setShowEditModal(true);
  };

  // Filter patients
  const filteredPatients = patients.filter((patient) =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when modal closes
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddError("");
    setAddSuccess("");
    setNewPatient({
      name: "",
      age: "",
      phoneNumber: "",
      address: "",
      sickness: "",
      regId: "",
      assignedDoctor: "",
      assignedCareGiver: "",
      gender: "",
      email: "",
      password: "",
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditError("");
    setEditSuccess("");
    setSelectedPatient(null);
  };

  const formFields = [
    { label: "Name", key: "name", type: "text", required: true },
    { label: "Age", key: "age", type: "number", required: true },
    { label: "Phone Number", key: "phoneNumber", type: "tel", required: true },
    { label: "Address", key: "address", type: "text", required: false },
    { label: "Sickness", key: "sickness", type: "text", required: false },
    { label: "Reg ID", key: "regId", type: "text", required: false },
    { label: "Assigned Doctor", key: "assignedDoctor", type: "text", required: false },
    { label: "Assigned Caregiver", key: "assignedCareGiver", type: "text", required: false },
    { label: "Email", key: "email", type: "email", required: true },
  ];

  return (
    <div className="container-fluid mt-4">
      {/* Global Alert Messages */}
      {globalError && <Alert variant="danger" onClose={() => setGlobalError("")} dismissible>{globalError}</Alert>}
      {globalSuccess && <Alert variant="success" onClose={() => setGlobalSuccess("")} dismissible>{globalSuccess}</Alert>}

      {/* Header + Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="fw-bold text-primary mb-0">Patients Management</h4>
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "500px" }}>
          <Form.Control
            type="text"
            placeholder="Search by name, patient ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="success" onClick={() => setShowAddModal(true)} className="d-flex align-items-center">
            <FaPlus className="me-2" /> Add Patient
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading patients...</p>
        </div>
      ) : (
        <>
          {filteredPatients.length === 0 ? (
            <div className="text-center my-5">
              <p className="text-muted">
                {searchTerm ? "No patients match your search." : "No patients found."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Sickness</th>
                    <th>Assigned Doctor</th>
                    <th>Assigned Caregiver</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id}>
                      <td className="fw-semibold">{patient.patientId}</td>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>{patient.phoneNumber}</td>
                      <td>
                        <span className={`badge ${patient.gender === 'Male' ? 'bg-primary' : 'bg-pink'}`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td>
                        {patient.sickness ? (
                          <span className="badge bg-warning text-dark">{patient.sickness}</span>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td>{patient.assignedDoctor?.name || "None" }</td>
                      <td>{patient.assignedCareGiver?.name || "None"}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => setSelectedPatient(patient)}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => openEditModal(patient)}
                            title="Edit Patient"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(patient._id)}
                            title="Delete Patient"
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

      {/* View Patient Modal */}
      <Modal show={!!selectedPatient && !showEditModal} onHide={() => setSelectedPatient(null)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaEye className="me-2" />
            Patient Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-semibold text-muted mb-3">Personal Information</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Patient ID</label>
                  <p className="form-control-static">{selectedPatient.patientId}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <p className="form-control-static">{selectedPatient.name}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Age</label>
                  <p className="form-control-static">{selectedPatient.age}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <p className="form-control-static">{selectedPatient.email}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <p className="form-control-static">{selectedPatient.phoneNumber}</p>
                </div>
              </div>
              <div className="col-md-6">
                <h6 className="fw-semibold text-muted mb-3">Additional Information</h6>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Address</label>
                  <p className="form-control-static">{selectedPatient.address || "Not provided"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Gender</label>
                  <p className="form-control-static">
                    <span className={`badge ${selectedPatient.gender === 'Male' ? 'bg-primary' : 'bg-pink'}`}>
                      {selectedPatient.gender}
                    </span>
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Sickness/Condition</label>
                  <p className="form-control-static">
                    {selectedPatient.sickness ? (
                      <span className="badge bg-warning text-dark">{selectedPatient.sickness}</span>
                    ) : (
                      "Not specified"
                    )}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Assigned Doctor</label>
                  <p className="form-control-static">{selectedPatient.assignedDoctor?.name || "None"}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Assigned Caregiver</label>
                  <p className="form-control-static">{selectedPatient.assignedCareGiver?.name || "None"}</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedPatient(null)}>
            Close
          </Button>
          <Button 
            variant="warning" 
            onClick={() => openEditModal(selectedPatient)}
          >
            <FaEdit className="me-2" />
            Edit Patient
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Patient Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaPlus className="me-2" />
            Add New Patient
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPatient}>
          <Modal.Body>
            {addError && (
              <Alert variant="danger" className="mb-3">
                {addError}
              </Alert>
            )}
            {addSuccess && (
              <Alert variant="success" className="mb-3">
                {addSuccess}
              </Alert>
            )}
            
            <div className="row">
              {formFields.map((field) => (
                <Form.Group className="mb-3 col-md-6" key={field.key}>
                  <Form.Label className="fw-semibold">
                    {field.label}
                    {field.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type={field.type}
                    value={newPatient[field.key]}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, [field.key]: e.target.value })
                    }
                    required={field.required}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </Form.Group>
              ))}
              
              {/* Password Field */}
              <Form.Group className="mb-3 col-md-6">
                <Form.Label className="fw-semibold">
                  Password <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  value={newPatient.password}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, password: e.target.value })
                  }
                  required
                  placeholder="Enter password"
                  minLength={6}
                />
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long
                </Form.Text>
              </Form.Group>

              {/* Gender Field */}
              <Form.Group className="mb-3 col-md-6">
                <Form.Label className="fw-semibold">
                  Gender <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={newPatient.gender}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, gender: e.target.value })
                  }
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={!!addSuccess}>
              {addSuccess ? "Success!" : "Save Patient"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Patient Modal */}
  <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
    <Modal.Header closeButton className="bg-warning text-dark">
      <Modal.Title>
        <FaEdit className="me-2" />
        Edit Patient
      </Modal.Title>
    </Modal.Header>
    <Form onSubmit={handleEditPatient}>
      <Modal.Body>
        {editError && (
          <Alert variant="danger" className="mb-3">
            {editError}
          </Alert>
        )}
        {editSuccess && (
          <Alert variant="success" className="mb-3">
            {editSuccess}
          </Alert>
        )}

      <div className="row">
      {formFields
        .filter(f => f.key !== "assignedDoctor" && f.key !== "assignedCareGiver") // skip these
        .map((field) => (
          <Form.Group className="mb-3 col-md-6" key={field.key}>
            <Form.Label className="fw-semibold">
              {field.label}
              {field.required && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              type={field.type}
              value={editPatient[field.key] || ""}
              onChange={(e) =>
                setEditPatient({ ...editPatient, [field.key]: e.target.value })
              }
              required={field.required}
              disabled={field.key === "patientId"}
            />
          </Form.Group>
      ))}

          {/* Gender Field */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-semibold">
              Gender <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={editPatient.gender}
              onChange={(e) =>
                setEditPatient({ ...editPatient, gender: e.target.value })
              }
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          {/* Patient ID Field (read-only) */}
          <Form.Group className="mb-3 col-md-6">
            <Form.Label className="fw-semibold">Patient ID</Form.Label>
            <Form.Control
              type="text"
              value={editPatient.patientId || ""}
              disabled
              readOnly
            />
            <Form.Text className="text-muted">
              Patient ID cannot be changed once created.
            </Form.Text>
          </Form.Group>

          {/* Assigned Doctor (non-editable, show name + phone) */}
            <Form.Group className="mb-3 col-md-6">
              <Form.Label className="fw-semibold">Assigned Doctor</Form.Label>
              <Form.Control
                type="text"
                value={
                  editPatient.assignedDoctor
                    ? `${editPatient.assignedDoctor.name || "N/A"} (${editPatient.assignedDoctor.phoneNumber || "N/A"})`
                    : "None"
                }
                disabled
                readOnly
              />
            </Form.Group>

            {/* Assigned Caregiver (non-editable, show name + phone) */}
            <Form.Group className="mb-3 col-md-6">
              <Form.Label className="fw-semibold">Assigned Caregiver</Form.Label>
              <Form.Control
                type="text"
                value={
                  editPatient.assignedCareGiver
                    ? `${editPatient.assignedCareGiver.name || "N/A"} (${editPatient.assignedCareGiver.phoneNumber || "N/A"})`
                    : "None"
                }
                disabled
                readOnly
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button type="submit" variant="warning" disabled={!!editSuccess}>
            {editSuccess ? "Updated!" : "Update Patient"}
          </Button>
        </Modal.Footer>
    </Form>
  </Modal>

    </div>
  );
}

export default PatientsSection;