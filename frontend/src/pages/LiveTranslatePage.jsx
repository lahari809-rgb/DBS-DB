import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Play, Square, Trash2, AlertCircle, Volume2, VolumeX,
  Zap, UserCheck, Maximize2, Minimize2, Download, Copy, Bug,
  ChevronRight, Clock, Pause, RotateCcw, Mic, Sparkles
} from 'lucide-react';
import { classifyISL, TemporalStabilizer, extractFingerStates } from '../utils/islClassifier';
import { translateSignSequence, detectSentenceBoundary } from '../utils/translationEngine';

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],[0,17]
];

export default function LiveTranslatePage() {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const [handsDetected, setHandsDetected] = useState(false);
  const [fps, setFps] = useState(0);
  const [currentSign, setCurrentSign] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [fingerStates, setFingerStates] = useState(null);
  const [debugData, setDebugData] = useState({});

  // Continuous sequence & translation
  const [signSequence, setSignSequence] = useState([]);
  const [liveTranslation, setLiveTranslation] = useState('');
  const [translationConfidence, setTranslationConfidence] = useState(0);
  const [sentences, setSentences] = useState([]); // Completed sentences
  const [isTranslating, setIsTranslating] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mpCameraRef = useRef(null);
  const handsRef = useRef(null);
  const stabilizerRef = useRef(new TemporalStabilizer(5, 30));
  const lastSignTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsTimeRef = useRef(performance.now());
  const sequenceRef = useRef([]);
  const sentencePauseTimerRef = useRef(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Update translation whenever sequence changes
  useEffect(() => {
    if (signSequence.length > 0) {
      const result = translateSignSequence(signSequence);
      setLiveTranslation(result.translation);
      setTranslationConfidence(result.confidence);
    } else {
      setLiveTranslation('');
      setTranslationConfidence(0);
    }
  }, [signSequence]);

  const completeSentence = useCallback(() => {
    if (sequenceRef.current.length >= 1) {
      const result = translateSignSequence(sequenceRef.current);
      if (result.translation) {
        const newSentence = {
          id: Date.now(),
          signs: [...sequenceRef.current],
          translation: result.translation,
          confidence: result.confidence,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setSentences(prev => [newSentence, ...prev]);

        // Auto-speak if enabled
        if (autoSpeak && result.translation) {
          const utterance = new SpeechSynthesisUtterance(result.translation);
          utterance.lang = 'en-IN';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
    sequenceRef.current = [];
    setSignSequence([]);
    setLiveTranslation('');
  }, [autoSpeak]);

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FPS
    frameCountRef.current++;
    const now = performance.now();
    if (now - fpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      fpsTimeRef.current = now;
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandsDetected(true);
      const lm = results.multiHandLandmarks[0];

      // Draw skeleton
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(6,182,212,0.7)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
        ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Draw joints
      lm.forEach((pt, i) => {
        const isTip = [4,8,12,16,20].includes(i);
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, isTip ? 6 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? '#F59E0B' : i === 0 ? '#EF4444' : '#38BDF8';
        ctx.fill();
        if (isTip) { ctx.strokeStyle = '#FFF'; ctx.lineWidth = 1.5; ctx.stroke(); }
      });

      // Classify
      const result = classifyISL(lm);
      setDebugData(result.fingers || {});

      // Extract finger states for HUD
      const fs = extractFingerStates(lm);
      if (fs) {
        setFingerStates({
          thumb: fs.thumb ? 'OPEN' : 'CLOSED',
          index: fs.index ? 'OPEN' : 'CLOSED',
          middle: fs.middle ? 'OPEN' : 'CLOSED',
          ring: fs.ring ? 'OPEN' : 'CLOSED',
          pinky: fs.pinky ? 'OPEN' : 'CLOSED'
        });
      }

      // Temporal stabilization
      const stable = stabilizerRef.current.update(result.sign, result.confidence, now);

      if (stable.stable && stable.sign !== 'BLANK' && stable.sign !== 'GESTURE_DETECTED') {
        setCurrentSign(stable.sign);
        setConfidence(stable.confidence);
        setIsTranslating(true);

        if (stable.isNew) {
          lastSignTimeRef.current = now;
          sequenceRef.current = [...sequenceRef.current, stable.sign];
          setSignSequence([...sequenceRef.current]);

          // Reset sentence pause timer
          if (sentencePauseTimerRef.current) clearTimeout(sentencePauseTimerRef.current);
          sentencePauseTimerRef.current = setTimeout(() => {
            completeSentence();
            setIsTranslating(false);
          }, 3000); // 3 second pause = sentence complete
        }
      } else if (stable.sign === 'BLANK') {
        setCurrentSign('');
        setConfidence(0);
      }

      // Draw sign label on canvas
      if (stable.sign && stable.sign !== 'BLANK') {
        ctx.save();
        ctx.scale(-1, 1);
        const label = stable.sign;
        ctx.font = 'bold 24px "Outfit", sans-serif';
        const textW = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.roundRect(-canvas.width, 8, textW + 28, 40, 8);
        ctx.fill();
        ctx.fillStyle = stable.confidence > 0.85 ? '#10B981' : '#F59E0B';
        ctx.fillText(label, -canvas.width + 14, 36);
        ctx.restore();
      }
    } else {
      setHandsDetected(false);
      setFingerStates(null);
    }

    ctx.restore();
  }, [completeSentence]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      stabilizerRef.current.reset();

      if (window.Hands) {
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
        hands.onResults(onResults);
        handsRef.current = hands;

        if (window.Camera) {
          const cam = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) await handsRef.current.send({ image: videoRef.current });
            },
            width: 1280, height: 720
          });
          cam.start();
          mpCameraRef.current = cam;
        }
      } else {
        setCameraError('MediaPipe not loaded. Check internet connection and refresh.');
      }
    } catch (err) {
      setCameraError('Cannot access webcam. Please allow camera permissions.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mpCameraRef.current) { try { mpCameraRef.current.stop(); } catch(e) {} mpCameraRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) { const c = canvasRef.current.getContext('2d'); c.clearRect(0,0,canvasRef.current.width,canvasRef.current.height); }
    setCameraActive(false);
    setHandsDetected(false);
    setFps(0);
    if (sentencePauseTimerRef.current) clearTimeout(sentencePauseTimerRef.current);
  };

  const speakText = (text) => {
    if (text) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN'; u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const clearAll = () => {
    sequenceRef.current = [];
    setSignSequence([]);
    setLiveTranslation('');
    setSentences([]);
    setCurrentSign('');
    stabilizerRef.current.reset();
  };

  const copyHistory = () => {
    const text = sentences.map(s => `[${s.timestamp}] ${s.translation}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const downloadHistory = () => {
    const text = sentences.map(s =>
      `[${s.timestamp}]\nSigns: ${s.signs.join(' → ')}\nTranslation: ${s.translation}\nConfidence: ${(s.confidence*100).toFixed(0)}%\n`
    ).join('\n---\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `isl_translation_${Date.now()}.txt`;
    a.click();
  };

  const confColor = confidence >= 0.90 ? '#10B981' : confidence >= 0.75 ? '#F59E0B' : '#EF4444';

  return (
    <div style={{ maxWidth: fullscreen ? '100%' : '1500px', margin: '0 auto', padding: '16px' }}>

      {/* Header */}
      <div style={{
        marginBottom: '16px', padding: '14px 20px',
        background: 'linear-gradient(135deg, #0F1E36, #1E293B)',
        borderRadius: '14px', border: '1px solid rgba(56,189,248,0.12)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', borderRadius: '16px',
            background: 'rgba(37,99,235,0.15)', color: '#60A5FA',
            fontSize: '0.75rem', fontWeight: '600', marginBottom: '6px'
          }}>
            <Zap size={12} /> Continuous Translation Mode
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#FFF', margin: 0 }}>
            Live ISL Translation
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cameraActive ? (
            <button onClick={stopCamera} style={btnStyle('#EF4444', '#FFF')}>
              <Square size={15} /> Stop
            </button>
          ) : (
            <button onClick={startCamera} style={btnStyle('linear-gradient(135deg,#2563EB,#3B82F6)', '#FFF')}>
              <Play size={16} /> Start Camera
            </button>
          )}
          <button onClick={() => setAutoSpeak(!autoSpeak)} style={{
            ...btnStyle(autoSpeak ? 'rgba(16,185,129,0.15)' : '#1E293B', autoSpeak ? '#10B981' : '#94A3B8'),
            border: autoSpeak ? '1px solid #10B981' : '1px solid #334155'
          }}>
            {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />} Auto-Speak
          </button>
          <button onClick={() => setShowDebug(!showDebug)} style={{
            ...btnStyle(showDebug ? 'rgba(245,158,11,0.15)' : '#1E293B', showDebug ? '#F59E0B' : '#64748B'),
            border: showDebug ? '1px solid #F59E0B' : '1px solid #334155'
          }}>
            <Bug size={15} />
          </button>
          <button onClick={clearAll} style={btnStyle('#334155', '#E2E8F0')}>
            <Trash2 size={15} /> Clear
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: fullscreen ? '1fr' : '1.3fr 1fr',
        gap: '16px', alignItems: 'start'
      }}>

        {/* ── LEFT: CAMERA ── */}
        <div>
          <div style={{
            background: '#0B1120', borderRadius: '14px', padding: '12px',
            border: '1px solid #1E293B'
          }}>
            {/* Status bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '6px 10px', background: '#0F172A', borderRadius: '8px',
              marginBottom: '10px', fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: cameraActive ? '#10B981' : '#475569',
                  boxShadow: cameraActive ? '0 0 8px #10B981' : 'none'
                }} />
                <span style={{ color: '#CBD5E1' }}>{cameraActive ? 'HD Stream' : 'Standby'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: handsDetected ? '#10B981' : '#475569' }}>
                  <UserCheck size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                  {handsDetected ? 'Hand Locked' : 'Searching'}
                </span>
                <span style={{
                  background: '#1E293B', padding: '1px 7px', borderRadius: '4px',
                  color: '#38BDF8', fontWeight: '700', fontFamily: 'monospace', fontSize: '0.75rem'
                }}>{fps} FPS</span>
                <button onClick={() => setFullscreen(!fullscreen)} style={{
                  background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0'
                }}>
                  {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>

            {/* Video viewport */}
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '16/9',
              minHeight: fullscreen ? '550px' : '380px',
              background: '#030712', borderRadius: '10px', overflow: 'hidden',
              border: '1px solid #1E293B'
            }}>
              <video ref={videoRef} autoPlay playsInline muted style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'cover', transform: 'scaleX(-1)',
                display: cameraActive ? 'block' : 'none'
              }} />
              <canvas ref={canvasRef} style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none', transform: 'scaleX(-1)', zIndex: 10
              }} />

              {!cameraActive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '30px' }}>
                  <div style={{
                    width: '70px', height: '70px', borderRadius: '50%',
                    background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#38BDF8', marginBottom: '14px'
                  }}>
                    <Camera size={36} />
                  </div>
                  <h3 style={{ color: '#FFF', fontSize: '1.15rem', marginBottom: '6px' }}>Camera Ready</h3>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', textAlign: 'center', maxWidth: '340px', marginBottom: '18px' }}>
                    Start the camera and sign continuously. The AI will detect signs and translate them into English sentences.
                  </p>
                  <button onClick={startCamera} style={{
                    padding: '10px 28px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    color: '#FFF', fontWeight: '700', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(37,99,235,0.4)'
                  }}>
                    <Play size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Start Camera
                  </button>
                </div>
              )}

              {/* Confidence bar overlay */}
              {cameraActive && handsDetected && (
                <div style={{
                  position: 'absolute', bottom: '10px', left: '10px', right: '10px', zIndex: 15,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${confidence * 100}%`, height: '100%', borderRadius: '3px',
                      background: confColor, transition: 'width 0.3s'
                    }} />
                  </div>
                  <span style={{ color: confColor, fontWeight: '700', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {(confidence*100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {cameraError && (
              <div style={{
                marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={16} /> {cameraError}
              </div>
            )}

            {/* Finger HUD */}
            {fingerStates && (
              <div style={{
                marginTop: '10px', padding: '8px 10px', background: '#090E17',
                borderRadius: '8px', border: '1px solid #1E293B'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                  {Object.entries(fingerStates).map(([f, s]) => (
                    <div key={f} style={{
                      padding: '5px', borderRadius: '5px', textAlign: 'center',
                      background: s === 'OPEN' ? 'rgba(16,185,129,0.1)' : '#0F172A',
                      border: s === 'OPEN' ? '1px solid rgba(16,185,129,0.3)' : '1px solid #1E293B'
                    }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', textTransform: 'uppercase' }}>{f}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: s === 'OPEN' ? '#10B981' : '#EF4444' }}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug */}
            {showDebug && Object.keys(debugData).length > 0 && (
              <div style={{
                marginTop: '8px', padding: '8px 10px', background: '#0C0F1A',
                borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)',
                fontFamily: 'monospace', fontSize: '0.68rem', color: '#F59E0B'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '2px' }}>
                  {Object.entries(debugData).filter(([k]) => !k.startsWith('_')).slice(0, 20).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>{k}:</span>
                      <span style={{ color: typeof v === 'boolean' ? (v ? '#10B981' : '#EF4444') : '#F59E0B' }}>
                        {typeof v === 'boolean' ? (v ? '✓' : '✗') : typeof v === 'number' ? v.toFixed(2) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: TRANSLATION PANEL ── */}
        {!fullscreen && (
          <div>
            {/* Live Sign Sequence */}
            <div style={{
              background: '#0B1120', borderRadius: '14px', padding: '18px',
              border: '1px solid #1E293B', marginBottom: '14px'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px'
              }}>
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: isTranslating ? '#F59E0B' : '#38BDF8',
                  boxShadow: isTranslating ? '0 0 8px #F59E0B' : '0 0 6px #38BDF8'
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.5px' }}>
                  {isTranslating ? 'TRANSLATING...' : 'CURRENT SIGN'}
                </span>
              </div>

              {/* Current detected sign */}
              <div style={{
                padding: '24px', textAlign: 'center',
                background: 'linear-gradient(180deg, #0F172A, #0B1120)',
                borderRadius: '12px', border: '1px solid #1E293B', marginBottom: '16px'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: '600', letterSpacing: '1.5px', marginBottom: '6px' }}>
                  DETECTED ISL SIGN
                </div>
                <h2 style={{
                  fontSize: currentSign.length > 8 ? '2.4rem' : '3.2rem',
                  fontWeight: '900', margin: '4px 0',
                  color: !currentSign ? '#334155' : '#38BDF8',
                  textShadow: currentSign ? '0 0 24px rgba(56,189,248,0.25)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {currentSign || 'WAITING...'}
                </h2>
                {confidence > 0 && (
                  <span style={{
                    display: 'inline-block', padding: '3px 12px', borderRadius: '12px',
                    background: `${confColor}15`, color: confColor,
                    fontSize: '0.78rem', fontWeight: '700', fontFamily: 'monospace'
                  }}>
                    {(confidence * 100).toFixed(0)}% confidence
                  </span>
                )}
              </div>

              {/* Sign sequence */}
              {signSequence.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    SIGN SEQUENCE
                  </div>
                  <div style={{
                    display: 'flex', gap: '6px', flexWrap: 'wrap',
                    padding: '10px', background: '#090E17', borderRadius: '8px', border: '1px solid #1E293B'
                  }}>
                    {signSequence.map((s, i) => (
                      <React.Fragment key={i}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '6px',
                          background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                          color: '#38BDF8', fontWeight: '700', fontSize: '0.82rem'
                        }}>{s}</span>
                        {i < signSequence.length - 1 && (
                          <ChevronRight size={14} style={{ color: '#334155', alignSelf: 'center' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Live translation */}
              {liveTranslation && (
                <div style={{
                  padding: '14px 16px', borderRadius: '10px',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)'
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '600', letterSpacing: '0.5px' }}>
                      ENGLISH TRANSLATION
                    </span>
                    <span style={{
                      fontSize: '0.72rem', color: '#10B981', fontWeight: '700', fontFamily: 'monospace'
                    }}>
                      {(translationConfidence*100).toFixed(0)}%
                    </span>
                  </div>
                  <p style={{
                    margin: 0, fontSize: '1.1rem', fontWeight: '600',
                    color: '#10B981', lineHeight: '1.5'
                  }}>
                    "{liveTranslation}"
                  </p>
                  <button onClick={() => speakText(liveTranslation)} style={{
                    marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 12px', borderRadius: '8px',
                    background: 'rgba(16,185,129,0.1)', color: '#10B981',
                    border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: '600'
                  }}>
                    <Volume2 size={13} /> Speak
                  </button>
                </div>
              )}

              {!currentSign && signSequence.length === 0 && (
                <div style={{
                  padding: '20px', textAlign: 'center', borderRadius: '10px',
                  background: '#090E17', border: '1px solid #1E293B'
                }}>
                  <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>
                    {cameraActive
                      ? 'Show ISL signs in front of the camera. Signs will appear here as they are recognized.'
                      : 'Start the camera to begin continuous ISL translation.'}
                  </p>
                </div>
              )}
            </div>

            {/* ── TRANSLATION HISTORY ── */}
            <div style={{
              background: '#0B1120', borderRadius: '14px', padding: '18px',
              border: '1px solid #1E293B'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#94A3B8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#E2E8F0' }}>
                    Translation History ({sentences.length})
                  </span>
                </div>
                {sentences.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={copyHistory} style={smallBtnStyle}>
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={downloadHistory} style={smallBtnStyle}>
                      <Download size={12} /> Download
                    </button>
                  </div>
                )}
              </div>

              <div style={{
                maxHeight: '260px', overflowY: 'auto', display: 'flex',
                flexDirection: 'column', gap: '8px'
              }}>
                {sentences.length === 0 ? (
                  <div style={{
                    padding: '20px', textAlign: 'center', borderRadius: '8px',
                    background: '#090E17', border: '1px solid #1E293B'
                  }}>
                    <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>
                      Completed sentences will appear here. Sign continuously — pause for 3 seconds to complete a sentence.
                    </p>
                  </div>
                ) : (
                  sentences.map(s => (
                    <div key={s.id} style={{
                      padding: '12px 14px', borderRadius: '10px',
                      background: '#0F172A', border: '1px solid #1E293B'
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'
                      }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                          {s.timestamp}
                        </span>
                        <span style={{
                          fontSize: '0.7rem', color: '#10B981', fontWeight: '600', fontFamily: 'monospace'
                        }}>
                          {(s.confidence*100).toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px'
                      }}>
                        {s.signs.map((sign, i) => (
                          <React.Fragment key={i}>
                            <span style={{
                              fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px',
                              background: 'rgba(56,189,248,0.08)', color: '#38BDF8', fontWeight: '600'
                            }}>{sign}</span>
                            {i < s.signs.length - 1 && (
                              <span style={{ color: '#334155', fontSize: '0.72rem', alignSelf: 'center' }}>→</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: '#E2E8F0' }}>
                          "{s.translation}"
                        </p>
                        <button onClick={() => speakText(s.translation)} style={{
                          background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px'
                        }}>
                          <Volume2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── STYLE HELPERS ──
function btnStyle(bg, color) {
  return {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '8px',
    background: bg, color, fontWeight: '600', fontSize: '0.85rem',
    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
  };
}

const smallBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '4px',
  padding: '4px 10px', borderRadius: '6px',
  background: '#1E293B', color: '#94A3B8', fontSize: '0.72rem',
  fontWeight: '600', border: '1px solid #334155', cursor: 'pointer'
};
