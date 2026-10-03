import React, { useState, useEffect } from 'react';
import { formatIST } from '../utils/time';
import AddUserModal from '../components/AddUserModal';
import AddSignModal from '../components/AddSignModal';
import { Users, Hand, History, BarChart3, Languages, UserPlus, Plus, Trash2, RefreshCw } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  const [activePanel, setActivePanel] = useState('users'); // users, signs, translations, history, analytics
  const [users, setUsers] = useState([]);
  const [signs, setSigns] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddSignOpen, setIsAddSignOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchSigns = async () => {
    try {
      const res = await fetch('/api/signs');
      const data = await res.json();
      setSigns(data);
    } catch (err) {
      console.error("Failed to fetch signs", err);
    }
  };

  const fetchTranslations = async () => {
    try {
      const res = await fetch('/api/translations?limit=100');
      const data = await res.json();
      setTranslations(data);
    } catch (err) {
      console.error("Failed to fetch translations", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?limit=100');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSigns();
    fetchTranslations();
    fetchHistory();
    fetchAnalytics();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user document from MongoDB?")) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u._id !== id));
      fetchAnalytics();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleDeleteSign = async (id) => {
    if (!window.confirm("Delete this sign from MongoDB SIGNS collection?")) return;
    try {
      await fetch(`/api/signs/${id}`, { method: 'DELETE' });
      setSigns(signs.filter(s => s._id !== id));
      fetchAnalytics();
    } catch (err) {
      alert("Failed to delete sign");
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear TRANSLATION_HISTORY collection?")) return;
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
      fetchAnalytics();
    } catch (err) {
      alert("Failed to clear history");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Navigation */}
      <div className="admin-sub-navbar">
        <button
          className={`admin-sub-tab ${activePanel === 'users' ? 'active' : ''}`}
          onClick={() => { setActivePanel('users'); fetchUsers(); }}
        >
          <Users size={16} /> Manage Users
        </button>
        <button
          className={`admin-sub-tab ${activePanel === 'signs' ? 'active' : ''}`}
          onClick={() => { setActivePanel('signs'); fetchSigns(); }}
        >
          <Hand size={16} /> Manage Signs
        </button>
        <button
          className={`admin-sub-tab ${activePanel === 'translations' ? 'active' : ''}`}
          onClick={() => { setActivePanel('translations'); fetchTranslations(); }}
        >
          <Languages size={16} /> View Translations
        </button>
        <button
          className={`admin-sub-tab ${activePanel === 'history' ? 'active' : ''}`}
          onClick={() => { setActivePanel('history'); fetchHistory(); }}
        >
          <History size={16} /> View History
        </button>
        <button
          className={`admin-sub-tab ${activePanel === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActivePanel('analytics'); fetchAnalytics(); }}
        >
          <BarChart3 size={16} /> System Analytics
        </button>
      </div>

      {/* 1. MANAGE USERS PANEL (Matching user image precisely) */}
      {activePanel === 'users' && (
        <div className="admin-card-container">
          <div className="admin-header-row">
            <div>
              <h3>MongoDB: USERS Collection</h3>
              <p>Schema: &#123; _id: ObjectId, name: String, email: String, role: String, createdAt: ISODate (IST) &#125;</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddUserOpen(true)}>
              <UserPlus size={15} /> Add New User
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>_ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>CREATED AT (IST)</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="mono-id">{u._id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ color: 'var(--text-body)' }}>{u.email}</td>
                  <td>
                    <span className={u.role === 'admin' ? 'badge-admin-role' : 'badge-user-role'}>
                      {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatIST(u.createdAt)}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(u._id)}
                      title="Delete user document"
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. MANAGE SIGNS PANEL */}
      {activePanel === 'signs' && (
        <div className="admin-card-container">
          <div className="admin-header-row">
            <div>
              <h3>MongoDB: SIGNS Collection</h3>
              <p>Schema: &#123; _id: ObjectId, label: String, videoUrl: String, features: [Float], createdAt: ISODate (IST) &#125;</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddSignOpen(true)}>
              <Plus size={15} /> Add New Sign
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>_ID</th>
                <th>LABEL</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>FEATURE VECTOR</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {signs.map(s => (
                <tr key={s._id}>
                  <td className="mono-id">{s._id}</td>
                  <td><strong>{s.label.toUpperCase()}</strong></td>
                  <td>
                    <span className="badge-user-role" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--dark-earth)', borderColor: 'var(--border-light)' }}>
                      {s.category || 'general'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                    {s.description || 'ASL gesture template'}
                  </td>
                  <td>
                    <span className="hud-pill" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--accent-green)', borderColor: 'var(--border-light)' }}>
                      {s.features ? s.features.length : 63} Floats
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteSign(s._id)}
                      title="Delete sign"
                      style={{ padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. VIEW TRANSLATIONS PANEL */}
      {activePanel === 'translations' && (
        <div className="admin-card-container">
          <div className="admin-header-row">
            <div>
              <h3>MongoDB: TRANSLATIONS Collection</h3>
              <p>Schema: &#123; _id: ObjectId, userId: ObjectId, signLabel: String, text: String, confidence: Float, createdAt: ISODate (IST) &#125;</p>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>_ID</th>
                <th>USER ID</th>
                <th>SIGN TEXT</th>
                <th>CONFIDENCE</th>
                <th>TIMESTAMP (IST)</th>
              </tr>
            </thead>
            <tbody>
              {translations.map(t => (
                <tr key={t._id}>
                  <td className="mono-id">{t._id}</td>
                  <td className="mono-id">{t.userId}</td>
                  <td><strong>{t.text || t.signLabel?.toUpperCase()}</strong></td>
                  <td>
                    <span className="confidence-indicator-chip" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {Math.round((t.confidence || 0.95) * 100)}%
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatIST(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. VIEW HISTORY PANEL */}
      {activePanel === 'history' && (
        <div className="admin-card-container">
          <div className="admin-header-row">
            <div>
              <h3>MongoDB: TRANSLATION_HISTORY Collection</h3>
              <p>Schema: &#123; _id: ObjectId, userId: ObjectId, signLabel: String, text: String, timestamp: ISODate (IST), method: String &#125;</p>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleClearHistory}>
              <Trash2 size={14} /> Clear History
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>_ID</th>
                <th>USER ID</th>
                <th>SIGN TRANSLATED</th>
                <th>METHOD</th>
                <th>LOGGED AT (IST)</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h._id}>
                  <td className="mono-id">{h._id}</td>
                  <td className="mono-id">{h.userId}</td>
                  <td><strong>{h.text || h.signLabel?.toUpperCase()}</strong></td>
                  <td>
                    <span className="badge-user-role" style={{ background: h.method === 'live' ? 'var(--accent-green-light)' : '#FEF3C7', color: h.method === 'live' ? 'var(--accent-green-hover)' : 'var(--accent-amber)' }}>
                      {h.method ? h.method.toUpperCase() : 'LIVE'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatIST(h.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. SYSTEM ANALYTICS PANEL */}
      {activePanel === 'analytics' && (
        <div>
          {/* KPI Summary Cards */}
          <div className="kpi-row">
            <div className="kpi-card-box">
              <span className="kpi-label">TOTAL USERS</span>
              <span className="kpi-val">{analytics?.totalUsers || users.length || 4}</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Active Accounts (IST)</span>
            </div>
            <div className="kpi-card-box">
              <span className="kpi-label">GESTURE VOCABULARY</span>
              <span className="kpi-val">{analytics?.totalSigns || signs.length || 10}</span>
              <span style={{ fontSize: '11px', color: 'var(--dark-earth)' }}>Trained Templates</span>
            </div>
            <div className="kpi-card-box">
              <span className="kpi-label">TOTAL TRANSLATIONS</span>
              <span className="kpi-val">{analytics?.totalTranslations || translations.length || 24}</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>Logged Inferences</span>
            </div>
            <div className="kpi-card-box">
              <span className="kpi-label">AVG CONFIDENCE</span>
              <span className="kpi-val">{Math.round((analytics?.averageConfidence || 0.96) * 100)}%</span>
              <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>High Accuracy</span>
            </div>
          </div>

          {/* Chart Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div className="admin-card-container">
              <h4 style={{ marginBottom: '14px', fontFamily: 'var(--font-heading)', color: 'var(--dark-earth)' }}>
                Most Translated Signs
              </h4>
              <div style={{ height: '240px' }}>
                <Bar
                  data={{
                    labels: Object.keys(analytics?.signDistribution || { "HELLO": 4, "THANK YOU": 3, "YES": 2, "PEACE": 2, "I LOVE YOU": 1 }),
                    datasets: [{
                      label: 'Translations',
                      data: Object.values(analytics?.signDistribution || { "HELLO": 4, "THANK YOU": 3, "YES": 2, "PEACE": 2, "I LOVE YOU": 1 }),
                      backgroundColor: '#16A34A',
                      borderRadius: 6
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { color: '#55685B' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                      y: { ticks: { color: '#55685B' }, grid: { color: 'rgba(0,0,0,0.05)' } }
                    }
                  }}
                />
              </div>
            </div>

            <div className="admin-card-container">
              <h4 style={{ marginBottom: '14px', fontFamily: 'var(--font-heading)', color: 'var(--dark-earth)' }}>
                Recognition Input Methods
              </h4>
              <div style={{ height: '240px' }}>
                <Doughnut
                  data={{
                    labels: ['Live Webcam Feed', 'Uploaded Media'],
                    datasets: [{
                      data: [
                        analytics?.methodDistribution?.live || 8,
                        analytics?.methodDistribution?.upload || 2
                      ],
                      backgroundColor: ['#2E3B32', '#16A34A']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={(newUser) => {
          setUsers([newUser, ...users]);
          fetchAnalytics();
        }}
      />

      <AddSignModal
        isOpen={isAddSignOpen}
        onClose={() => setIsAddSignOpen(false)}
        onSignAdded={(newSign) => {
          setSigns([newSign, ...signs]);
          fetchAnalytics();
        }}
      />
    </div>
  );
}
