import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatIST } from '../utils/time';
import AudioWaveform from '../components/AudioWaveform';
import { Camera, Play, Square, Upload, Volume2, Plus, Delete, Copy, Megaphone, Sparkles } from 'lucide-react';

const PRESET_GESTURES = {
  hello: generateHandPose([1, 1, 1, 1, 1], "HELLO"),
  ily: generateHandPose([1, 1, 0, 0, 1], "I LOVE YOU"),
  peace: generateHandPose([0, 1, 1, 0, 0], "PEACE"),
  thumbsup: generateHandPose([1, 0, 0, 0, 0], "THUMBS UP", true),
  thumbsdown: generateHandPose([1, 0, 0, 0, 0], "THUMBS DOWN", false, true),
  yes: generateHandPose([0, 0, 0, 0, 0], "YES"),
  okay: generateHandPose([1, 0, 1, 1, 1], "OKAY"),
  rockon: generateHandPose([0, 1, 0, 0, 1], "ROCK ON")
};

function generateHandPose(fingerStates, label, isUp = false, isDown = false) {
  const lm = [];
  lm.push({ x: 0.5, y: isDown ? 0.4 : 0.75, z: 0.0 });
  const bases = [
    { x: 0.42, y: isDown ? 0.45 : 0.65 },
    { x: 0.38, y: isDown ? 0.48 : 0.58 },
    { x: 0.35, y: isDown ? 0.51 : 0.53 },
    { x: isUp ? 0.38 : (isDown ? 0.38 : 0.32), y: isUp ? 0.42 : (isDown ? 0.68 : 0.50), z: -0.02 },
    { x: 0.45, y: 0.55 }, { x: 0.45, y: 0.48 }, { x: 0.45, y: 0.42 }, { x: 0.45, y: fingerStates[1] ? 0.35 : 0.52 },
    { x: 0.50, y: 0.53 }, { x: 0.50, y: 0.46 }, { x: 0.50, y: 0.40 }, { x: 0.50, y: fingerStates[2] ? 0.32 : 0.51 },
    { x: 0.55, y: 0.55 }, { x: 0.55, y: 0.48 }, { x: 0.55, y: 0.42 }, { x: 0.55, y: fingerStates[3] ? 0.36 : 0.53 },
    { x: 0.60, y: 0.58 }, { x: 0.60, y: 0.52 }, { x: 0.60, y: 0.47 }, { x: 0.60, y: fingerStates[4] ? 0.40 : 0.56 }
  ];
  bases.forEach(b => lm.push({ x: b.x, y: b.y, z: b.z || 0.0 }));
  return lm;
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
];

export default function TranslatorPage({ onPipelineUpdate }) {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [fps, setFps] = useState(0);

  // Recognition state
  const [recognizedSign, setRecognizedSign] = useState("READY");
  const [confidence, setConfidence] = useState(0.96);
  const [speechText, setSpeechText] = useState("System ready. Sign in front of camera or test presets.");
  const [lastIstTimestamp, setLastIstTimestamp] = useState(new Date().toISOString());
  const [fingerStates, setFingerStates] = useState({
    thumb: "EXTENDED", index: "EXTENDED", middle: "EXTENDED", ring: "EXTENDED", pinky: "EXTENDED"
  });

  // Sentence buffer
  const [sentence, setSentence] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  // Start Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      onPipelineUpdate?.(1);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Camera access was not granted. You can use the Preset Gesture Simulator below!");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraActive(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    onPipelineUpdate?.(1);
  };

  // Draw Skeleton on Canvas
  const drawHandSkeleton = (landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      ctx.strokeStyle = '#16A34A';
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.stroke();
    });

    landmarks.forEach((p, idx) => {
      ctx.fillStyle = idx % 4 === 0 ? '#4ADE80' : '#FFFFFF';
      ctx.shadowColor = '#16A34A';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 4.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.restore();
  };

  // Send landmarks to backend
  const classifyLandmarks = async (landmarks, gestureLabel = null) => {
    onPipelineUpdate?.(4);
    try {
      const res = await fetch('/api/recognition/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarks: landmarks.map(p => ({ x: p.x, y: p.y, z: p.z || 0.0 })),
          userId: user?._id || "650c82f91a2b3c4d5e6f7081",
          saveHistory: true,
          method: 'live'
        })
      });

      if (res.ok) {
        const data = await res.json();
        onPipelineUpdate?.(5);
        setRecognizedSign(data.sign);
        setConfidence(data.confidence);
        setSpeechText(data.speechText || data.sign);
        setLastIstTimestamp(data.timestamp);
        if (data.fingerStates) setFingerStates(data.fingerStates);

        // Auto speak if recognized
        if (data.sign !== "UNKNOWN") {
          speak(data.speechText || data.sign);
        }
      }
    } catch (err) {
      console.error("Inference request failed", err);
    }
  };

  // Test Preset Gesture
  const handleTestPreset = (presetKey) => {
    const landmarks = PRESET_GESTURES[presetKey];
    if (!landmarks) return;
    drawHandSkeleton(landmarks);
    classifyLandmarks(landmarks, presetKey);
  };

  // Speak with Web Speech API
  const speak = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/recognition/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setRecognizedSign(data.sign);
        setConfidence(data.confidence);
        setSpeechText(data.speechText);
        setLastIstTimestamp(data.timestamp);
        speak(data.speechText || data.sign);
      }
    } catch (err) {
      alert("File recognition error");
    }
  };

  return (
    <div className="workstation-grid">
      {/* Left Column: Video Frame in Dark Forest Earth (#2E3B32) */}
      <section className="camera-frame-card">
        <div className="camera-card-header">
          <h3>
            <Camera size={18} style={{ color: 'var(--accent-green)' }} />
            Vision Input &amp; Hand Detection (16:9)
          </h3>
          <div className="camera-badge-tag">MediaPipe 21-LM Active</div>
        </div>

        {/* 16:9 Video Viewport */}
        <div className="video-viewport-box">
          <video ref={videoRef} className="video-element" playsInline autoPlay muted />
          <canvas ref={canvasRef} className="canvas-overlay" />

          {!cameraActive && (
            <div className="video-idle-overlay">
              <Camera size={46} className="video-idle-icon" />
              <h4>Webcam Offline</h4>
              <p>Start your camera for live sign tracking, or test with the preset gestures below.</p>
              <button className="btn btn-primary" onClick={startCamera}>
                <Play size={16} /> Start Camera Feed
              </button>
            </div>
          )}

          <div className="viewport-corner-hud">
            <div className="hud-pill">PIPELINE: READY</div>
            <div className="hud-pill">ZONE: IST (UTC+05:30)</div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {cameraActive ? (
            <button className="btn btn-danger" onClick={stopCamera}>
              <Square size={16} /> Stop Camera
            </button>
          ) : (
            <button className="btn btn-primary" onClick={startCamera}>
              <Play size={16} /> Start Camera
            </button>
          )}

          <label className="btn btn-dark" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Upload Video / Image
            <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>

        {/* Gesture Simulator Tray */}
        <div className="simulator-tray">
          <div className="simulator-header">
            <span>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--accent-green)' }} />
              Gesture Simulator (Instant 21-D Testing)
            </span>
            <span>Sends 63-D features to FastAPI in IST</span>
          </div>

          <div className="simulator-pills-row">
            <button className="sim-pill" onClick={() => handleTestPreset('hello')}>👋 Wave Hello</button>
            <button className="sim-pill" onClick={() => handleTestPreset('thumbsup')}>👍 Thumbs Up</button>
            <button className="sim-pill" onClick={() => handleTestPreset('thumbsdown')}>👎 Thumbs Down</button>
            <button className="sim-pill" onClick={() => handleTestPreset('peace')}>✌️ Peace / Two</button>
            <button className="sim-pill" onClick={() => handleTestPreset('ily')}>🤟 I Love You</button>
            <button className="sim-pill" onClick={() => handleTestPreset('yes')}>✊ Yes (Fist)</button>
            <button className="sim-pill" onClick={() => handleTestPreset('okay')}>👌 Okay</button>
            <button className="sim-pill" onClick={() => handleTestPreset('rockon')}>🤘 Rock On</button>
          </div>
        </div>
      </section>

      {/* Right Column: Output & Sentence Builder */}
      <section className="output-column">
        {/* Hero Card */}
        <div className="recognition-hero-card">
          <div className="hero-meta-bar">
            <span className="hero-tag">OUTPUT &bull; RECOGNIZED SIGN</span>
            <div className="live-ist-tag">
              <div className="pulse-dot-green"></div>
              <span>Live IST Inference</span>
            </div>
          </div>

          <div className="sign-title-row">
            <div className="hero-sign-value">{recognizedSign}</div>
            <div className="confidence-indicator-chip">{Math.round(confidence * 100)}%</div>
          </div>

          <div className="confidence-meter-track">
            <div className="confidence-meter-fill" style={{ width: `${Math.round(confidence * 100)}%` }}></div>
          </div>

          {/* Speech Synthesis Bar */}
          <div className="speech-output-box">
            <div className="speech-text-bubble">
              <Volume2 size={18} style={{ color: 'var(--accent-green)' }} />
              <span>"{speechText}"</span>
            </div>
            <button
              className="speech-speak-btn"
              onClick={() => speak(speechText)}
              title="Speak with Web Speech API"
            >
              <Play size={16} />
            </button>
          </div>

          {/* IST Timestamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span>Logged to MongoDB:</span>
            <span style={{ color: 'var(--dark-earth)', fontWeight: 600 }}>{formatIST(lastIstTimestamp)}</span>
          </div>

          {/* Finger Diagnostic Chips */}
          <div className="finger-chips-grid">
            {Object.entries(fingerStates).map(([finger, status]) => (
              <div key={finger} className={`finger-status-box ${status === 'EXTENDED' ? 'extended' : ''}`}>
                <span className="finger-status-name">{finger}</span>
                <span className="finger-status-val">{status === 'EXTENDED' ? 'OPEN' : 'CURL'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentence Builder Buffer */}
        <div className="sentence-card">
          <div className="sentence-card-top">
            <h3><Volume2 size={16} style={{ color: 'var(--accent-green)' }} /> Sentence Builder (Text Output)</h3>
            <AudioWaveform isSpeaking={isSpeaking} />
          </div>

          <div className="sentence-display-screen">
            {sentence.length === 0 ? (
              <span className="sentence-placeholder">Accumulated signs will appear here...</span>
            ) : (
              sentence.join(' ')
            )}
          </div>

          <div className="sentence-actions-bar">
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => recognizedSign !== 'READY' && setSentence([...sentence, recognizedSign])}
              >
                <Plus size={14} /> Add Sign
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSentence([...sentence, ' '])}
              >
                Space
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSentence(sentence.slice(0, -1))}
              >
                <Delete size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(sentence.join(' '));
                  alert('Copied to clipboard!');
                }}
              >
                <Copy size={14} /> Copy
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => speak(sentence.join(' '))}
              >
                <Megaphone size={14} /> Speak All
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setSentence([])}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
