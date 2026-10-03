import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Clock, CheckCircle2, Save, Settings, Globe } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Varnikakomali');
  const [email, setEmail] = useState(user?.email || 'varnikakomali@gmail.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const userRole = user?.role === 'admin' ? 'ADMIN' : 'USER';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Profile Avatar & Info */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        marginBottom: '28px', animation: 'fadeIn 0.4s ease-out'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '18px',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))',
          border: '1px solid rgba(37,99,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <User size={38} color="#60A5FA" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: '800', color: '#F1F5F9',
            margin: '0 0 4px', letterSpacing: '-0.01em'
          }}>{name}</h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8' }}>
            {email} • <span style={{
              display: 'inline-block', padding: '1px 8px', borderRadius: '4px',
              background: userRole === 'ADMIN' ? 'rgba(124,58,237,0.15)' : 'rgba(37,99,235,0.15)',
              color: userRole === 'ADMIN' ? '#A78BFA' : '#60A5FA',
              fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px'
            }}>{userRole}</span>
          </p>
        </div>
      </div>

      {/* Settings Card */}
      <div style={{
        background: '#0B1120', borderRadius: '16px',
        border: '1px solid #1E293B', padding: '24px',
        animation: 'fadeIn 0.5s ease-out 0.1s both'
      }}>
        <h3 style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '1.05rem', fontWeight: '700', color: '#E2E8F0',
          margin: '0 0 20px', paddingBottom: '14px',
          borderBottom: '1px solid #1E293B'
        }}>
          <Settings size={18} color="#64748B" />
          Account Settings & Preferences
        </h3>

        {saved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px', marginBottom: '18px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            color: '#10B981', fontSize: '0.85rem', fontWeight: '600'
          }}>
            <CheckCircle2 size={16} />
            Profile settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '18px'
        }}>
          <div>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: '600',
              color: '#94A3B8', marginBottom: '6px'
            }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: '#0F172A', border: '1px solid #1E293B', color: '#F1F5F9',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: '600',
              color: '#94A3B8', marginBottom: '6px'
            }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: '#0F172A', border: '1px solid #1E293B', color: '#F1F5F9',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: '600',
              color: '#94A3B8', marginBottom: '6px'
            }}>Account Role</label>
            <input
              type="text"
              value="Standard User (Translator Studio)"
              disabled
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: '#090E17', border: '1px solid #1E293B', color: '#64748B',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '0.78rem', fontWeight: '600',
              color: '#94A3B8', marginBottom: '6px'
            }}>System Timezone</label>
            <input
              type="text"
              value="Indian Standard Time (IST - Asia/Kolkata)"
              disabled
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: '#090E17', border: '1px solid #1E293B', color: '#64748B',
                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
            <button type="submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              color: '#FFF', fontWeight: '700', fontSize: '0.88rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              transition: 'all 0.2s'
            }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
