import React, { useState, useEffect } from 'react';
import './App.css';

// --- PRODUCTION CONFIGURATION ---
// IMPORTANT: Replace the link below with your actual Render backend URL
const API_URL = "https://bfsi-backend.onrender.com";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState('');
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authMessage, setAuthMessage] = useState({ type: '', text: '' }); 

  const [activeTab, setActiveTab] = useState('SYSTEM_OVERVIEW'); 
  const [alertsData, setAlertsData] = useState([]);
  const [threatForm, setThreatForm] = useState({ employee: '', department: 'Investment Banking', snippet: '' });

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${API_URL}/api/alerts`)
        .then((res) => res.json())
        .then((data) => setAlertsData(data))
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated]);

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage({ type: '', text: '' });
    const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthMessage({ type: 'error', text: data.message });
        return;
      }

      if (authMode === 'register') {
        setAuthMessage({ type: 'success', text: 'Registration successful. Switching to Login...' });
        setTimeout(() => {
          setAuthMode('login');
          setAuthMessage({ type: '', text: '' });
        }, 2000);
      } else {
        setIsAuthenticated(true);
        setActiveUser(data.username);
        setAuthForm({ username: '', password: '' });
      }
    } catch (err) {
      setAuthMessage({ type: 'error', text: 'Server connection failed.' });
    }
  };

  const handleThreatScan = (e) => {
    e.preventDefault();
    if (!threatForm.employee || !threatForm.snippet) return;

    fetch(`${API_URL}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threatForm),
    })
      .then((res) => res.json())
      .then((updatedData) => {
        setAlertsData(updatedData);
        setThreatForm({ employee: '', department: 'Investment Banking', snippet: '' });
      });
  };

  const handleIsolate = (id) => {
    fetch(`${API_URL}/api/alerts/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((updatedData) => {
        setAlertsData(updatedData);
      })
      .catch((err) => console.error("Error isolating threat:", err));
  };

  const getRankings = () => {
    const counts = {};
    alertsData.forEach(alert => {
      if (!counts[alert.employee]) {
        counts[alert.employee] = { total: 0, high: 0, medium: 0, low: 0, department: alert.department };
      }
      counts[alert.employee].total += 1;
      if (alert.risk === 'High') counts[alert.employee].high += 1;
      else if (alert.risk === 'Medium') counts[alert.employee].medium += 1;
      else counts[alert.employee].low += 1;
    });
    
    return Object.keys(counts).map(emp => ({
      employee: emp,
      ...counts[emp]
    })).sort((a, b) => b.high - a.high || b.total - a.total);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>BFSI SHIELD</h1>
          <p>Secure Node Access Terminal</p>
          
          {authMessage.text && (
            <div className={authMessage.type === 'error' ? 'error-msg' : 'success-msg'}>
              {authMessage.text}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            <input 
              type="text" name="username" placeholder="Admin ID" 
              className="auth-input" value={authForm.username} onChange={handleAuthChange} required 
            />
            <input 
              type="password" name="password" placeholder="Passcode" 
              className="auth-input" value={authForm.password} onChange={handleAuthChange} required 
            />
            <button type="submit" className="auth-btn">
              {authMode === 'login' ? 'INITIALIZE LOGIN' : 'REGISTER NODE'}
            </button>
          </form>

          <div className="auth-switch" onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setAuthMessage({ type: '', text: '' });
          }}>
            {authMode === 'login' ? <>No access? <span>Request Node Registration</span></> : <>Have access? <span>Initialize Login</span></>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      <div className="sidebar">
        <div className="sidebar-title">BFSI // SHIELD</div>
        <ul className="nav-menu">
          {['SYSTEM_OVERVIEW', 'THREAT_LOGS', 'RISK_RANKINGS'].map(tab => (
            <li 
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('_', ' ')}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        
        <div className="header">
          <h2>[ {activeTab.replace('_', ' ')} ]</h2>
          <div>
            <span className="user-badge">OP_ID: {activeUser.toUpperCase()}</span>
            <button className="logout-btn" onClick={() => setIsAuthenticated(false)}>TERMINATE SESSION</button>
          </div>
        </div>

        <div className="tab-content" style={{ padding: '20px 0' }}>
          
          {activeTab === 'SYSTEM_OVERVIEW' && (
            <>
              <div className="dashboard-cards">
                <div className="card safe">
                  <h3>PACKETS SCANNED</h3>
                  <p className="value">{14205 + alertsData.length}</p>
                </div>
                <div className="card warning">
                  <h3>ANOMALIES DETECTED</h3>
                  <p className="value">{alertsData.filter(a => a.risk !== 'Low').length}</p>
                </div>
                <div className="card danger">
                  <h3>CRITICAL BREACHES</h3>
                  <p className="value">{alertsData.filter(a => a.risk === 'High').length}</p>
                </div>
              </div>

              <div className="simulator-section">
                <h3>📡 // COMMS INTERCEPT PROTOCOL</h3>
                <form onSubmit={handleThreatScan}>
                  
                  <div className="form-row">
                    <div className="input-wrapper">
                      <label>TARGET IDENTIFIER</label>
                      <input 
                        type="text" 
                        name="employee" 
                        className="cyber-input"
                        placeholder="e.g. B. Wayne" 
                        value={threatForm.employee} 
                        onChange={e => setThreatForm({...threatForm, employee: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="input-wrapper">
                      <label>VECTOR (DEPARTMENT)</label>
                      <select 
                        name="department" 
                        className="cyber-input"
                        value={threatForm.department} 
                        onChange={e => setThreatForm({...threatForm, department: e.target.value})}
                      >
                        <option>Investment Banking</option>
                        <option>Customer Service</option>
                        <option>IT Ops</option>
                        <option>HR</option>
                        <option>Executive Board</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-wrapper" style={{ marginBottom: '20px' }}>
                    <label>INTERCEPTED DATA STRING</label>
                    <textarea 
                      name="snippet" 
                      className="cyber-input cyber-textarea"
                      placeholder="Input raw message string for neural NLP analysis..." 
                      value={threatForm.snippet} 
                      onChange={e => setThreatForm({...threatForm, snippet: e.target.value})} 
                      required 
                    />
                  </div>

                  <button type="submit" className="submit-btn">EXECUTE DEEP SCAN</button>
                </form>
              </div>
            </>
          )}

          {activeTab === 'THREAT_LOGS' && (
            <div className="recent-alerts">
              <h3>// NEURAL NET THREAT LOGS</h3>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Target</th>
                    <th>Vector (Dept)</th>
                    <th>Intercepted Data</th>
                    <th>Severity</th>
                    <th>Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsData.map((alert) => (
                    <tr key={alert._id}>
                      <td>{alert.date}</td>
                      <td style={{color: '#38bdf8', fontWeight: 'bold'}}>{alert.employee}</td>
                      <td>{alert.department}</td>
                      <td><em>"{alert.snippet}"</em></td>
                      <td><span className={`badge ${alert.risk.toLowerCase()}`}>{alert.risk}</span></td>
                      <td><button className="action-btn" onClick={() => handleIsolate(alert._id)}>ISOLATE</button></td>
                    </tr>
                  ))}
                  {alertsData.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>No anomalies in current databank.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'RISK_RANKINGS' && (
            <div className="recent-alerts">
              <h3>// TARGET RISK LEADERBOARD</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {getRankings().map((rank, index) => (
                  <div key={rank.employee} style={{ 
                    background: 'rgba(30, 41, 59, 0.4)', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    borderLeft: rank.high > 0 ? '4px solid #ef4444' : (rank.medium > 0 ? '4px solid #f59e0b' : '4px solid #10b981')
                  }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div>
                        <span style={{ color: '#38bdf8', fontSize: '1.2rem', fontFamily: 'Orbitron', fontWeight: 'bold', marginRight: '15px' }}>#{index + 1}</span>
                        <strong style={{ color: '#e2e8f0', fontSize: '1.2rem', letterSpacing: '1px' }}>{rank.employee}</strong>
                        <span style={{ color: '#64748b', marginLeft: '10px', fontSize: '0.9rem' }}>({rank.department})</span>
                      </div>
                      <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>Total Intercepts: {rank.total}</span>
                    </div>

                    <div style={{ width: '100%', background: 'rgba(3, 7, 18, 0.8)', height: '12px', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                      {rank.high > 0 && <div style={{ width: `${(rank.high / rank.total) * 100}%`, background: '#ef4444', height: '100%' }}></div>}
                      {rank.medium > 0 && <div style={{ width: `${(rank.medium / rank.total) * 100}%`, background: '#f59e0b', height: '100%' }}></div>}
                      {rank.low > 0 && <div style={{ width: `${(rank.low / rank.total) * 100}%`, background: '#10b981', height: '100%' }}></div>}
                    </div>

                    <div style={{ display: 'flex', gap: '25px', marginTop: '10px', fontSize: '0.9rem', fontFamily: 'Orbitron' }}>
                      <span style={{ color: '#ef4444' }}>HIGH: {rank.high}</span>
                      <span style={{ color: '#f59e0b' }}>MEDIUM: {rank.medium}</span>
                      <span style={{ color: '#10b981' }}>LOW: {rank.low}</span>
                    </div>

                  </div>
                ))}
                
                {getRankings().length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <p style={{ fontSize: '1.2rem', fontFamily: 'Orbitron' }}>NO THREAT DATA AVAILABLE</p>
                    <p>System databanks are currently clear of intercepted communications.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;