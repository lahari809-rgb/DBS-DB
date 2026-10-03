import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function PipelineStepper({ activeStage = 3, latencyMs = 26.2 }) {
  const stages = [
    { num: 1, name: "Frame Capture", tech: "Webcam 60fps" },
    { num: 2, name: "Preprocessing", tech: "OpenCV (cv2)" },
    { num: 3, name: "Hand Detection", tech: "MediaPipe 21 pts" },
    { num: 4, name: "Feature Extraction", tech: "63-D Vector" },
    { num: 5, name: "Sign Recognition", tech: "ML / DL Model" }
  ];

  return (
    <section className="pipeline-stepper-box">
      <div className="pipeline-info-header">
        <h2>AI / Recognition Pipeline</h2>
        <span>Latency: <strong style={{ color: 'var(--accent-green)' }}>~{latencyMs.toFixed(1)} ms</strong> &bull; Indian Standard Time (IST)</span>
      </div>

      <div className="pipeline-nodes-track">
        {stages.map((st, index) => (
          <React.Fragment key={st.num}>
            <div className={`pipeline-node ${activeStage >= st.num ? 'active' : ''}`}>
              <div className="stage-num-badge">{st.num}</div>
              <div className="stage-text-group">
                <span className="stage-name-label">{st.name}</span>
                <span className="stage-tech-label">{st.tech}</span>
              </div>
            </div>
            {index < stages.length - 1 && (
              <ChevronRight size={16} style={{ color: 'var(--text-dim)' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
