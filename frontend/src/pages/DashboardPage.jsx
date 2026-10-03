import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Cpu,
  Target,
  BookOpen,
  Volume2,
  CheckCircle2,
  Activity,
  PlayCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CONTINUOUS_SEQUENCE_PRESETS, COMPREHENSIVE_SIGNS } from '../data/signsData';

export default function DashboardPage({ onNavigate }) {
  const { user } = useAuth();
  const userName = user?.name || 'Ravi Kumar';

  return (
    <div className="dashboard-content">
      {/* 1. HERO SECTION */}
      <section className="hero-landing-section">
        <div className="hero-badge-pill">
          <Sparkles size={14} className="hero-sparkle-icon" />
          <span>Real-Time Temporal AI &bull; Indian Sign Language (ISL)</span>
        </div>

        <h1 className="hero-main-title">
          Continuous Indian Sign Language <span className="gradient-text">Translator</span>
        </h1>

        <p className="hero-main-subtitle">
          Translate Indian Sign Language into English continuously using AI and your camera.
          Recognizes rolling gesture sequences and converts them into natural, grammatically fluent English sentences in real-time.
        </p>

        <div className="hero-cta-group">
          <button
            className="btn-hero-primary"
            onClick={() => onNavigate('translate')}
          >
            <Camera size={18} />
            <span>Start Translating</span>
            <ArrowRight size={16} />
          </button>

          <button
            className="btn-hero-secondary"
            onClick={() => onNavigate('practice')}
          >
            <Target size={18} />
            <span>Try Practice Mode</span>
          </button>
        </div>

        {/* 2. VISUAL ARCHITECTURE PIPELINE */}
        <div className="pipeline-flow-container">
          <div className="pipeline-flow-header">
            <span className="flow-badge">End-to-End AI Pipeline</span>
            <h3>Camera &rarr; Sign Recognition &rarr; AI Translation &rarr; English</h3>
          </div>

          <div className="pipeline-nodes-grid">
            {/* Node 1: Camera */}
            <div className="pipeline-node-card active-node">
              <div className="node-icon-wrapper blue-glow">
                <Camera size={22} />
              </div>
              <div className="node-step-tag">Step 1</div>
              <h4>Live Camera Feed</h4>
              <p>60 FPS optical video frame capture of hands, facial expressions, and upper body posture.</p>
              <div className="node-subtech">MediaPipe Holistic</div>
            </div>

            <div className="pipeline-arrow-divider">
              <div className="arrow-line"></div>
              <ChevronRight size={20} className="arrow-icon" />
            </div>

            {/* Node 2: Sign Recognition */}
            <div className="pipeline-node-card active-node">
              <div className="node-icon-wrapper teal-glow">
                <Zap size={22} />
              </div>
              <div className="node-step-tag">Step 2</div>
              <h4>Sign Recognition</h4>
              <p>Extracts 63-D landmark coordinates, finger curls, and temporal movement dynamics.</p>
              <div className="node-subtech">Temporal Sequence Model</div>
            </div>

            <div className="pipeline-arrow-divider">
              <div className="arrow-line"></div>
              <ChevronRight size={20} className="arrow-icon" />
            </div>

            {/* Node 3: AI Translation */}
            <div className="pipeline-node-card active-node">
              <div className="node-icon-wrapper purple-glow">
                <Cpu size={22} />
              </div>
              <div className="node-step-tag">Step 3</div>
              <h4>AI Translation Layer</h4>
              <p>Transforms raw ISL gloss sequence (SOV) into natural English grammar with tense synthesis.</p>
              <div className="node-subtech">Grammar & NLP Engine</div>
            </div>

            <div className="pipeline-arrow-divider">
              <div className="arrow-line"></div>
              <ChevronRight size={20} className="arrow-icon" />
            </div>

            {/* Node 4: English Output + Speech */}
            <div className="pipeline-node-card active-node">
              <div className="node-icon-wrapper green-glow">
                <Volume2 size={22} />
              </div>
              <div className="node-step-tag">Step 4</div>
              <h4>English &amp; Speech</h4>
              <p>Instant live typography subtitles with automated Web Speech API text-to-speech audio.</p>
              <div className="node-subtech">Spoken Audio Output</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONTINUOUS SEQUENCE TRANSLATION EXAMPLE HIGHLIGHT */}
      <section className="continuous-demo-banner">
        <div className="demo-banner-left">
          <div className="demo-pill">Continuous Sequence Example</div>
          <h2>"I sign continuously &rarr; AI understands continuously"</h2>
          <p>
            No buttons needed after every gesture. The AI continuously observes transitions, eliminates resting pauses, and produces complete thoughts.
          </p>

          <div className="demo-sequence-comparison">
            <div className="sequence-row">
              <span className="seq-label">ISL Sign Sequence:</span>
              <div className="seq-tokens">
                <span className="token-badge">I</span>
                <span className="token-arrow">&rarr;</span>
                <span className="token-badge">GO</span>
                <span className="token-arrow">&rarr;</span>
                <span className="token-badge">COLLEGE</span>
                <span className="token-arrow">&rarr;</span>
                <span className="token-badge">TOMORROW</span>
              </div>
            </div>

            <div className="translation-result-row">
              <span className="trans-label">Translated English:</span>
              <div className="trans-text-box">
                <span className="quote-mark">“</span>
                <strong>I will go to college tomorrow.</strong>
                <span className="quote-mark">”</span>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-banner-right">
          <div className="demo-quick-actions">
            <h4>Try Sample Sequences</h4>
            <div className="presets-list">
              {CONTINUOUS_SEQUENCE_PRESETS.slice(0, 4).map((preset) => (
                <div
                  key={preset.id}
                  className="preset-mini-card"
                  onClick={() => onNavigate('translate')}
                >
                  <span className="preset-emoji">{preset.emoji}</span>
                  <div className="preset-info">
                    <span className="preset-title">{preset.title}</span>
                    <span className="preset-signs">{preset.sequence.join(' → ')}</span>
                  </div>
                  <ChevronRight size={16} className="preset-arrow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY CAPABILITIES GRID */}
      <section className="dashboard-feature-grid">
        <div className="feature-grid-header">
          <h2>Engineered for Continuous Translation</h2>
          <p>Comprehensive computer vision and neural language processing tailored for Indian Sign Language</p>
        </div>

        <div className="cards-3col-grid">
          <div className="feature-modern-card" onClick={() => onNavigate('translate')}>
            <div className="feat-icon-box blue-box">
              <Camera size={24} />
            </div>
            <h3>Live Vision Studio</h3>
            <p>Real-time webcam inference with MediaPipe 21 hand landmarks, skeleton mesh, and confidence thresholding.</p>
            <div className="card-footer-action">
              <span>Launch Studio</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div className="feature-modern-card" onClick={() => onNavigate('practice')}>
            <div className="feat-icon-box green-box">
              <Target size={24} />
            </div>
            <h3>Interactive Practice Mode</h3>
            <p>Master continuous sign sentences with real-time scoring, sign ordering validation, and accuracy feedback.</p>
            <div className="card-footer-action">
              <span>Start Practice</span>
              <ArrowRight size={14} />
            </div>
          </div>

          <div className="feature-modern-card" onClick={() => onNavigate('vocabulary')}>
            <div className="feat-icon-box purple-box">
              <BookOpen size={24} />
            </div>
            <h3>Vocabulary &amp; Levels (1–5)</h3>
            <p>Explore 60+ core ISL gestures, alphabets, numbers, actions, essentials, and continuous grammar presets.</p>
            <div className="card-footer-action">
              <span>Browse Dictionary</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
