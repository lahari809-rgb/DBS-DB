import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Copy, Download, Volume2, ChevronRight, Search, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TranslationHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('isl_translation_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch(e) {}
  }, []);

  // Save to localStorage
  const saveHistory = (items) => {
    setHistory(items);
    localStorage.setItem('isl_translation_history', JSON.stringify(items));
  };

  const clearHistory = () => saveHistory([]);

  const speakText = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const copyAll = () => {
    const text = history.map(h => `[${h.timestamp}] ${h.translation}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const downloadAll = () => {
    const text = history.map(h =>
      `[${h.timestamp}]\nSigns: ${(h.signs || []).join(' → ')}\nTranslation: ${h.translation}\nConfidence: ${((h.confidence || 0) * 100).toFixed(0)}%\n`
    ).join('\n---\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `isl_history_${Date.now()}.txt`;
    a.click();
  };

  const filtered = history.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (h.translation || '').toLowerCase().includes(q) ||
           (h.signs || []).some(s => s.toLowerCase().includes(q));
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>

      {/* Header */}
      <div style={{
        marginBottom: '16px', padding: '14px 20px',
        background: 'linear-gradient(135deg, #0F1E36, #1E293B)',
        borderRadius: '14px', border: '1px solid rgba(245,158,11,0.15)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '3px 10px', borderRadius: '16px',
          background: 'rgba(245,158,11,0.15)', color: '#FBBF24',
          fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px'
        }}>
          <Clock size={12} /> Translation History
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF', margin: 0 }}>
          Your Translation History
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Review, copy, and download your past ISL translations.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '14px', gap: '10px', flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#475569'
          }} />
          <input
            type="text"
            placeholder="Search translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px 8px 34px', borderRadius: '8px',
              background: '#0B1120', border: '1px solid #1E293B', color: '#F1F5F9',
              fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={copyAll} style={hBtnStyle}><Copy size={13} /> Copy All</button>
          <button onClick={downloadAll} style={hBtnStyle}><Download size={13} /> Download</button>
          <button onClick={clearHistory} style={{ ...hBtnStyle, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </div>

      {/* History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: '40px', textAlign: 'center', borderRadius: '14px',
            background: '#0B1120', border: '1px solid #1E293B'
          }}>
            <Clock size={40} style={{ color: '#334155', marginBottom: '12px' }} />
            <h3 style={{ color: '#64748B', fontSize: '1rem' }}>No translation history yet</h3>
            <p style={{ color: '#475569', fontSize: '0.85rem' }}>
              Start translating ISL to build your history. Completed sentences from the Live Translation page will appear here.
            </p>
          </div>
        ) : (
          filtered.map((h, i) => (
            <div key={h.id || i} style={{
              padding: '16px', borderRadius: '12px',
              background: '#0B1120', border: '1px solid #1E293B'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} style={{ color: '#475569' }} />
                  <span style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace' }}>
                    {h.timestamp || 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {h.confidence && (
                    <span style={{
                      fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px',
                      background: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: '700', fontFamily: 'monospace'
                    }}>
                      {(h.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                  <button onClick={() => speakText(h.translation)} style={{
                    background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px'
                  }}>
                    <Volume2 size={14} />
                  </button>
                </div>
              </div>

              {h.signs && h.signs.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {h.signs.map((s, j) => (
                    <React.Fragment key={j}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem',
                        background: 'rgba(56,189,248,0.08)', color: '#38BDF8', fontWeight: '600'
                      }}>{s}</span>
                      {j < h.signs.length - 1 && <span style={{ color: '#334155', fontSize: '0.7rem', alignSelf: 'center' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: '#E2E8F0' }}>
                "{h.translation}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const hBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '4px',
  padding: '6px 12px', borderRadius: '8px',
  background: '#1E293B', color: '#94A3B8', fontSize: '0.78rem',
  fontWeight: '600', border: '1px solid #334155', cursor: 'pointer'
};
