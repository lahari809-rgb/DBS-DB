import React, { useState } from 'react';
import { Layers, Database, Cpu, Eye, Radio, Server, Volume2, Shield } from 'lucide-react';

const ARCH_MODULES = {
  input: {
    id: "input",
    title: "1. Video & Vision Input",
    tech: "HTML5 MediaDevices / WebRTC / OpenCV VideoCapture",
    desc: "Captures user's sign language video feed in real-time at 60 FPS (720p HD). Features low-latency buffering and frame extraction.",
    co: "CO4 & CO6: Real-time Multimedia Ingestion & Observability"
  },
  preprocess: {
    id: "preprocess",
    title: "2. Preprocessing (OpenCV)",
    tech: "OpenCV (cv2) & Canvas Pixel Pipeline",
    desc: "Applies frame resizing, color conversion (BGR to RGB), min-max pixel normalization, and Gaussian noise filtering to optimize edge detection for the palm tracker.",
    co: "CO3 & CO5: Preprocessing micro-pipeline and data hygiene"
  },
  detection: {
    id: "detection",
    title: "3. Hand Detection & Landmarks (MediaPipe)",
    tech: "Google MediaPipe Hands ML Solution",
    desc: "Detects the palm bounding box and extracts 21 3D coordinates (x, y, z) corresponding to wrist, thumb, and finger joints with sub-pixel precision.",
    co: "CO3 & CO4: Landmark coordinate regression & ML inference"
  },
  features: {
    id: "features",
    title: "4. Feature Extraction",
    tech: "Geometric Vector Engine & NumPy",
    desc: "Transforms 21 raw coordinates into a 63-dimensional normalized feature vector: translation-invariant relative to wrist, scale-invariant relative to palm size, joint flexion angles, and 5-finger curl classifications.",
    co: "CO3: Vector transformations, feature engineering, and Pydantic validation"
  },
  model: {
    id: "model",
    title: "5. Sign Recognition (TensorFlow / Keras)",
    tech: "Deep Neural Network / Softmax Multi-Class Classifier",
    desc: "Evaluates the feature vector against the trained sign vocabulary with calibrated softmax confidence scores.",
    co: "CO3 & CO5: ML model inference serving via REST & WebSocket"
  },
  backend: {
    id: "backend",
    title: "Application Backend: FastAPI",
    tech: "Python 3.11, FastAPI, Uvicorn, Pydantic V2, Asynchronous I/O",
    desc: "Implements high-throughput REST and WebSocket endpoints following layered architecture (routers, services, repositories). Enforces Indian Standard Time (IST) on all timestamps.",
    co: "CO3: Backend API Engineering — FastAPI RESTful API Design & Layered Architecture"
  },
  database: {
    id: "database",
    title: "Database: MongoDB Document Engineering",
    tech: "MongoDB 6.0 / PyMongo / Motor / BSON",
    desc: "Maintains 4 primary collections: USERS, SIGNS, TRANSLATIONS, and TRANSLATION_HISTORY. All documents feature strict BSON schemas and IST timestamps.",
    co: "CO1 & CO2: Relational vs NoSQL Comparative Study & MongoDB Document Engineering"
  },
  output: {
    id: "output",
    title: "Assistive Speech & Text Output",
    tech: "Web Speech API (SpeechSynthesis) & Sentence Buffer",
    desc: "Synthesizes human speech from recognized sign tokens with custom pitch, rate, and animated waveform audio visualization.",
    co: "CO4: Multi-Framework Audio Output & Accessibility"
  }
};

export default function ArchitecturePage() {
  const [selectedKey, setSelectedKey] = useState('backend');
  const activeModule = ARCH_MODULES[selectedKey];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner */}
      <div style={{
        background: 'var(--dark-earth)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        color: '#F0F4F1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
            SIGN LANGUAGE TRANSLATOR &bull; SYSTEM ARCHITECTURE
          </h2>
          <p style={{ color: 'var(--dark-earth-muted)', fontSize: '13.5px', maxWidth: '720px' }}>
            Full-stack engineering architecture matching the pipeline diagram: Real-time MediaPipe Hand Detection, OpenCV preprocessing, FastAPI backend, and MongoDB document engineering in Indian Standard Time (IST).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="hud-pill">FastAPI 0.141</span>
          <span className="hud-pill">MongoDB Atlas</span>
          <span className="hud-pill">MediaPipe 21-LM</span>
          <span className="hud-pill" style={{ color: 'var(--accent-green)' }}>IST (UTC+5:30)</span>
        </div>
      </div>

      {/* Interactive Flow Diagram */}
      <div className="admin-card-container">
        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', color: 'var(--dark-earth)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Interactive Architecture Flow &bull; Click to Inspect
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {Object.entries(ARCH_MODULES).map(([key, item], idx) => (
            <div
              key={key}
              onClick={() => setSelectedKey(key)}
              style={{
                background: selectedKey === key ? 'var(--dark-earth)' : 'var(--bg-sage-subtle)',
                color: selectedKey === key ? '#F0F4F1' : 'var(--text-main)',
                border: `1px solid ${selectedKey === key ? 'var(--dark-earth)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.16s ease-in-out',
                boxShadow: selectedKey === key ? 'var(--shadow-md)' : 'none'
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: selectedKey === key ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                STAGE 0{idx + 1}
              </div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginTop: '4px' }}>{item.title}</div>
            </div>
          ))}
        </div>

        {/* Inspector Box */}
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--dark-earth)' }}>
                {activeModule.title}
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                {activeModule.tech}
              </span>
            </div>
            <span className="badge-user-role" style={{ fontSize: '12px', padding: '4px 10px' }}>
              {activeModule.co}
            </span>
          </div>
          <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.6' }}>
            {activeModule.desc}
          </p>
        </div>
      </div>

      {/* Syllabus Outcome Matrix */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', color: 'var(--dark-earth)', marginBottom: '16px' }}>
          Course Learning Outcomes Alignment (CO1 &ndash; CO6)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div className="kpi-card-box">
            <span className="badge-user-role" style={{ width: 'fit-content' }}>CO1: Relational DB Engineering</span>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>RDBMS & Normalization</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Three-schema architecture, relational constraints vs BSON document storage patterns.</p>
          </div>
          <div className="kpi-card-box">
            <span className="badge-user-role" style={{ width: 'fit-content' }}>CO2: Database Engineering</span>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>MongoDB Document Engineering</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>USERS, SIGNS, TRANSLATIONS, and TRANSLATION_HISTORY collections with aggregation pipelines in IST.</p>
          </div>
          <div className="kpi-card-box">
            <span className="badge-user-role" style={{ width: 'fit-content' }}>CO3: FastAPI Backend</span>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>Layered REST API</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Pydantic schemas, dependency injection, async endpoints, and route modularization.</p>
          </div>
          <div className="kpi-card-box">
            <span className="badge-user-role" style={{ width: 'fit-content' }}>CO4: Multi-Framework Real-Time</span>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>WebSockets & Speech Audio</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Real-time low-latency streaming and Web Speech API assistive speech synthesis.</p>
          </div>
          <div className="kpi-card-box">
            <span className="badge-user-role" style={{ width: 'fit-content' }}>CO5: Microservices Engineering</span>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>Service Boundaries</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Decoupled AI vision inference, database persistence, and admin telemetry.</p>
          </div>
          <div className="kpi-card-box">
            <span className="badge-user-role" style={{ width: 'fit-content' }}>CO6: Deployment & Observability</span>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>Docker & Observability</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Containerized packaging, health probes, latency profiling, and C4 architecture.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
