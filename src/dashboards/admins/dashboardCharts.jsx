import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Spinner, Alert, Card, Row, Col } from "react-bootstrap";
import { FaUsers, FaBell, FaHeartbeat, FaUserShield } from "react-icons/fa";

const DashboardCharts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  const [patientData, setPatientData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);
  const [vitalsData, setVitalsData] = useState([]);
  const [doctorsData, setDoctorsData] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Fetch all data in parallel
        const [patientsRes, alertsRes, vitalsRes, doctorsRes] = await Promise.all([
          axios.get("https://hospitalbackend-pfva.onrender.com/patients", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://hospitalbackend-pfva.onrender.com/alerts", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://hospitalbackend-pfva.onrender.com/vitals", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://hospitalbackend-pfva.onrender.com/doctors", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const patients = patientsRes.data;
        const alerts = alertsRes.data;
        const vitals = vitalsRes.data;
        const doctors = doctorsRes.data;

        // Process patient growth data (last 6 months)
        const patientGrowth = processPatientGrowth(patients);
        setPatientData(patientGrowth);

        // Process alerts data (last 7 days)
        const alertsTrend = processAlertsTrend(alerts);
        setAlertsData(alertsTrend);

        // Process vitals statistics
        const vitalsStats = processVitalsData(vitals);
        setVitalsData(vitalsStats);

        // Process doctors specialization data
        const doctorsSpecialization = processDoctorsData(doctors);
        setDoctorsData(doctorsSpecialization);

        // Set overall statistics
        setStats({
          totalPatients: patients.length,
          totalDoctors: doctors.length,
          totalAlerts: alerts.length,
          pendingAlerts: alerts.filter(alert => alert.status === 'pending').length,
          criticalVitals: vitals.filter(vital => {
            const bp = vital.bloodPressure?.split('/')[0];
            return (bp > 140) || (vital.heartRate > 100) || (vital.glucoseLevel > 140);
          }).length
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  },[]);

  // Process patient growth data for last 6 months
  const processPatientGrowth = (patients) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      const monthPatients = patients.filter(patient => {
        const patientDate = new Date(patient.createdAt);
        return patientDate.getMonth() === date.getMonth() && 
               patientDate.getFullYear() === year;
      }).length;

      last6Months.push({
        month: `${month} ${date.getFullYear().toString().slice(2)}`,
        patients: monthPatients
      });
    }
    
    return last6Months;
  };

  // Process alerts trend for last 7 days
  const processAlertsTrend = (alerts) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.timeStamp || alert.createdAt);
        return alertDate.toDateString() === date.toDateString();
      }).length;

      last7Days.push({
        day: dayName,
        alerts: dayAlerts,
        date: date.toLocaleDateString()
      });
    }
    
    return last7Days;
  };

  // Process vitals data for statistics
  const processVitalsData = (vitals) => {
    const statusCount = {
      normal: 0,
      warning: 0,
      critical: 0
    };

    vitals.forEach(vital => {
      // Check blood pressure
      if (vital.bloodPressure) {
        const systolic = parseInt(vital.bloodPressure.split('/')[0]);
        if (systolic > 140) statusCount.critical++;
        else if (systolic < 90) statusCount.warning++;
        else statusCount.normal++;
      }

      // Check heart rate
      if (vital.heartRate) {
        if (vital.heartRate > 100 || vital.heartRate < 60) statusCount.critical++;
      }

      // Check glucose level
      if (vital.glucoseLevel) {
        if (vital.glucoseLevel > 140 || vital.glucoseLevel < 70) statusCount.warning++;
      }
    });

    return [
      { name: 'Normal', value: statusCount.normal },
      { name: 'Warning', value: statusCount.warning },
      { name: 'Critical', value: statusCount.critical }
    ];
  };

  // Process doctors by specialization
  const processDoctorsData = (doctors) => {
    const specializationCount = {};
    
    doctors.forEach(doctor => {
      const specialty = doctor.specialty || 'General';
      specializationCount[specialty] = (specializationCount[specialty] || 0) + 1;
    });

    return Object.entries(specializationCount).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length]
    }));
  };

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FaUsers className="text-primary mb-2" size={24} />
              <h4 className="fw-bold text-primary">{stats.totalPatients}</h4>
              <p className="text-muted mb-0">Total Patients</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FaUserShield className="text-success mb-2" size={24} />
              <h4 className="fw-bold text-success">{stats.totalDoctors}</h4>
              <p className="text-muted mb-0">Active Doctors</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FaBell className="text-warning mb-2" size={24} />
              <h4 className="fw-bold text-warning">{stats.pendingAlerts}</h4>
              <p className="text-muted mb-0">Pending Alerts</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FaHeartbeat className="text-danger mb-2" size={24} />
              <h4 className="fw-bold text-danger">{stats.criticalVitals}</h4>
              <p className="text-muted mb-0">Critical Vitals</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Patient Growth Chart */}
        <Col xl={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="text-primary mb-3">
                <FaUsers className="me-2" />
                Patient Growth (Last 6 Months)
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={patientData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#0d6efd" 
                    fill="#0d6efd" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Alerts Trend Chart */}
        <Col xl={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="text-danger mb-3">
                <FaBell className="me-2" />
                Alerts Trend (Last 7 Days)
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={alertsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.375rem'
                    }}
                    formatter={(value) => [`${value} alerts`, 'Alerts']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `Date: ${payload[0].payload.date}`;
                      }
                      return label;
                    }}
                  />
                  <Bar 
                    dataKey="alerts" 
                    fill="#dc3545" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Doctors Specialization */}
        <Col xl={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="text-success mb-3">
                <FaUserShield className="me-2" />
                Doctors by Specialization
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={doctorsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {doctorsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} doctors`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.375rem'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Vitals Status */}
        <Col xl={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="text-info mb-3">
                <FaHeartbeat className="me-2" />
                Vitals Status Overview
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vitalsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6c757d' }}
                    axisLine={{ stroke: '#dee2e6' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #dee2e6',
                      borderRadius: '0.375rem'
                    }}
                    formatter={(value) => [`${value} records`, 'Count']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#20c997"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardCharts;