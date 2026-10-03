import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogIn, UserPlus, Shield, Sparkles, ArrowRight, Hand,
  Eye, EyeOff, Mail, Lock, User, ChevronRight
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login, register, loginAsDemo } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isRegisterMode) {
        await register(name, email, role);
      } else {
        await login(email, password);
      }
      onLoginSuccess();
    } catch (err) {
      setMessage('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (type) => {
    loginAsDemo(type);
    onLoginSuccess();
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#030712', position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', left: '-150px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
        animation: 'pulse 8s ease-in-out infinite 2s'
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%', maxWidth: '460px', padding: '0 20px',
        animation: 'fadeIn 0.5s ease-out', zIndex: 1
      }}>
        <div style={{
          background: 'rgba(11, 17, 32, 0.95)', borderRadius: '20px',
          border: '1px solid #1E293B', padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(37,99,235,0.05)'
        }}>
          {/* Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px', boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
            }}>
              <Hand size={28} color="#FFF" />
            </div>
            <h1 style={{
              fontSize: '1.6rem', fontWeight: '800', color: '#F1F5F9',
              margin: '0 0 4px', letterSpacing: '-0.02em'
            }}>
              {isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.88rem', margin: 0 }}>
              {isRegisterMode
                ? 'Join ISL Translator — Start translating sign language'
                : 'Sign in to ISL Translator — Continuous AI Translation'}
            </p>
          </div>

          {/* Quick Demo Accounts */}
          {!isRegisterMode && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '10px', fontSize: '0.75rem', color: '#64748B', fontWeight: '600'
              }}>
                <Sparkles size={12} style={{ color: '#3B82F6' }} />
                Quick Demo Access
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDemoClick('user')}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
                    color: '#E2E8F0', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(37,99,235,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <User size={15} color="#60A5FA" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#E2E8F0' }}>Ravi Kumar</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>User • Translator</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('admin')}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
                    color: '#E2E8F0', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(124,58,237,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Shield size={15} color="#A78BFA" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#E2E8F0' }}>Admin</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Full Access</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          {!isRegisterMode && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#1E293B' }} />
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '500' }}>or sign in with email</span>
              <div style={{ flex: 1, height: '1px', background: '#1E293B' }} />
            </div>
          )}

          {/* Error Message */}
          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444', fontSize: '0.82rem', fontWeight: '500'
            }}>
              {message}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegisterMode && (
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: '600',
                  color: '#94A3B8', marginBottom: '6px'
                }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: '#475569'
                  }} />
                  <input
                    type="text"
                    placeholder="e.g. Ravi Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '11px 12px 11px 38px', borderRadius: '10px',
                      background: '#0F172A', border: '1px solid #1E293B', color: '#F1F5F9',
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: '600',
                color: '#94A3B8', marginBottom: '6px'
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#475569'
                }} />
                <input
                  type="email"
                  placeholder="e.g. ravi.kumar@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '11px 12px 11px 38px', borderRadius: '10px',
                    background: '#0F172A', border: '1px solid #1E293B', color: '#F1F5F9',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: '600',
                color: '#94A3B8', marginBottom: '6px'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#475569'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '11px 40px 11px 38px', borderRadius: '10px',
                    background: '#0F172A', border: '1px solid #1E293B', color: '#F1F5F9',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#475569', cursor: 'pointer', padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: '600',
                  color: '#94A3B8', marginBottom: '6px'
                }}>Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 12px', borderRadius: '10px',
                    background: '#0F172A', border: '1px solid #1E293B', color: '#F1F5F9',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  <option value="user">Standard User (Translator Studio)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px',
                background: loading ? '#1E293B' : 'linear-gradient(135deg, #2563EB, #3B82F6)',
                color: '#FFF', fontWeight: '700', fontSize: '0.92rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                transition: 'all 0.3s', marginTop: '4px'
              }}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  {isRegisterMode ? <UserPlus size={17} /> : <LogIn size={17} />}
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div style={{
            textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748B'
          }}>
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setMessage('');
              }}
              style={{
                background: 'none', border: 'none', color: '#60A5FA',
                fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem'
              }}
            >
              {isRegisterMode ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#334155'
        }}>
          ISL Translator • Continuous AI • Indian Standard Time
        </div>
      </div>
    </div>
  );
}
