import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import {
  FaCheckCircle, FaCalendarAlt, FaUserCheck, FaClock, FaBuilding, FaHome
} from 'react-icons/fa';

function App() {
  const [form, setForm] = useState({
    date: '',
    workDone: '',
    workedHours: '',
    pendingWork: '',
    workMode: 'Work From Home',
  });

  const [logs, setLogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm((prev) => ({ ...prev, date: today }));
    fetchLogs(today);
  }, []);

  const fetchLogs = async (todayDate) => {
    const res = await axios.get('http://localhost:5000/api/reports');
    setLogs(res.data);

    const submitted = res.data.some(
      (log) =>
        log.date === todayDate &&
        (log.status === 'Pending' || log.status === 'Approved')
    );
    setHasSubmittedToday(submitted);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/reports/${editingId}`, {
          ...form,
          status: 'Pending',
        });
        setEditingId(null);
      } else {
        if (hasSubmittedToday) return;
        await axios.post('http://localhost:5000/api/reports', { ...form, status: 'Pending' });
        setHasSubmittedToday(true);
      }

      fetchLogs(form.date);
      setForm((prev) => ({
        ...prev,
        workDone: '',
        workedHours: '',
        pendingWork: '',
        workMode: 'Work From Home',
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting log');
    }
  };

  const handleLeave = async () => {
    try {
      if (hasSubmittedToday) return;

      const leaveEntry = {
        date: form.date,
        workDone: 'Leave',
        workedHours: 0,
        pendingWork: '-',
        workMode: '-',
        status: 'Pending',
      };

      await axios.post('http://localhost:5000/api/reports', leaveEntry);
      fetchLogs(form.date);
      setHasSubmittedToday(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error marking leave');
    }
  };

  const handleEdit = (log) => {
    setForm({
      date: log.date,
      workDone: log.workDone,
      workedHours: log.workedHours,
      pendingWork: log.pendingWork,
      workMode: log.workMode || 'Work From Home',
    });
    setEditingId(log.id);
    setHasSubmittedToday(false);
    if (formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reports/${id}`);
      fetchLogs(form.date);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting log');
    }
  };

  const summary = {
    worked: logs.filter(l => l.workDone !== 'Leave' && ['Pending', 'Approved'].includes(l.status)).length,
    leave: logs.filter(l => l.workDone === 'Leave').length,
    approved: logs.filter(l => l.status === 'Approved').length,
    pending: logs.filter(l => l.status === 'Pending').length,
    offline: logs.filter(l => l.workMode === 'Offline').length,
    wfh: logs.filter(l => l.workMode === 'Work From Home').length,
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-title">Worker Dashboard</div>
      </nav>

      <div className="container">
        <div className="form-section" ref={formRef}>
          <h2>{editingId ? 'Edit and Resubmit' : 'Submit Report'}</h2>
          <div className="form-row">
            <input type="date" value={form.date} readOnly />
            <input placeholder="Work Done" value={form.workDone} onChange={(e) => setForm({ ...form, workDone: e.target.value })} />
            <input type="number" placeholder="Hours" value={form.workedHours} onChange={(e) => setForm({ ...form, workedHours: e.target.value })} />
            <input placeholder="Pending Work" value={form.pendingWork} onChange={(e) => setForm({ ...form, pendingWork: e.target.value })} />
            <select value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
              <option>Work From Home</option>
              <option>Offline</option>
            </select>
          </div>
          <div className="form-buttons">
            <button className="leave-btn" onClick={handleLeave} disabled={hasSubmittedToday}>Mark Leave</button>
            <button onClick={handleSubmit} disabled={!editingId && hasSubmittedToday}>
              {editingId ? 'Update & Resubmit' : (hasSubmittedToday ? 'Already Submitted' : 'Submit')}
            </button>
          </div>
        </div>

        <div className="dashboard">
          <h2>Worker Dashboard</h2>
          <div className="cards">
            <div className="card"><FaCheckCircle size={20} /><h4>Worked Days</h4><p>{summary.worked}</p></div>
            <div className="card"><FaCalendarAlt size={20} /><h4>Leave Days</h4><p>{summary.leave}</p></div>
            <div className="card"><FaUserCheck size={20} /><h4>Approved</h4><p>{summary.approved}</p></div>
            <div className="card"><FaClock size={20} /><h4>Pending</h4><p>{summary.pending}</p></div>
            <div className="card"><FaBuilding size={20} /><h4>Offline Days</h4><p>{summary.offline}</p></div>
            <div className="card"><FaHome size={20} /><h4>WFH Days</h4><p>{summary.wfh}</p></div>
          </div>

          <div className="log-table">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Work Done</th><th>Hours</th><th>Pending</th><th>Mode</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center' }}>No logs yet</td></tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id}>
                        <td>{log.date}</td>
                        <td>{log.workDone}</td>
                        <td>{log.workedHours}</td>
                        <td>{log.pendingWork}</td>
                        <td>{log.workMode}</td>
                        <td className={`status ${log.status?.toLowerCase() || ''}`}>{log.status || '-'}</td>
                        <td>
                          {(log.status === 'Pending' || log.status === 'Rejected') && (
                            <div className="action-buttons">
                              {log.workDone !== 'Leave' ? (
                                <button onClick={() => handleEdit(log)}>Edit</button>
                              ) : (
                                log.date === today && (
                                  <button onClick={() => handleDelete(log.id)}>Delete</button>
                                )
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
