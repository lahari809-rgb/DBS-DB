import React, { useState } from 'react';
import { BookOpen, Volume2, Search, Sparkles } from 'lucide-react';
import { COMPREHENSIVE_SIGNS, CATEGORIES_LIST } from '../data/signsData';

export default function CategoriesPage({ onSelectPractice }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredSigns = COMPREHENSIVE_SIGNS.filter(sign => {
    const matchesCategory = selectedCategory === 'All' || sign.category === selectedCategory;
    const matchesSearch = sign.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sign.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sign.actionSummary && sign.actionSummary.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dictionary-view-container">
      {/* Header Banner */}
      <div className="dictionary-header-card">
        <div className="card-title-group">
          <div className="card-icon-blue">
            <BookOpen size={20} color="#2563EB" />
          </div>
          <div>
            <h2 className="card-title-text" style={{ fontSize: '18px' }}>
              Daily Communication Gestures | Indian Sign Language (ISL)
            </h2>
            <p className="card-subtitle-text">
              15 Standard signs organized across 4 official categories with exact action guidelines
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="dictionary-search-bar">
          <div className="search-input-box">
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search sign, meaning, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters-pills">
            {CATEGORIES_LIST.map(cat => (
              <button
                key={cat}
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Signs Grid */}
      <div className="signs-catalog-grid">
        {filteredSigns.map((sign) => (
          <div key={sign.id} className="sign-catalog-card">
            <div className="sign-card-top">
              <div className="sign-card-emoji">{sign.emoji}</div>
              <span className="sign-card-cat-badge">{sign.category}</span>
            </div>

            <h3 className="sign-card-title">{sign.label}</h3>
            
            {/* Action text directly under sign (Matching reference image) */}
            <div className="sign-action-pill-box">
              <span className="sign-action-summary-text">
                👉 {sign.actionSummary}
              </span>
            </div>

            <p className="sign-card-meaning" style={{ color: '#2563EB', fontWeight: 600 }}>
              Meaning: {sign.meaning}
            </p>
            
            <p className="sign-card-desc">{sign.description}</p>

            <div className="sign-card-actions">
              <button
                className="btn-card-sound"
                onClick={() => speak(sign.label)}
                title="Pronounce with Audio Speech"
              >
                <Volume2 size={16} color="#2563EB" />
              </button>
              <button
                className="btn-card-practice"
                onClick={() => onSelectPractice(sign)}
              >
                Practice in Camera &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
