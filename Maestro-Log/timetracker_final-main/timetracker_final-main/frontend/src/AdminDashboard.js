import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';

function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ name: 'All', status: 'All', date: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get('http://localhost:5000/api/reports');
    setLogs(res.data);
  };

  const updateStatus = async (id, status) => {
    await axios.put(`http://localhost:5000/api/reports/${id}`, { status });
    fetchLogs();
  };

  const uniqueNames = [...new Set(logs.map(log => log.name))];

  const filteredLogs = logs.filter(log => {
    return (
      (filters.name === 'All' || log.name === filters.name) &&
      (filters.status === 'All' || log.status === filters.status) &&
      (filters.date === '' || log.date === filters.date)
    );
  });

  const downloadExcel = () => {
    const dataToExport = filteredLogs.map(({ name, date, workDone, pendingWork, workedHours, workMode, status }) => ({
      Name: name,
      Date: date,
      'Work Done': workDone,
      'Pending Work': pendingWork,
      'Worked Hours': workedHours,
      'Work Mode': workMode,
      Status: status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered Logs');

    const filename = `Logs-${filters.name !== 'All' ? filters.name : 'All'}-${filters.status}-${filters.date || 'All'}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-title">Admin Dashboard</div>
      </nav>

      <div className="container">
        <div className="form-section">
          <h2>Filter Logs</h2>
          <div className="form-row">
            <div>
              <label>Filter by Employee:</label>
              <select
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              >
                <option value="All">All</option>
                {uniqueNames.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Filter by Status:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label>Filter by Date:</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            {/* Download button aligned right in desktop, full width in mobile */}
            <div className="form-buttons">
              <button
                onClick={downloadExcel}
                className="excel-btn"
                disabled={filteredLogs.length === 0}
              >
                Download Excel
              </button>
            </div>
          </div>
        </div>

        <div className="log-table">
          <h3>Employee Logs</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Work Done</th>
                <th>Pending</th>
                <th>Hours</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.name}</td>
                  <td>{log.date}</td>
                  <td>{log.workDone}</td>
                  <td>{log.pendingWork}</td>
                  <td>{log.workedHours}</td>
                  <td>{log.workMode}</td>
                  <td className={`status ${log.status?.toLowerCase() || ''}`}>
                    {log.status || '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => updateStatus(log.id, 'Approved')}
                        disabled={log.status !== 'Pending'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(log.id, 'Rejected')}
                        disabled={log.status !== 'Pending'}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
