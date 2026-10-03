import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  CheckCircle,
  HelpCircle,
  Volume2,
  Hand
} from 'lucide-react';
import { COMPREHENSIVE_SIGNS, CONTINUOUS_SEQUENCE_PRESETS, ISL_VOCABULARY_CATEGORIES } from '../data/signsData';

export default function VocabularyPage({ onSelectPractice }) {
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalSign, setActiveModalSign] = useState(null);

  const categoryTabs = [
    { id: 'ALL', name: 'All Signs', count: COMPREHENSIVE_SIGNS.length },
    ...ISL_VOCABULARY_CATEGORIES.map(cat => ({
      id: cat,
      name: cat,
      count: COMPREHENSIVE_SIGNS.filter(s => s.category === cat).length
    }))
  ];

  const filteredSigns = COMPREHENSIVE_SIGNS.filter(sign => {
    const matchesLevel = selectedLevel === 'ALL' || String(sign.level) === selectedLevel;
    const matchesCat = selectedCategory === 'ALL' || sign.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      sign.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.actionSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesCat && matchesSearch;
  });

  const speakSign = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="vocabulary-page-container">
      {/* Header Banner */}
      <div className="vocab-header-card">
        <div className="vocab-badge-row">
          <span className="vocab-badge">
            <BookOpen size={14} /> Indian Sign Language Dictionary
          </span>
          <span className="vocab-level-tag">8 Official ISL Chart Sections &bull; 172 Signs</span>
        </div>
        <h1>ISL Complete Sign Chart Dictionary</h1>
        <p>
          Official Indian Sign Language (ISL) vocabulary based strictly on the standardized sign chart: Alphabets, Numbers, Common Words, Phrases, Verbs, Adjectives, People &amp; Relationships, and Daily Life.
        </p>
      </div>

      {/* Category Navigation Tabs */}
      <div className="levels-tabs-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {categoryTabs.map(cat => (
          <button
            key={cat.id}
            className={`level-tab-btn ${selectedCategory === cat.id ? 'active-level' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="lvl-name">{cat.name}</span>
            <span className="lvl-count-badge">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Search & Category Filter Controls */}
      <div className="vocab-filter-controls">
        <div className="vocab-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search signs by keyword, meaning, or gesture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>&times;</button>
          )}
        </div>

        <div className="vocab-category-dropdown">
          <Filter size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {ISL_VOCABULARY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Level 5 Continuous Sequences Spotlight if Selected */}
      {(selectedLevel === '5' || selectedLevel === 'ALL') && (
        <section className="level5-spotlight-section">
          <div className="section-title-row">
            <span className="level5-badge">Level 5 Continuous Sequences</span>
            <h3>Continuous Multi-Sign Sentences</h3>
          </div>
          <div className="preset-cards-grid">
            {CONTINUOUS_SEQUENCE_PRESETS.map(preset => (
              <div key={preset.id} className="preset-card-detailed">
                <div className="preset-card-top">
                  <span className="preset-badge-cat">{preset.category}</span>
                  <span className="preset-card-emoji">{preset.emoji}</span>
                </div>
                <h4 className="preset-card-title">{preset.title}</h4>
                <div className="preset-signs-stream">
                  {preset.sequence.map((s, i) => (
                    <React.Fragment key={i}>
                      <span className="stream-token">{s}</span>
                      {i < preset.sequence.length - 1 && <span className="stream-arr">&rarr;</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="preset-english-trans">
                  <p>“{preset.english}”</p>
                </div>
                <button
                  className="btn-speak-preset"
                  onClick={() => speakSign(preset.english)}
                >
                  <Volume2 size={14} /> Listen Pronunciation
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Signs Cards Grid */}
      <section className="signs-catalog-section">
        <div className="section-title-row">
          <h3>Individual ISL Signs ({filteredSigns.length})</h3>
        </div>

        <div className="signs-cards-grid">
          {filteredSigns.map(sign => (
            <div
              key={sign.id}
              className="sign-card-modern"
              onClick={() => setActiveModalSign(sign)}
            >
              <div className="sign-card-header">
                <span className="sign-cat-pill">{sign.category}</span>
                <span className="sign-emoji">{sign.emoji || '✋'}</span>
              </div>

              <h3 className="sign-card-label">{sign.label}</h3>
              <p className="sign-card-meaning">{sign.meaning}</p>
              <p className="sign-card-summary">{sign.actionSummary}</p>

              <div className="sign-card-footer">
                <span className="level-badge">Level {sign.level || 3}</span>
                <button
                  className="btn-card-audio"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakSign(sign.label);
                  }}
                >
                  <Volume2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sign Detail Modal */}
      {activeModalSign && (
        <div className="modal-backdrop" onClick={() => setActiveModalSign(null)}>
          <div className="modal-dialog-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-bar">
              <div className="modal-title-group">
                <span className="modal-emoji">{activeModalSign.emoji}</span>
                <div>
                  <h2>{activeModalSign.label}</h2>
                  <span className="modal-sub">{activeModalSign.category} &bull; Level {activeModalSign.level}</span>
                </div>
              </div>
              <button className="btn-close-modal" onClick={() => setActiveModalSign(null)}>&times;</button>
            </div>

            <div className="modal-body-content">
              <div className="modal-info-block">
                <label>Meaning &amp; Semantics</label>
                <p>{activeModalSign.meaning}</p>
              </div>

              <div className="modal-info-block">
                <label>How to Perform Gesture</label>
                <p>{activeModalSign.description}</p>
              </div>

              <div className="modal-info-block">
                <label>Finger &amp; Hand Configuration</label>
                <div className="finger-chips-grid">
                  {Object.entries(activeModalSign.fingerPose || {}).map(([finger, pose]) => (
                    <div key={finger} className={`finger-chip ${pose === 'OPEN' ? 'chip-open' : 'chip-curl'}`}>
                      <span className="finger-name">{finger.toUpperCase()}</span>
                      <span className="finger-pose">{pose}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                className="btn-modal-speak"
                onClick={() => speakSign(activeModalSign.label)}
              >
                <Volume2 size={16} /> Speak Pronunciation
              </button>
              <button
                className="btn-modal-done"
                onClick={() => setActiveModalSign(null)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
