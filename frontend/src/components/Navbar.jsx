import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentISTClock } from '../utils/time';
import { Video, BookOpen, ShieldCheck, GitFork, Clock, LogOut, User as UserIcon, LogIn } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [istTime, setIstTime] = useState(getCurrentISTClock());
  const [mongoStatus, setMongoStatus] = useState('MongoDB: Connected');

  useEffect(() => {
    const timer = setInterval(() => {
      setIstTime(getCurrentISTClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        if (data.database) {
          setMongoStatus(`${data.database}: Connected (IST)`);
        }
      })
      .catch(() => setMongoStatus('Local Document Store (IST)'));
  }, []);

  return (
    <header className="navbar">
      <div className="brand-badge" onClick={() => setActiveTab('translator')}>
        <div className="brand-icon-box">
          <i className="fa-solid fa-hands-asl-interpreting"></i>
        </div>
        <div className="brand-title">
          <h1>SIGNVOX AI</h1>
          <p>Organic & Accessible &bull; IST Pipeline</p>
        </div>
      </div>

      <nav className="nav-menu-tabs" aria-label="Main Navigation">
        <button
          className={`nav-tab-item ${activeTab === 'translator' ? 'active' : ''}`}
          onClick={() => setActiveTab('translator')}
        >
          <Video size={16} /> Live Translator
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'dictionary' ? 'active' : ''}`}
          onClick={() => setActiveTab('dictionary')}
        >
          <BookOpen size={16} /> Sign Dictionary
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <ShieldCheck size={16} /> Admin Panel
        </button>
        <button
          className={`nav-tab-item ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <GitFork size={16} /> Architecture
        </button>
      </nav>

      <div className="nav-right-meta">
        {/* Live IST Clock */}
        <div className="ist-clock-badge" title="Indian Standard Time (UTC+05:30)">
          <div className="pulse-dot-green"></div>
          <Clock size={14} style={{ color: 'var(--accent-green)' }} />
          <span>{istTime}</span>
        </div>

        {/* User Auth Info / Login */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-profile-btn" onClick={() => setActiveTab('admin')}>
              <div className="user-avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-name-text">{user.name}</span>
              <span className="user-role-chip">{user.role?.toUpperCase()}</span>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={logout}
              title="Logout"
              style={{ padding: '6px 10px' }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('login')}
          >
            <LogIn size={15} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
}
