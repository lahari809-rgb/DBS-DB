import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create user document');
      }

      const created = await res.json();
      onUserAdded(created);
      setName('');
      setEmail('');
      setRole('user');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title-row">
          <h3>Add User (USERS Collection)</h3>
          <button className="modal-close-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: 'var(--accent-red-light)', color: 'var(--accent-red)', borderRadius: '6px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field-group">
            <label>Full Name</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Lahari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-control"
              placeholder="e.g. lahari@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group">
            <label>System Role</label>
            <select
              className="input-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <UserPlus size={15} /> {loading ? 'Saving...' : 'Create User Document (IST)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
