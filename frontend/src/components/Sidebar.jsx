import React from 'react';
import {
  Home, Camera, Target, BookOpen, Clock, User, LogOut, Hand
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'translate', label: 'Live Translation', icon: Camera, badge: 'Live' },
    { id: 'practice', label: 'Practice Mode', icon: Target },
    { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', background: '#0B1120',
      borderRight: '1px solid #1E293B', display: 'flex', flexDirection: 'column',
      padding: '0', flexShrink: 0
    }}>
      {/* Brand */}
      <div
        onClick={() => setActiveTab('home')}
        style={{
          padding: '20px 18px', cursor: 'pointer',
          borderBottom: '1px solid #1E293B',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <Hand size={18} color="#FFF" />
        </div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#F1F5F9', lineHeight: '1.2' }}>
            ISL Translator
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: '500' }}>
            Continuous AI
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px',
                background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
                color: isActive ? '#60A5FA' : '#94A3B8',
                border: isActive ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                textAlign: 'left', width: '100%', transition: 'all 0.15s'
              }}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  padding: '1px 7px', borderRadius: '10px', fontSize: '0.65rem',
                  background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: '700'
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '8px',
            background: 'transparent', color: '#EF4444',
            border: '1px solid transparent', cursor: 'pointer',
            fontWeight: '600', fontSize: '0.85rem', textAlign: 'left', width: '100%'
          }}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Footer */}
      <div style={{
        padding: '14px 16px', borderTop: '1px solid #1E293B',
        fontSize: '0.72rem', color: '#475569', lineHeight: '1.5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#10B981', display: 'inline-block',
            boxShadow: '0 0 6px #10B981'
          }} />
          <span style={{ color: '#94A3B8', fontWeight: '600' }}>System Active</span>
        </div>
        <span>ISL → English via Temporal AI</span>
      </div>
    </aside>
  );
}
