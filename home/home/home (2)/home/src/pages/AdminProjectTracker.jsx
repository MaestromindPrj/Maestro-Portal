import React, { useEffect } from 'react';

function AdminTracker() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const mainScript = document.createElement("script");
            mainScript.innerHTML = `
        ${/* your existing <script> from admin.html here */''}
        ${window.loadAdminScript || ''}
      `;
            document.body.appendChild(mainScript);
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div>
            <style dangerouslySetInnerHTML={{ __html: `your entire <style> content here` }} />
            <nav className="navbar">
                <div className="nav-content">
                    <img src="/logo.jpeg" alt="Logo" className="logo" />
                    <span className="nav-title">Maestrominds</span>
                </div>
            </nav>

            <h2>Admin Maestro Track</h2>

            <table id="admin-table">
                <thead>
                    <tr>
                        <th>Email ID</th>
                        <th>Date</th>
                        <th>Work</th>
                        <th>Worked Hours</th>
                        <th>Projects Pending</th>
                        <th>Work Status</th>
                        <th>Action / Status</th>
                    </tr>
                </thead>
                <tbody id="admin-body"></tbody>
            </table>

            <div className="download-section">
                <button onClick={() => window.downloadExcel()}>Download Excel</button>
                <button onClick={() => window.viewExcel()}>Preview Excel</button>
            </div>

            <div id="excelModal">
                <h3>Excel Data Preview</h3>
                <table id="excelTable">
                    <thead>
                        <tr>
                            <th>Email ID</th>
                            <th>Date</th>
                            <th>Work</th>
                            <th>Worked Hours</th>
                            <th>Projects Pending</th>
                            <th>Work Status</th>
                            <th>Approval</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <button onClick={() => window.closeExcel()}>Close</button>
                </div>
            </div>

            <div id="rejectModal">
                <h3>Enter Rejection Reason</h3>
                <textarea id="rejectReason" placeholder="Please mention the reason clearly..." />
                <div style={{ textAlign: "right" }}>
                    <button onClick={() => window.confirmReject()}>Submit</button>
                    <button onClick={() => window.closeRejectModal()}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default AdminTracker;
