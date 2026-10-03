import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Camera, ArrowRight, Zap, Brain, Globe, Mic, Eye, Layers,
  ChevronRight, Play, Hand, Monitor, MessageSquare, Volume2,
  Shield, Clock, BookOpen, Target, Star, Sparkles, LogOut
} from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: Camera, label: 'Camera Input', desc: 'Live webcam feed', color: '#3B82F6' },
  { icon: Eye, label: 'Hand Detection', desc: 'MediaPipe landmarks', color: '#06B6D4' },
  { icon: Layers, label: 'Feature Extraction', desc: 'Joints + angles + motion', color: '#8B5CF6' },
  { icon: Brain, label: 'AI Recognition', desc: 'Temporal sequence model', color: '#EC4899' },
  { icon: Globe, label: 'Translation', desc: 'ISL → English grammar', color: '#10B981' },
  { icon: Volume2, label: 'Output', desc: 'Text + Speech', color: '#F59E0B' },
];

const FEATURES = [
  {
    icon: Hand, title: 'Continuous Recognition',
    desc: 'Sign naturally without pressing buttons. The AI watches continuously and recognizes signs in real-time.',
    color: '#3B82F6'
  },
  {
    icon: Brain, title: 'Sentence Translation',
    desc: 'ISL grammar differs from English. Our engine translates sign sequences into natural English sentences.',
    color: '#8B5CF6'
  },
  {
    icon: Camera, title: '65+ ISL Signs',
    desc: 'Pronouns, verbs, nouns, questions, feelings, responses — covering everyday communication needs.',
    color: '#06B6D4'
  },
  {
    icon: Volume2, title: 'Text-to-Speech',
    desc: 'Hear the translation spoken aloud. Perfect for communication between deaf and hearing people.',
    color: '#10B981'
  },
  {
    icon: Target, title: 'Practice Mode',
    desc: 'Practice ISL sentences with real-time feedback. Track your accuracy and improve over time.',
    color: '#F59E0B'
  },
  {
    icon: Shield, title: 'Privacy First',
    desc: 'Camera frames are processed locally. No video is stored unless you choose to save a session.',
    color: '#EF4444'
  },
];

const STATS = [
  { value: '65+', label: 'ISL Signs' },
  { value: '8', label: 'Categories' },
  { value: '< 100ms', label: 'Latency' },
  { value: '60 FPS', label: 'Processing' },
];

export default function HomePage({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activePipeline, setActivePipeline] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setActivePipeline(p => (p + 1) % PIPELINE_STEPS.length), 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#F8FAFC', fontFamily: '"Outfit", sans-serif' }}>

      {/* ── NAV BAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 40px',
        background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Hand size={20} color="#FFF" />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: '700', letterSpacing: '-0.3px' }}>
            ISL AI Translator
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => onNavigate('translate')} style={{
            background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: '500'
          }}>Live Translation</button>
          <button onClick={() => onNavigate('vocabulary')} style={{
            background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: '500'
          }}>Vocabulary</button>
          <button onClick={() => onNavigate('practice')} style={{
            background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: '500'
          }}>Practice</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: '700', color: '#FFF'
            }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <button onClick={logout} style={{
              background: 'none', border: 'none', color: '#64748B', cursor: 'pointer'
            }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 40px 60px', textAlign: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.12) 0%, transparent 60%)'
      }}>
        {/* Animated background orbs */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '50px', right: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '24px',
            background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)',
            color: '#60A5FA', fontSize: '0.82rem', fontWeight: '600',
            marginBottom: '24px'
          }}>
            <Sparkles size={14} /> Powered by MediaPipe + Temporal AI
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: '800',
            lineHeight: '1.15', maxWidth: '800px', margin: '0 auto 20px',
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Continuous Indian Sign Language Translator
          </h1>

          <p style={{
            fontSize: '1.15rem', color: '#94A3B8', maxWidth: '620px',
            margin: '0 auto 36px', lineHeight: '1.7'
          }}>
            Translate Indian Sign Language into English continuously using AI and your camera.
            Sign naturally — the system watches, recognizes, and translates in real time.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('translate')} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 32px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              color: '#FFF', fontWeight: '700', fontSize: '1rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
              transition: 'all 0.2s ease'
            }}>
              <Play size={20} /> Start Translating
            </button>
            <button onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', color: '#E2E8F0',
              fontWeight: '600', fontSize: '1rem',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              Learn How It Works <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Demo translation card */}
        <div style={{
          maxWidth: '680px', margin: '50px auto 0',
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)',
          borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)',
          padding: '24px', textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '600', letterSpacing: '1px' }}>
              LIVE TRANSLATION PREVIEW
            </span>
          </div>
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px'
          }}>
            {['I', '→', 'GO', '→', 'COLLEGE', '→', 'TOMORROW'].map((t, i) => (
              <span key={i} style={{
                padding: t === '→' ? '4px 0' : '6px 14px',
                borderRadius: '8px',
                background: t === '→' ? 'transparent' : 'rgba(56,189,248,0.1)',
                border: t === '→' ? 'none' : '1px solid rgba(56,189,248,0.2)',
                color: t === '→' ? '#475569' : '#38BDF8',
                fontWeight: '700', fontSize: '0.9rem'
              }}>
                {t}
              </span>
            ))}
          </div>
          <div style={{
            padding: '14px 18px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>English Translation</span>
            <p style={{
              margin: '4px 0 0', fontSize: '1.15rem', fontWeight: '600',
              color: '#10B981', lineHeight: '1.4'
            }}>
              "I will go to college tomorrow."
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px',
        background: 'rgba(255,255,255,0.04)', margin: '0 40px',
        borderRadius: '14px', overflow: 'hidden'
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            padding: '28px 20px', textAlign: 'center',
            background: '#0B1120'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38BDF8', marginBottom: '4px' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '500' }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS — PIPELINE ── */}
      <section id="how-it-works" style={{ padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '2.2rem', fontWeight: '800', marginBottom: '12px',
            letterSpacing: '-0.5px'
          }}>
            How It Works
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            A six-stage AI pipeline processes your signs in real time
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', flexWrap: 'wrap', maxWidth: '1100px', margin: '0 auto'
        }}>
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activePipeline;
            return (
              <React.Fragment key={i}>
                <div
                  onClick={() => setActivePipeline(i)}
                  style={{
                    padding: '20px 24px', borderRadius: '14px',
                    background: isActive ? `${step.color}15` : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isActive ? step.color + '40' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer', textAlign: 'center', minWidth: '130px',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isActive ? `0 8px 24px ${step.color}20` : 'none'
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${step.color}20`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 10px', color: step.color
                  }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#E2E8F0', marginBottom: '2px' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {step.desc}
                  </div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight size={20} style={{ color: '#334155', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: '40px 40px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '12px' }}>
            Powerful Features
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
            Everything you need for seamless sign language communication
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px', maxWidth: '1100px', margin: '0 auto'
        }}>
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} style={{
                padding: '28px', borderRadius: '16px',
                background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: `${feat.color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', color: feat.color
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#F1F5F9' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.6', margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '60px 40px', textAlign: 'center',
        background: 'linear-gradient(180deg, transparent, rgba(37,99,235,0.06))'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>
          Ready to Start Translating?
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '1.05rem', marginBottom: '28px' }}>
          Open your camera and start signing. The AI handles the rest.
        </p>
        <button onClick={() => onNavigate('translate')} style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '16px 40px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          color: '#FFF', fontWeight: '700', fontSize: '1.1rem',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 12px 40px rgba(37,99,235,0.3)'
        }}>
          <Camera size={22} /> Open Live Translator
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '30px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#475569', fontSize: '0.82rem'
      }}>
        <span>© 2026 ISL AI Translator — Indian Sign Language Recognition System</span>
        <span>Built with MediaPipe · FastAPI · React</span>
      </footer>
    </div>
  );
}
