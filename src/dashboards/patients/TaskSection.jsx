import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaUserInjured,
  FaCalendarAlt,
  FaUserMd,
  FaCommentMedical,
  FaSpinner,
} from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Badge,
  InputGroup,
  Alert,
  Button,
  Dropdown,
} from "react-bootstrap";
import axios from "axios";
import { format } from 'date-fns';
import { jwtDecode } from "jwt-decode";

function TaskSection() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState("");

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Fetch patient's tasks from backend
  useEffect(() => {
    fetchPatientTasks();
  }, []);

  const fetchPatientTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      // First, get patient ID from token or fetch patient data
      const decoded = jwtDecode(token);
      const patientName = decoded?.userInfo?.name || decoded?.userInfo?.username;
      
      if (!patientName) {
        setError("Unable to identify patient. Please log in again.");
        return;
      }

      // Fetch tasks for this patient
      const response = await axios.get("https://hospitalbackend-1-eail.onrender.com/tasks/patient", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Filter tasks for the current patient (backend might already do this)
      const patientTasks = response.data.filter(task => 
        task.patientName === patientName || 
        task.patientId === (decoded?.userInfo?.patientId || decoded?.userInfo?.id)
      );
      
      setTasks(patientTasks);
      setFilteredTasks(patientTasks);
      
      if (patientTasks.length > 0) {
        setPatientId(patientTasks[0].patientId);
      }
      
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.response?.data?.message || "Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  window.addEventListener("error", (e) => {
    console.log("React error:", e.error);
  });
}, []);

  // Filter logic
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (task.careGiverName && task.careGiverName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  }, [searchTerm, filterPriority, filterStatus, tasks]);


  // Helpers
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "secondary";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <FaExclamationTriangle className="text-danger" />;
      case "medium":
        return <FaExclamationTriangle className="text-warning" />;
      case "low":
        return <FaExclamationTriangle className="text-info" />;
      default:
        return <FaExclamationTriangle className="text-secondary" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "primary";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-success" />;
      case "in-progress":
        return <FaClock className="text-primary" />;
      case "pending":
        return <FaClock className="text-warning" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date set";
    try {
      return format(new Date(dateString), "MMM dd, yyyy hh:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getTaskTypeIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('medication') || titleLower.includes('pill') || titleLower.includes('drug')) {
      return <FaCommentMedical className="text-primary" />;
    } else if (titleLower.includes('checkup') || titleLower.includes('examination') || titleLower.includes('visit')) {
      return <FaUserMd className="text-info" />;
    } else if (titleLower.includes('therapy') || titleLower.includes('exercise')) {
      return <FaUserInjured className="text-success" />;
    }
    return <FaTasks className="text-secondary" />;
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    highPriority: tasks.filter((t) => t.priority === "high").length,
    assignedToYou: tasks.length, // All tasks shown are for this patient
  };

  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                <FaTasks className="me-2 text-primary" />
                My Care Tasks
              </h2>
              <p className="text-muted mb-0">
                Tasks assigned by your caregiver for your care plan
              </p>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={fetchPatientTasks}
              disabled={loading}
            >
              <FaSpinner className={`me-1 ${loading ? 'fa-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">Total Tasks</h6>
              <h3 className="fw-bold text-primary mb-auto">{taskStats.total}</h3>
              <small className="text-muted">Assigned to you</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">Completed</h6>
              <h3 className="fw-bold text-success mb-auto">{taskStats.completed}</h3>
              <small className="text-muted">{completionPercentage}% done</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">Pending</h6>
              <h3 className="fw-bold text-warning mb-auto">{taskStats.pending}</h3>
              <small className="text-muted">Awaiting action</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">In Progress</h6>
              <h3 className="fw-bold text-info mb-auto">{taskStats.inProgress}</h3>
              <small className="text-muted">Being worked on</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">High Priority</h6>
              <h3 className="fw-bold text-danger mb-auto">{taskStats.highPriority}</h3>
              <small className="text-muted">Urgent attention</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">Completion</h6>
              <h3 className="fw-bold text-dark mb-auto">{completionPercentage}%</h3>
              <small className="text-muted">Overall progress</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Completion Progress */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Task Completion Progress</h6>
            <div>
              <Badge bg="success" className="me-2">
                {taskStats.completed} Completed
              </Badge>
              <Badge bg="warning" className="me-2">
                {taskStats.pending} Pending
              </Badge>
              <Badge bg="info">
                {taskStats.inProgress} In Progress
              </Badge>
            </div>
          </div>
          <div className="progress" style={{ height: "10px" }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${(taskStats.completed / taskStats.total) * 100 || 0}%` }}
              aria-valuenow={taskStats.completed}
              aria-valuemin="0"
              aria-valuemax={taskStats.total}
            />
            <div 
              className="progress-bar bg-info" 
              role="progressbar" 
              style={{ width: `${(taskStats.inProgress / taskStats.total) * 100 || 0}%` }}
              aria-valuenow={taskStats.inProgress}
              aria-valuemin="0"
              aria-valuemax={taskStats.total}
            />
            <div 
              className="progress-bar bg-warning" 
              role="progressbar" 
              style={{ width: `${(taskStats.pending / taskStats.total) * 100 || 0}%` }}
              aria-valuenow={taskStats.pending}
              aria-valuemin="0"
              aria-valuemax={taskStats.total}
            />
          </div>
          <div className="d-flex justify-content-between mt-2">
            <small className="text-muted">0%</small>
            <small className="text-muted">{completionPercentage}%</small>
            <small className="text-muted">100%</small>
          </div>
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search tasks by title, description, or caregiver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("all");
                  setFilterStatus("all");
                }}
              >
                <FaFilter className="me-1" />
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tasks Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <div>
            <FaTasks className="me-2 text-primary" />
            <span className="fw-semibold">Assigned Care Tasks</span>
            <Badge bg="secondary" className="ms-2">{filteredTasks.length} tasks</Badge>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline-primary"
              onClick={fetchPatientTasks}
              disabled={loading}
            >
              <FaSpinner className={`me-1 ${loading ? 'fa-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading your care tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaTasks size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No tasks found</h5>
              <p className="text-muted">
                {tasks.length === 0 
                  ? "You don't have any assigned tasks yet." 
                  : "No tasks match your current filters."}
              </p>
              {searchTerm || filterPriority !== "all" || filterStatus !== "all" ? (
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterPriority("all");
                    setFilterStatus("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '5%' }}></th>
                    <th style={{ width: '25%' }}>Task Details</th>
                    <th style={{ width: '15%' }}>Caregiver</th>
                    <th style={{ width: '10%' }}>Priority</th>
                    <th style={{ width: '15%' }}>Due Date</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '20%' }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task._id}>
                      <td className="text-center">
                        {getTaskTypeIcon(task.title)}
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <strong className="text-dark">{task.title}</strong>
                          {task.description && (
                            <small className="text-muted text-truncate" style={{ maxWidth: '250px' }}>
                              {task.description}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserInjured className="me-2 text-warning" />
                          <div>
                            <div>{task.careGiverName || "Caregiver"}</div>
                            <small className="text-muted">Care Team</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getPriorityIcon(task.priority)}
                          <Badge 
                            bg={getPriorityVariant(task.priority)} 
                            className="ms-2 px-2 py-1"
                          >
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-muted" />
                          <div>
                            <div>{formatDate(task.date)}</div>
                            <small className="text-muted">
                              {task.date && new Date(task.date) < new Date() && task.status !== 'completed' 
                                ? <span className="text-danger">Overdue</span>
                                : task.status === 'completed'
                                ? <span className="text-success">Completed</span>
                                : "Scheduled"
                              }
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusIcon(task.status)}
                          <Badge 
                            bg={getStatusVariant(task.status)} 
                            className="ms-2 px-2 py-1"
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <small>{formatDate(task.createdAt)}</small>
                          <small className="text-muted">
                            Updated: {formatDate(task.updatedAt)}
                          </small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Summary Stats */}
      {filteredTasks.length > 0 && (
        <Row className="mt-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="mb-3">
                  <FaExclamationTriangle className="me-2 text-warning" />
                  Priority Distribution
                </h6>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>High Priority</span>
                  <Badge bg="danger">{taskStats.highPriority}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span>Medium Priority</span>
                  <Badge bg="warning">{tasks.filter(t => t.priority === 'medium').length}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Low Priority</span>
                  <Badge bg="info">{tasks.filter(t => t.priority === 'low').length}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="mb-3">
                  <FaClock className="me-2 text-info" />
                  Upcoming Deadlines
                </h6>
                {tasks
                  .filter(task => task.status !== 'completed' && task.date)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 3)
                  .map((task, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-truncate" style={{ maxWidth: '70%' }}>
                        {task.title}
                      </span>
                      <small className="text-muted">
                        {formatDate(task.date)}
                      </small>
                    </div>
                  ))}
                {tasks.filter(task => task.status !== 'completed' && task.date).length === 0 && (
                  <p className="text-muted mb-0">No upcoming deadlines</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default TaskSection;