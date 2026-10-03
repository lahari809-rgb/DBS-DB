import React, { useState, useEffect } from 'react';
import { Search, Volume2, Crosshair } from 'lucide-react';

export default function DictionaryPage({ onSelectPractice }) {
  const [signs, setSigns] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/signs')
      .then(res => res.json())
      .then(data => setSigns(data))
      .catch(err => console.error(err));
  }, []);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const filteredSigns = signs.filter(s => {
    const matchesCat = filterCat === 'all' || s.category?.toLowerCase() === filterCat.toLowerCase();
    const matchesQuery = s.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div>
      <div className="dictionary-top-bar">
        <div className="search-input-box">
          <Search size={16} style={{ color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder="Search signs, letters or greetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'greeting', 'courtesy', 'response', 'gesture', 'emergency'].map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filterCat === cat ? 'btn-dark' : 'btn-outline'}`}
              onClick={() => setFilterCat(cat)}
              style={{ textTransform: 'capitalize' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="dictionary-cards-grid">
        {filteredSigns.map(s => (
          <div key={s._id} className="dictionary-sign-card">
            <div className="dict-card-top">
              <span className="dict-sign-title">{s.label.toUpperCase()}</span>
              <span className="dict-cat-tag">{s.category || 'gesture'}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', flex: 1 }}>
              {s.description || 'Standard sign language hand pose gesture.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => onSelectPractice(s.label)}
              >
                <Crosshair size={14} style={{ color: 'var(--accent-green)' }} /> Practice Pose
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => speak(s.label)}
                title="Speak"
                style={{ padding: '6px 10px' }}
              >
                <Volume2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
