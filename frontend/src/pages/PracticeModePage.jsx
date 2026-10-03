import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Target, Camera, Play, Square, Check, X, RotateCcw,
  ChevronRight, Award, Zap, ArrowRight, Volume2
} from 'lucide-react';
import { classifyISL, TemporalStabilizer } from '../utils/islClassifier';
import { PRACTICE_SENTENCES } from '../data/islVocabulary';

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],[0,17]
];

export default function PracticeModePage() {
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedSigns, setDetectedSigns] = useState([]);
  const [currentSign, setCurrentSign] = useState('');
  const [handsDetected, setHandsDetected] = useState(false);
  const [result, setResult] = useState(null); // { accuracy, matched, missing, extra }
  const [difficulty, setDifficulty] = useState('all');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mpCameraRef = useRef(null);
  const handsRef = useRef(null);
  const stabilizerRef = useRef(new TemporalStabilizer(5));
  const detectedRef = useRef([]);

  useEffect(() => { return () => stopCamera(); }, []);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks?.length > 0) {
      setHandsDetected(true);
      const lm = results.multiHandLandmarks[0];

      ctx.strokeStyle = 'rgba(6,182,212,0.6)';
      ctx.lineWidth = 2;
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x*canvas.width, lm[a].y*canvas.height);
        ctx.lineTo(lm[b].x*canvas.width, lm[b].y*canvas.height);
        ctx.stroke();
      }
      lm.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x*canvas.width, pt.y*canvas.height, [4,8,12,16,20].includes(i) ? 5 : 3, 0, Math.PI*2);
        ctx.fillStyle = [4,8,12,16,20].includes(i) ? '#F59E0B' : '#38BDF8';
        ctx.fill();
      });

      const r = classifyISL(lm);
      const stable = stabilizerRef.current.update(r.sign, r.confidence, performance.now());

      if (stable.stable && stable.isNew && stable.sign !== 'BLANK' && stable.sign !== 'GESTURE_DETECTED') {
        setCurrentSign(stable.sign);
        if (!detectedRef.current.includes(stable.sign)) {
          detectedRef.current = [...detectedRef.current, stable.sign];
          setDetectedSigns([...detectedRef.current]);
        }
      }
    } else {
      setHandsDetected(false);
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraActive(true);

      if (window.Hands) {
        const hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
        hands.onResults(onResults);
        handsRef.current = hands;
        if (window.Camera) {
          const cam = new window.Camera(videoRef.current, {
            onFrame: async () => { if (handsRef.current && videoRef.current) await handsRef.current.send({ image: videoRef.current }); },
            width: 640, height: 480
          });
          cam.start();
          mpCameraRef.current = cam;
        }
      }
    } catch (e) { console.error(e); }
  };

  const stopCamera = () => {
    if (mpCameraRef.current) { try { mpCameraRef.current.stop(); } catch(e){} mpCameraRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const evaluate = () => {
    if (!selectedPractice) return;
    const target = selectedPractice.signs;
    const detected = detectedRef.current;
    const matched = target.filter(s => detected.includes(s));
    const missing = target.filter(s => !detected.includes(s));
    const extra = detected.filter(s => !target.includes(s));
    const accuracy = Math.round((matched.length / target.length) * 100);
    setResult({ accuracy, matched, missing, extra, passed: accuracy >= 60 });
  };

  const resetPractice = () => {
    detectedRef.current = [];
    setDetectedSigns([]);
    setCurrentSign('');
    setResult(null);
    stabilizerRef.current.reset();
  };

  const speakText = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const filteredPractices = difficulty === 'all'
    ? PRACTICE_SENTENCES
    : PRACTICE_SENTENCES.filter(p => p.difficulty === difficulty);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '16px' }}>

      {/* Header */}
      <div style={{
        marginBottom: '16px', padding: '14px 20px',
        background: 'linear-gradient(135deg, #0F1E36, #1E293B)',
        borderRadius: '14px', border: '1px solid rgba(139,92,246,0.15)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '3px 10px', borderRadius: '16px',
          background: 'rgba(139,92,246,0.15)', color: '#A78BFA',
          fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px'
        }}>
          <Target size={12} /> Practice Mode
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF', margin: 0 }}>
          ISL Practice & Evaluation
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Practice signing target sentences and get real-time accuracy feedback.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'start' }}>

        {/* LEFT: Sentence Selection */}
        <div>
          {/* Difficulty Filter */}
          <div style={{
            display: 'flex', gap: '6px', marginBottom: '12px'
          }}>
            {['all', 'easy', 'medium', 'hard'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                padding: '5px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                background: difficulty === d ? 'rgba(139,92,246,0.15)' : '#0F172A',
                color: difficulty === d ? '#A78BFA' : '#64748B',
                border: difficulty === d ? '1px solid #A78BFA' : '1px solid #1E293B',
                cursor: 'pointer', textTransform: 'capitalize'
              }}>
                {d}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            maxHeight: '500px', overflowY: 'auto'
          }}>
            {filteredPractices.map(p => (
              <div key={p.id} onClick={() => { setSelectedPractice(p); resetPractice(); }}
                style={{
                  padding: '14px', borderRadius: '10px', cursor: 'pointer',
                  background: selectedPractice?.id === p.id ? 'rgba(139,92,246,0.08)' : '#0B1120',
                  border: selectedPractice?.id === p.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid #1E293B',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '600',
                    background: p.difficulty === 'easy' ? 'rgba(16,185,129,0.1)' : p.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                    color: p.difficulty === 'easy' ? '#10B981' : p.difficulty === 'medium' ? '#F59E0B' : '#EF4444',
                    textTransform: 'uppercase'
                  }}>{p.difficulty}</span>
                  <button onClick={(e) => { e.stopPropagation(); speakText(p.english); }} style={{
                    background: 'none', border: 'none', color: '#64748B', cursor: 'pointer'
                  }}><Volume2 size={14} /></button>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: '600', color: '#E2E8F0' }}>
                  "{p.english}"
                </p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {p.signs.map((s, i) => (
                    <React.Fragment key={i}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem',
                        background: 'rgba(56,189,248,0.08)', color: '#38BDF8', fontWeight: '600'
                      }}>{s}</span>
                      {i < p.signs.length - 1 && <span style={{ color: '#334155', fontSize: '0.72rem', alignSelf: 'center' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Camera + Evaluation */}
        <div>
          {selectedPractice ? (
            <>
              {/* Target */}
              <div style={{
                padding: '14px 16px', borderRadius: '12px', marginBottom: '12px',
                background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#A78BFA', fontWeight: '600', marginBottom: '4px' }}>TARGET SENTENCE</div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#E2E8F0' }}>
                  "{selectedPractice.english}"
                </p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {selectedPractice.signs.map((s, i) => {
                    const matched = detectedSigns.includes(s);
                    return (
                      <span key={i} style={{
                        padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '700',
                        background: matched ? 'rgba(16,185,129,0.15)' : 'rgba(56,189,248,0.08)',
                        color: matched ? '#10B981' : '#64748B',
                        border: matched ? '1px solid #10B981' : '1px solid #1E293B'
                      }}>
                        {matched && <Check size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />}
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Camera */}
              <div style={{
                background: '#0B1120', borderRadius: '12px', padding: '10px',
                border: '1px solid #1E293B', marginBottom: '12px'
              }}>
                <div style={{
                  position: 'relative', width: '100%', aspectRatio: '4/3',
                  background: '#030712', borderRadius: '8px', overflow: 'hidden'
                }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{
                    position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
                    transform: 'scaleX(-1)', display: cameraActive ? 'block' : 'none'
                  }} />
                  <canvas ref={canvasRef} style={{
                    position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none',
                    transform: 'scaleX(-1)', zIndex: 10
                  }} />
                  {!cameraActive && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <button onClick={startCamera} style={{
                        padding: '10px 24px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                        color: '#FFF', fontWeight: '700', border: 'none', cursor: 'pointer'
                      }}>
                        <Camera size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Start Practice Camera
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {cameraActive ? (
                    <button onClick={stopCamera} style={practBtnStyle('#EF4444')}><Square size={14} /> Stop</button>
                  ) : (
                    <button onClick={startCamera} style={practBtnStyle('#8B5CF6')}><Play size={14} /> Start</button>
                  )}
                  <button onClick={evaluate} style={practBtnStyle('#10B981')}><Award size={14} /> Evaluate</button>
                  <button onClick={resetPractice} style={practBtnStyle('#334155')}><RotateCcw size={14} /> Reset</button>
                </div>
              </div>

              {/* Detected signs */}
              <div style={{
                padding: '12px', borderRadius: '10px',
                background: '#0B1120', border: '1px solid #1E293B', marginBottom: '12px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', marginBottom: '6px' }}>
                  YOUR DETECTED SIGNS ({detectedSigns.length})
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', minHeight: '30px' }}>
                  {detectedSigns.length === 0 ? (
                    <span style={{ color: '#334155', fontSize: '0.82rem' }}>Start signing in front of the camera...</span>
                  ) : (
                    detectedSigns.map((s, i) => (
                      <span key={i} style={{
                        padding: '4px 12px', borderRadius: '6px', fontSize: '0.82rem',
                        background: '#1E293B', color: '#F1F5F9', fontWeight: '700'
                      }}>{s}</span>
                    ))
                  )}
                </div>
              </div>

              {/* Result */}
              {result && (
                <div style={{
                  padding: '18px', borderRadius: '12px',
                  background: result.passed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${result.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: result.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: result.passed ? '#10B981' : '#EF4444'
                    }}>
                      {result.passed ? <Check size={28} /> : <X size={28} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '1.8rem', fontWeight: '900', color: result.passed ? '#10B981' : '#EF4444' }}>
                        {result.accuracy}%
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                        {result.passed ? 'Great job! You passed!' : 'Keep practicing!'}
                      </div>
                    </div>
                  </div>
                  {result.matched.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '600' }}>✓ Matched: </span>
                      <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{result.matched.join(', ')}</span>
                    </div>
                  )}
                  {result.missing.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: '600' }}>✗ Missing: </span>
                      <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{result.missing.join(', ')}</span>
                    </div>
                  )}
                  {result.extra.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: '600' }}>⚡ Extra: </span>
                      <span style={{ fontSize: '0.82rem', color: '#CBD5E1' }}>{result.extra.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{
              padding: '40px', textAlign: 'center', borderRadius: '14px',
              background: '#0B1120', border: '1px solid #1E293B'
            }}>
              <Target size={48} style={{ color: '#A78BFA', marginBottom: '14px' }} />
              <h3 style={{ color: '#E2E8F0', fontSize: '1.2rem', marginBottom: '8px' }}>Select a Practice Sentence</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Choose a sentence from the list to start practicing ISL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function practBtnStyle(bg) {
  return {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '7px 14px', borderRadius: '7px',
    background: bg, color: '#FFF', fontWeight: '600', fontSize: '0.82rem',
    border: 'none', cursor: 'pointer'
  };
}
