import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function AddSignModal({ isOpen, onClose, onSignAdded }) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('gesture');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.toLowerCase().trim(),
          category,
          description,
          features: [0.12, 0.45, 0.78, 0.92, 0.33, 0.67, 0.22, 0.81]
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create sign document');
      }

      const created = await res.json();
      onSignAdded(created);
      setLabel('');
      setDescription('');
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
          <h3>Add Sign (SIGNS Collection)</h3>
          <button className="modal-close-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: 'var(--accent-red-light)', color: 'var(--accent-red)', borderRadius: '6px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-field-group">
            <label>Sign Label</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. victory"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          <div className="form-field-group">
            <label>Category</label>
            <select
              className="input-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="greeting">Greeting</option>
              <option value="courtesy">Courtesy</option>
              <option value="response">Response</option>
              <option value="gesture">Gesture</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="form-field-group">
            <label>Description / Hand Pose Guide</label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Form a V-sign with index and middle fingers extended"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <Plus size={15} /> {loading ? 'Saving...' : 'Save to MongoDB (IST)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
