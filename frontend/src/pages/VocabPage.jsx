import React, { useState } from 'react';
import { BookOpen, Search, Layers, Hand, Volume2, Filter } from 'lucide-react';
import { ISL_SIGNS, ISL_CATEGORIES, ISL_LEVELS, getSignsByCategory } from '../data/islVocabulary';

export default function VocabPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [selectedSign, setSelectedSign] = useState(null);

  const filteredSigns = ISL_SIGNS.filter(s => {
    if (s.category === 'System') return false;
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    if (selectedLevel > 0 && s.level !== selectedLevel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.label.toLowerCase().includes(q) ||
             s.meaning.toLowerCase().includes(q) ||
             s.category.toLowerCase().includes(q);
    }
    return true;
  });

  const speakSign = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px' }}>

      {/* Header */}
      <div style={{
        marginBottom: '16px', padding: '14px 20px',
        background: 'linear-gradient(135deg, #0F1E36, #1E293B)',
        borderRadius: '14px', border: '1px solid rgba(6,182,212,0.15)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '3px 10px', borderRadius: '16px',
          background: 'rgba(6,182,212,0.15)', color: '#22D3EE',
          fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px'
        }}>
          <BookOpen size={12} /> ISL Vocabulary Database
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF', margin: 0 }}>
          ISL Sign Vocabulary ({ISL_SIGNS.filter(s => s.category !== 'System').length} Signs)
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Browse all supported Indian Sign Language signs with gesture instructions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* LEFT: Filters */}
        <div>
          {/* Search */}
          <div style={{
            position: 'relative', marginBottom: '14px'
          }}>
            <Search size={16} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: '#475569'
            }} />
            <input
              type="text"
              placeholder="Search signs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 10px 10px 36px', borderRadius: '10px',
                background: '#0B1120', border: '1px solid #1E293B', color: '#F1F5F9',
                fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Levels */}
          <div style={{
            background: '#0B1120', borderRadius: '12px', padding: '14px',
            border: '1px solid #1E293B', marginBottom: '14px'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px' }}>
              <Layers size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> LEVELS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => setSelectedLevel(0)} style={filterBtnStyle(selectedLevel === 0)}>
                All Levels
              </button>
              {ISL_LEVELS.map(l => (
                <button key={l.level} onClick={() => setSelectedLevel(l.level)} style={filterBtnStyle(selectedLevel === l.level)}>
                  L{l.level}: {l.name} <span style={{ color: '#475569', fontSize: '0.72rem' }}>({l.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div style={{
            background: '#0B1120', borderRadius: '12px', padding: '14px',
            border: '1px solid #1E293B'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px' }}>
              <Filter size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> CATEGORIES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button onClick={() => setSelectedCategory('All')} style={filterBtnStyle(selectedCategory === 'All')}>
                All Categories
              </button>
              {ISL_CATEGORIES.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} style={filterBtnStyle(selectedCategory === c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Sign Grid + Detail */}
        <div>
          {/* Selected Sign Detail */}
          {selectedSign && (
            <div style={{
              marginBottom: '16px', padding: '20px', borderRadius: '14px',
              background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '2rem' }}>{selectedSign.emoji}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#38BDF8' }}>
                        {selectedSign.label}
                      </h2>
                      <span style={{
                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px',
                        background: 'rgba(6,182,212,0.1)', color: '#22D3EE', fontWeight: '600'
                      }}>
                        {selectedSign.category} · Level {selectedSign.level}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '0 0 12px' }}>
                    <strong style={{ color: '#CBD5E1' }}>Meaning:</strong> {selectedSign.meaning}
                  </p>
                  <div style={{
                    padding: '12px 14px', borderRadius: '8px',
                    background: '#0F172A', border: '1px solid #1E293B'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', marginBottom: '4px' }}>
                      <Hand size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> HOW TO SIGN
                    </div>
                    <p style={{ margin: 0, color: '#E2E8F0', fontSize: '0.92rem', lineHeight: '1.5' }}>
                      {selectedSign.gesture}
                    </p>
                  </div>
                </div>
                <button onClick={() => speakSign(selectedSign.speech || selectedSign.label)} style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'rgba(6,182,212,0.1)', color: '#22D3EE',
                  border: '1px solid rgba(6,182,212,0.2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '0.82rem'
                }}>
                  <Volume2 size={14} /> Speak
                </button>
              </div>
            </div>
          )}

          {/* Grid of signs */}
          <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '10px' }}>
            Showing {filteredSigns.length} signs
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '8px'
          }}>
            {filteredSigns.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedSign(s)}
                style={{
                  padding: '14px 8px', borderRadius: '10px', textAlign: 'center',
                  background: selectedSign?.id === s.id ? 'rgba(56,189,248,0.1)' : '#0B1120',
                  border: selectedSign?.id === s.id ? '1px solid rgba(56,189,248,0.3)' : '1px solid #1E293B',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{s.emoji}</div>
                <div style={{
                  fontSize: '0.82rem', fontWeight: '700',
                  color: selectedSign?.id === s.id ? '#38BDF8' : '#E2E8F0'
                }}>{s.label}</div>
                <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '2px' }}>{s.category}</div>
              </div>
            ))}
          </div>

          {filteredSigns.length === 0 && (
            <div style={{
              padding: '30px', textAlign: 'center', borderRadius: '12px',
              background: '#0B1120', border: '1px solid #1E293B'
            }}>
              <p style={{ color: '#64748B' }}>No signs match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function filterBtnStyle(active) {
  return {
    padding: '7px 12px', borderRadius: '6px', textAlign: 'left',
    background: active ? 'rgba(6,182,212,0.1)' : 'transparent',
    color: active ? '#22D3EE' : '#94A3B8', fontWeight: '600', fontSize: '0.82rem',
    border: active ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  };
}
