import React, { useState, useEffect, useRef, useCallback } from 'react';
import { COMPREHENSIVE_SIGNS, ISL_VOCABULARY_CATEGORIES } from '../data/signsData';
import {
  Camera,
  Play,
  Square,
  Trash2,
  AlertCircle,
  Sparkles,
  Zap,
  Activity,
  Check,
  UserCheck,
  Layers,
  HelpCircle,
  Maximize2,
  Minimize2,
  Info,
  Volume2,
  Bug
} from 'lucide-react';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]
];

// ── UTILITY MATH ──────────────────────────────────────────────
function dist3D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function angleBetween(a, b, c) {
  // Angle at point b formed by a-b-c (in degrees)
  const ba = { x: a.x - b.x, y: a.y - b.y, z: (a.z||0) - (b.z||0) };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: (c.z||0) - (b.z||0) };
  const dot = ba.x*bc.x + ba.y*bc.y + ba.z*bc.z;
  const magBA = Math.sqrt(ba.x**2 + ba.y**2 + ba.z**2);
  const magBC = Math.sqrt(bc.x**2 + bc.y**2 + bc.z**2);
  if (magBA * magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

// ── ISL 56-CLASS CLASSIFIER ──────────────────────────────────
function classifyISLSign(lm) {
  if (!lm || lm.length < 21) return { sign: 'BLANK', confidence: 0, debug: {} };

  // Landmark aliases
  const wrist = lm[0];
  const thumbCmc = lm[1], thumbMcp = lm[2], thumbIp = lm[3], thumbTip = lm[4];
  const indexMcp = lm[5], indexPip = lm[6], indexDip = lm[7], indexTip = lm[8];
  const middleMcp = lm[9], middlePip = lm[10], middleDip = lm[11], middleTip = lm[12];
  const ringMcp = lm[13], ringPip = lm[14], ringDip = lm[15], ringTip = lm[16];
  const pinkyMcp = lm[17], pinkyPip = lm[18], pinkyDip = lm[19], pinkyTip = lm[20];

  // Hand scale (wrist to middle MCP) for normalizing distances
  const handScale = Math.max(dist3D(wrist, middleMcp), 0.001);

  // ── FINGER CURL ANGLES (at PIP joint) ──
  // Lower angle = more curled/bent; higher angle = more extended/straight
  const indexAngle = angleBetween(indexMcp, indexPip, indexTip);
  const middleAngle = angleBetween(middleMcp, middlePip, middleTip);
  const ringAngle = angleBetween(ringMcp, ringPip, ringTip);
  const pinkyAngle = angleBetween(pinkyMcp, pinkyPip, pinkyTip);

  // Thumb: use IP joint angle (CMC-MCP-TIP)
  const thumbAngle = angleBetween(thumbCmc, thumbMcp, thumbTip);

  // ── FINGER EXTENDED STATE ──
  // Using BOTH angle-based AND distance-based for robustness
  const EXTEND_ANGLE = 140; // Threshold: above this = extended
  const CURL_ANGLE = 100;   // Below this = definitely curled

  const indexExtDist = dist3D(indexTip, wrist) > dist3D(indexPip, wrist);
  const middleExtDist = dist3D(middleTip, wrist) > dist3D(middlePip, wrist);
  const ringExtDist = dist3D(ringTip, wrist) > dist3D(ringPip, wrist);
  const pinkyExtDist = dist3D(pinkyTip, wrist) > dist3D(pinkyPip, wrist);

  // Hybrid: consider extended if EITHER angle is high OR distance says extended
  const indexExt = indexAngle > EXTEND_ANGLE || (indexAngle > CURL_ANGLE && indexExtDist);
  const middleExt = middleAngle > EXTEND_ANGLE || (middleAngle > CURL_ANGLE && middleExtDist);
  const ringExt = ringAngle > EXTEND_ANGLE || (ringAngle > CURL_ANGLE && ringExtDist);
  const pinkyExt = pinkyAngle > EXTEND_ANGLE || (pinkyAngle > CURL_ANGLE && pinkyExtDist);

  // Thumb: uses lateral movement relative to palm
  const thumbExtDist = dist3D(thumbTip, pinkyMcp) > dist3D(thumbMcp, pinkyMcp) * 1.1;
  const thumbExt = thumbAngle > 130 || thumbExtDist;

  // ── PINCH DISTANCES (normalized) ──
  const pinchThIdx = dist3D(thumbTip, indexTip) / handScale;
  const pinchThMid = dist3D(thumbTip, middleTip) / handScale;
  const pinchThRing = dist3D(thumbTip, ringTip) / handScale;
  const pinchThPinky = dist3D(thumbTip, pinkyTip) / handScale;

  // ── FINGER SPREAD ──
  const spreadIdxMid = dist3D(indexTip, middleTip) / handScale;
  const spreadMidRing = dist3D(middleTip, ringTip) / handScale;
  const spreadRingPinky = dist3D(ringTip, pinkyTip) / handScale;

  // ── FINGER TIP HEIGHTS relative to MCP (positive = tip above MCP = extended up) ──
  const indexTipAboveMcp = indexMcp.y - indexTip.y; // positive = tip is higher (y is inverted)
  const middleTipAboveMcp = middleMcp.y - middleTip.y;
  const ringTipAboveMcp = ringMcp.y - ringTip.y;
  const pinkyTipAboveMcp = pinkyMcp.y - pinkyTip.y;
  const thumbTipAboveWrist = wrist.y - thumbTip.y;

  // ── SPATIAL POSITION ──
  const handY = wrist.y;
  const handX = wrist.x;

  // ── INDEX FINGER CURL (hook) ──
  const indexHooked = (indexTip.y > indexDip.y) && (indexDip.y < indexPip.y);

  // ── CROSSED FINGERS (for R) ──
  const fingersCrossed = (
    (indexTip.x > middleTip.x && indexMcp.x < middleMcp.x) ||
    (indexTip.x < middleTip.x && indexMcp.x > middleMcp.x)
  );

  // ── FINGER COUNTS ──
  const extCount = [thumbExt, indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;
  const fourFingers = indexExt && middleExt && ringExt && pinkyExt;

  // ── THUMB TOUCHING PALM (across fingers) ──
  const thumbAcrossPalm = dist3D(thumbTip, indexMcp) / handScale < 0.6;

  // DEBUG object
  const debug = {
    extCount,
    thumbExt, indexExt, middleExt, ringExt, pinkyExt,
    pinchThIdx: pinchThIdx.toFixed(2),
    pinchThMid: pinchThMid.toFixed(2),
    spreadIdxMid: spreadIdxMid.toFixed(2),
    indexAngle: indexAngle.toFixed(0),
    middleAngle: middleAngle.toFixed(0),
    thumbAngle: thumbAngle.toFixed(0),
    handY: handY.toFixed(2),
  };

  // ═══════════════════════════════════════════════════════════
  // CLASSIFICATION RULES (ordered from most specific to general)
  // ═══════════════════════════════════════════════════════════

  // ── RESTING / BLANK ──
  if (handY > 0.90) {
    return { sign: 'BLANK', confidence: 0.99, debug };
  }

  // ══════════════════════════════════════════════
  // ALL 5 FINGERS EXTENDED
  // ══════════════════════════════════════════════
  if (extCount === 5) {
    const totalSpread = spreadIdxMid + spreadMidRing + spreadRingPinky;

    // HELLO: open palm, hand high (near face/temple), palm facing out
    if (handY < 0.45) {
      return { sign: 'HELLO', confidence: 0.96, debug };
    }
    // NUMBER 5: fingers spread wide
    if (totalSpread > 0.85) {
      return { sign: '5', confidence: 0.95, debug };
    }
    // B: 4 fingers together, thumb across/folded (but angle may detect thumb as ext)
    // STOP: open palm pushed forward, mid position
    return { sign: 'STOP', confidence: 0.94, debug };
  }

  // ══════════════════════════════════════════════
  // 4 FINGERS EXTENDED (thumb folded)
  // ══════════════════════════════════════════════
  if (!thumbExt && fourFingers) {
    const fingersTight = spreadIdxMid < 0.22 && spreadMidRing < 0.22;
    // B: 4 fingers together touching, thumb folded
    if (fingersTight) {
      return { sign: 'B', confidence: 0.96, debug };
    }
    // NUMBER 4: 4 fingers spread apart
    return { sign: '4', confidence: 0.95, debug };
  }

  // ══════════════════════════════════════════════
  // 3 FINGERS: Index + Middle + Ring (no thumb, no pinky)
  // ══════════════════════════════════════════════
  if (!thumbExt && indexExt && middleExt && ringExt && !pinkyExt) {
    // DRINK: C-hand tipped to mouth (hand up near face)
    if (handY < 0.45) {
      return { sign: 'DRINK', confidence: 0.93, debug };
    }
    // W: 3 fingers spread
    if (spreadIdxMid > 0.20) {
      return { sign: 'W', confidence: 0.95, debug };
    }
    return { sign: 'W', confidence: 0.93, debug };
  }

  // ══════════════════════════════════════════════
  // 3 FINGERS: Thumb + Index + Middle (ring & pinky folded)
  // ══════════════════════════════════════════════
  if (thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
    return { sign: '3', confidence: 0.96, debug };
  }

  // ══════════════════════════════════════════════
  // 2 FINGERS: Index + Middle (no thumb, no ring, no pinky)
  // ══════════════════════════════════════════════
  if (!thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
    // R: fingers crossed
    if (fingersCrossed) {
      return { sign: 'R', confidence: 0.95, debug };
    }
    // V / 2: fingers spread apart
    if (spreadIdxMid > 0.25) {
      return { sign: 'V', confidence: 0.96, debug };
    }
    // K: index and middle up, tight together (alternative: K often has thumb touching middle)
    if (pinchThMid < 0.50 && spreadIdxMid < 0.20) {
      return { sign: 'K', confidence: 0.92, debug };
    }
    // U: index and middle up together
    return { sign: 'U', confidence: 0.95, debug };
  }

  // ══════════════════════════════════════════════
  // 2 FINGERS: Thumb + Index (L shape)
  // ══════════════════════════════════════════════
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    // L: thumb and index extended at ~90° angle
    return { sign: 'L', confidence: 0.97, debug };
  }

  // ══════════════════════════════════════════════
  // 2 FINGERS: Thumb + Pinky (Y / phone shape)
  // ══════════════════════════════════════════════
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { sign: 'Y', confidence: 0.97, debug };
  }

  // ══════════════════════════════════════════════
  // 1 FINGER: Index only
  // ══════════════════════════════════════════════
  if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    // X: index finger hooked/curved
    if (indexHooked) {
      return { sign: 'X', confidence: 0.93, debug };
    }
    // G: index pointing sideways/horizontally
    const indexPointingSideways = Math.abs(indexTip.y - indexMcp.y) < 0.06 * handScale * 10;
    if (indexPointingSideways && Math.abs(indexTip.x - indexMcp.x) > 0.04) {
      return { sign: 'G', confidence: 0.92, debug };
    }
    // D: index up, thumb touches middle finger
    if (pinchThMid < 0.45) {
      return { sign: 'D', confidence: 0.95, debug };
    }
    // Z / WHERE: index finger wagging/pointing
    if (handY < 0.50) {
      return { sign: 'WHERE', confidence: 0.90, debug };
    }
    // YOU: pointing outward (hand in front, mid-height)
    if (handX > 0.55 || handX < 0.45) {
      return { sign: 'YOU', confidence: 0.90, debug };
    }
    // Default: NUMBER 1
    return { sign: '1', confidence: 0.95, debug };
  }

  // ══════════════════════════════════════════════
  // 1 FINGER: Pinky only (I letter)
  // ══════════════════════════════════════════════
  if (!thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { sign: 'I', confidence: 0.96, debug };
  }

  // ══════════════════════════════════════════════
  // 1 FINGER: Thumb only (thumbs up = YES / A)
  // ══════════════════════════════════════════════
  if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) {
    // YES: thumb pointing up
    if (thumbTipAboveWrist > 0.05) {
      return { sign: 'YES', confidence: 0.95, debug };
    }
    // A: thumb extended to side
    return { sign: 'A', confidence: 0.94, debug };
  }

  // ══════════════════════════════════════════════
  // PINCH GESTURES (specific finger combos touching thumb)
  // ══════════════════════════════════════════════

  // 9 / F: thumb-index pinch, middle+ring+pinky extended
  if (pinchThIdx < 0.35 && middleExt && ringExt && pinkyExt) {
    return { sign: '9', confidence: 0.95, debug };
  }

  // 8: thumb-middle pinch, index+ring+pinky extended
  if (pinchThMid < 0.35 && indexExt && ringExt && pinkyExt) {
    return { sign: '8', confidence: 0.95, debug };
  }

  // 7: thumb-ring pinch, index+middle+pinky extended
  if (pinchThRing < 0.35 && indexExt && middleExt && pinkyExt) {
    return { sign: '7', confidence: 0.95, debug };
  }

  // 6: thumb-pinky pinch, index+middle+ring extended
  if (pinchThPinky < 0.35 && indexExt && middleExt && ringExt) {
    return { sign: '6', confidence: 0.95, debug };
  }

  // ══════════════════════════════════════════════
  // CLOSED FIST VARIANTS (0 extended)
  // ══════════════════════════════════════════════
  if (extCount === 0) {
    // E: fingers curled, thumb across/below fingers
    if (thumbAcrossPalm && pinchThIdx > 0.20) {
      return { sign: 'E', confidence: 0.92, debug };
    }
    // S: fist with thumb across front of fingers
    if (pinchThIdx < 0.50 && pinchThMid < 0.50) {
      return { sign: 'S', confidence: 0.93, debug };
    }
    // M: fist with thumb under 3 fingers (thumb tip below index/middle/ring MCPs)
    if (thumbTip.y > indexMcp.y && thumbTip.y > middleMcp.y) {
      return { sign: 'M', confidence: 0.91, debug };
    }
    // N: fist with thumb between index and middle
    if (thumbTip.y > indexMcp.y) {
      return { sign: 'N', confidence: 0.91, debug };
    }
    // T: fist with thumb between index and middle (thumb tip tucked)
    return { sign: 'T', confidence: 0.90, debug };
  }

  // ══════════════════════════════════════════════
  // MULTI-FINGER PINCH (bunched fingers)
  // ══════════════════════════════════════════════

  // EAT: all fingertips bunched near mouth
  if (pinchThIdx < 0.40 && pinchThMid < 0.40 && handY < 0.45) {
    return { sign: 'EAT', confidence: 0.93, debug };
  }

  // NO: index+middle tap thumb
  if (pinchThIdx < 0.40 && pinchThMid < 0.40 && !ringExt && !pinkyExt) {
    return { sign: 'NO', confidence: 0.94, debug };
  }

  // 0 / O: all fingers curled to form circle with thumb
  if (pinchThIdx < 0.40 && pinchThMid < 0.40 && pinchThRing < 0.45) {
    return { sign: '0', confidence: 0.93, debug };
  }

  // C: curved open C handshape (fingers partially curled, not touching thumb)
  if (pinchThIdx > 0.40 && pinchThIdx < 0.90 && !indexExt && !middleExt) {
    return { sign: 'C', confidence: 0.91, debug };
  }

  // ══════════════════════════════════════════════
  // POSITION-BASED SIGNS
  // ══════════════════════════════════════════════

  // PLEASE: flat hand over chest
  if (fourFingers && handY > 0.50) {
    return { sign: 'PLEASE', confidence: 0.90, debug };
  }

  // H: index + middle pointing sideways
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    const pointingSideways = Math.abs(indexTip.y - indexMcp.y) < 0.05;
    if (pointingSideways) {
      return { sign: 'H', confidence: 0.92, debug };
    }
  }

  // P: index pointing down + thumb out (like K but pointing down)
  if (indexExt && middleExt && thumbExt && !ringExt && !pinkyExt && indexTip.y > indexMcp.y) {
    return { sign: 'P', confidence: 0.91, debug };
  }

  // Q: thumb + index pointing down
  if (thumbExt && indexExt && !middleExt && indexTip.y > indexMcp.y) {
    return { sign: 'Q', confidence: 0.91, debug };
  }

  // ══════════════════════════════════════════════
  // CONTEXTUAL BASIC WORDS (position-dependent)
  // ══════════════════════════════════════════════

  // SLEEP: palm on cheek (hand high + slightly tilted)
  if (fourFingers && handY < 0.40) {
    return { sign: 'SLEEP', confidence: 0.88, debug };
  }

  // HOME: bunched fingers touch mouth then cheek
  if (pinchThIdx < 0.45 && pinchThMid < 0.45 && handY < 0.50 && handY > 0.30) {
    return { sign: 'HOME', confidence: 0.88, debug };
  }

  // GO: index pointing forward
  if (indexExt && !middleExt && handX > 0.60) {
    return { sign: 'GO', confidence: 0.88, debug };
  }

  // COME: index curling inward
  if (indexExt && !middleExt && handX < 0.40) {
    return { sign: 'COME', confidence: 0.88, debug };
  }

  // WAIT: palms up with spread fingers
  if (fourFingers && thumbExt) {
    return { sign: 'WAIT', confidence: 0.87, debug };
  }

  // HELP: thumbs up on flat palm
  if (thumbExt && !indexExt && !middleExt) {
    return { sign: 'HELP', confidence: 0.86, debug };
  }

  // SORRY: fist rubbing chest
  if (extCount === 0) {
    return { sign: 'SORRY', confidence: 0.85, debug };
  }

  // WHAT: open hands
  if (extCount >= 3) {
    return { sign: 'WHAT', confidence: 0.84, debug };
  }

  // SCHOOL: flat palms clapping
  if (fourFingers) {
    return { sign: 'SCHOOL', confidence: 0.84, debug };
  }

  // THANK_YOU
  if (fourFingers && handY < 0.55) {
    return { sign: 'THANK_YOU', confidence: 0.85, debug };
  }

  // Fallback
  return { sign: 'GESTURE_DETECTED', confidence: 0.60, debug };
}


export default function TranslatePage() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Status & Live Finger Diagnostics
  const [handsDetected, setHandsDetected] = useState(false);
  const [fps, setFps] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [debugInfo, setDebugInfo] = useState({});
  const [fingerHUD, setFingerHUD] = useState({
    thumb: '—',
    index: '—',
    middle: '—',
    ring: '—',
    pinky: '—'
  });

  // Real-Time Recognition State
  const [currentSign, setCurrentSign] = useState('READY');
  const [history, setHistory] = useState([]);

  // Active Category & Guide Sign
  const [simulatorCategory, setSimulatorCategory] = useState('Basic ISL Signs');
  const [activeGuideSign, setActiveGuideSign] = useState(COMPREHENSIVE_SIGNS[36] || COMPREHENSIVE_SIGNS[0]);

  // DOM & Pipeline Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const mediaPipeCameraRef = useRef(null);
  const handsModelRef = useRef(null);
  const lastRecognizedSignRef = useRef('');
  const stableCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef(null);
  const lastFpsTimeRef = useRef(performance.now());
  const containerRef = useRef(null);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
    };
  }, []);

  /**
   * Handles MediaPipe Hands Results
   */
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // FPS counter
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandsDetected(true);
      const landmarks = results.multiHandLandmarks[0];

      // ── Draw hand skeleton ──
      // Glow effect for connections
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (const [start, end] of HAND_CONNECTIONS) {
        const p1 = landmarks[start];
        const p2 = landmarks[end];
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Draw landmark dots
      for (let i = 0; i < landmarks.length; i++) {
        const l = landmarks[i];
        const isTip = [4, 8, 12, 16, 20].includes(i);
        const isWrist = i === 0;
        ctx.beginPath();
        ctx.arc(l.x * canvas.width, l.y * canvas.height, isWrist ? 8 : isTip ? 7 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = isTip ? '#F59E0B' : isWrist ? '#EF4444' : '#38BDF8';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Classify ──
      const result = classifyISLSign(landmarks);

      // Update finger HUD
      setFingerHUD({
        thumb: result.debug.thumbExt ? 'OPEN' : 'CLOSED',
        index: result.debug.indexExt ? 'OPEN' : 'CLOSED',
        middle: result.debug.middleExt ? 'OPEN' : 'CLOSED',
        ring: result.debug.ringExt ? 'OPEN' : 'CLOSED',
        pinky: result.debug.pinkyExt ? 'OPEN' : 'CLOSED'
      });

      setDebugInfo(result.debug);
      setConfidence(result.confidence);

      if (result.sign && result.sign !== 'BLANK' && result.sign !== 'GESTURE_DETECTED') {
        setCurrentSign(result.sign);

        // Stability: require 5 consistent frames before adding to history
        if (result.sign === lastRecognizedSignRef.current) {
          stableCountRef.current += 1;
        } else {
          lastRecognizedSignRef.current = result.sign;
          stableCountRef.current = 1;
        }

        if (stableCountRef.current === 5) {
          setHistory(prev => {
            if (prev[prev.length - 1] !== result.sign) {
              return [...prev, result.sign];
            }
            return prev;
          });
        }
      } else if (result.sign === 'GESTURE_DETECTED') {
        setCurrentSign('ANALYZING...');
      }

      // Draw current sign on canvas (top-left overlay)
      if (result.sign !== 'BLANK') {
        ctx.save();
        ctx.scale(-1, 1); // un-mirror for text
        ctx.font = 'bold 28px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-canvas.width, 0, 300, 46);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(result.sign, -canvas.width + 14, 33);
        ctx.restore();
      }
    } else {
      setHandsDetected(false);
      setFingerHUD({ thumb: '—', index: '—', middle: '—', ring: '—', pinky: '—' });
    }
    ctx.restore();
  }, []);

  /**
   * Start Live Webcam in High-Definition (1280x720)
   */
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = performance.now();

      // Load MediaPipe Hands
      if (window.Hands) {
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        hands.onResults(onResults);
        handsModelRef.current = hands;

        if (window.Camera) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (handsModelRef.current && videoRef.current) {
                await handsModelRef.current.send({ image: videoRef.current });
              }
            },
            width: 1280,
            height: 720
          });
          camera.start();
          mediaPipeCameraRef.current = camera;
        }
      } else {
        setCameraError('MediaPipe Hands library not loaded. Please check your internet connection and refresh.');
      }
    } catch (err) {
      console.error('[Webcam Error]:', err);
      setCameraError('Unable to access webcam. Please allow camera permissions in your browser.');
      setIsCameraActive(false);
    }
  };

  /**
   * Stop Live Webcam
   */
  const stopCamera = () => {
    if (mediaPipeCameraRef.current) {
      try { mediaPipeCameraRef.current.stop(); } catch (e) {}
      mediaPipeCameraRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsCameraActive(false);
    setHandsDetected(false);
    setFps(0);
  };

  /**
   * Toggle fullscreen camera view
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  /**
   * Trigger direct test sign from simulator
   */
  const triggerSign = (signObj) => {
    setCurrentSign(signObj.label);
    setActiveGuideSign(signObj);
    setConfidence(0.96);
    setHistory(prev => {
      if (prev[prev.length - 1] !== signObj.label) {
        return [...prev, signObj.label];
      }
      return prev;
    });
  };

  /**
   * Text-to-Speech for current sign
   */
  const speakSign = () => {
    if (currentSign && currentSign !== 'READY' && currentSign !== 'BLANK' && currentSign !== 'ANALYZING...') {
      const utterance = new SpeechSynthesisUtterance(currentSign);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  /**
   * Clear Recognition History
   */
  const clearHistory = () => {
    setHistory([]);
    lastRecognizedSignRef.current = '';
    stableCountRef.current = 0;
    setCurrentSign('READY');
  };

  const confColor = confidence >= 0.90 ? '#10B981' : confidence >= 0.75 ? '#F59E0B' : '#EF4444';

  return (
    <div ref={containerRef} className="translate-page-container" style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px' }}>
      {/* Header Banner */}
      <div style={{
        marginBottom: '20px', padding: '18px 24px',
        background: 'linear-gradient(135deg, #0F1E36 0%, #1E293B 50%, #0F172A 100%)',
        borderRadius: '14px', border: '1px solid rgba(56,189,248,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(56,189,248,0.15))',
              color: '#60A5FA', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px'
            }}>
              <Zap size={14} /> 56-Class ISL Recognition Engine
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>
              ISL AI TRANSLATOR
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              Real-time Indian Sign Language recognition — Alphabet (A–Z) · Numbers (0–9) · Basic Words (20)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isCameraActive ? (
              <button onClick={stopCamera} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                borderRadius: '8px', backgroundColor: '#EF4444', color: '#FFF',
                fontWeight: '600', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
              }}>
                <Square size={16} /> Stop Camera
              </button>
            ) : (
              <button onClick={startCamera} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
                borderRadius: '8px', background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                color: '#FFF', fontWeight: '700', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(37,99,235,0.4)', transition: 'all 0.2s'
              }}>
                <Play size={18} /> Start Live Camera
              </button>
            )}
            <button onClick={speakSign} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px',
              borderRadius: '8px', backgroundColor: '#1E293B', color: '#38BDF8',
              fontWeight: '600', border: '1px solid #334155', cursor: 'pointer'
            }}>
              <Volume2 size={16} />
            </button>
            <button onClick={() => setShowDebug(!showDebug)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px',
              borderRadius: '8px', backgroundColor: showDebug ? 'rgba(245,158,11,0.2)' : '#1E293B',
              color: showDebug ? '#F59E0B' : '#94A3B8',
              fontWeight: '600', border: showDebug ? '1px solid #F59E0B' : '1px solid #334155',
              cursor: 'pointer'
            }}>
              <Bug size={16} />
            </button>
            <button onClick={clearHistory} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
              borderRadius: '8px', backgroundColor: '#334155', color: '#E2E8F0',
              fontWeight: '600', border: 'none', cursor: 'pointer'
            }}>
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isFullscreen ? '1fr' : '1.4fr 0.85fr',
        gap: '20px', alignItems: 'start'
      }}>

        {/* LEFT: CAMERA */}
        <div>
          <div style={{
            backgroundColor: '#0B1120', borderRadius: '16px', padding: '14px',
            border: '1px solid #1E293B', boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
          }}>
            {/* Telemetry Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', backgroundColor: '#0F172A', borderRadius: '8px',
              marginBottom: '10px', fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: isCameraActive ? '#10B981' : '#64748B',
                  display: 'inline-block',
                  boxShadow: isCameraActive ? '0 0 8px #10B981' : 'none',
                  animation: isCameraActive ? 'pulse 2s infinite' : 'none'
                }} />
                <span style={{ color: '#CBD5E1' }}>
                  {isCameraActive ? 'HD Stream Active' : 'Standby'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: handsDetected ? '#10B981' : '#64748B' }}>
                  <UserCheck size={14} />
                  <span>{handsDetected ? 'Hand Locked' : 'Searching...'}</span>
                </div>
                <span style={{
                  backgroundColor: '#1E293B', padding: '2px 8px', borderRadius: '4px',
                  color: '#38BDF8', fontWeight: '700', fontFamily: 'monospace', fontSize: '0.8rem'
                }}>{fps} FPS</span>
                <button onClick={toggleFullscreen} style={{
                  background: 'none', border: 'none', color: '#94A3B8',
                  cursor: 'pointer', padding: '2px'
                }}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            {/* Camera Viewport */}
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '16 / 9',
              minHeight: isFullscreen ? '600px' : '420px',
              backgroundColor: '#030712', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '12px', border: '2px solid #1E293B'
            }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  display: isCameraActive ? 'block' : 'none'
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', pointerEvents: 'none',
                  transform: 'scaleX(-1)', zIndex: 10
                }}
              />

              {!isCameraActive && (
                <div style={{ zIndex: 20, textAlign: 'center', padding: '40px' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(56,189,248,0.1))',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#38BDF8', marginBottom: '16px'
                  }}>
                    <Camera size={42} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '8px' }}>
                    Camera Ready
                  </h3>
                  <p style={{ color: '#94A3B8', maxWidth: '400px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
                    Click "Start Live Camera" to begin real-time ISL hand tracking and recognition.
                  </p>
                  <button onClick={startCamera} style={{
                    padding: '12px 32px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    color: '#FFF', fontWeight: '700', border: 'none', cursor: 'pointer',
                    fontSize: '1rem', boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
                    transition: 'transform 0.2s'
                  }}>
                    <Play size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                    Start Live Camera
                  </button>
                </div>
              )}

              {/* Confidence bar overlay */}
              {isCameraActive && handsDetected && (
                <div style={{
                  position: 'absolute', bottom: '12px', left: '12px', right: '12px',
                  zIndex: 15, display: 'flex', gap: '10px', alignItems: 'center'
                }}>
                  <div style={{
                    flex: 1, height: '6px', borderRadius: '3px',
                    backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${confidence * 100}%`, height: '100%',
                      borderRadius: '3px', backgroundColor: confColor,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{
                    color: confColor, fontWeight: '700', fontSize: '0.8rem',
                    fontFamily: 'monospace', minWidth: '40px'
                  }}>
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {cameraError && (
              <div style={{
                marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '8px',
                backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.3)'
              }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '0.85rem' }}>{cameraError}</span>
              </div>
            )}

            {/* Finger State HUD */}
            <div style={{
              marginTop: '12px', padding: '10px 12px', backgroundColor: '#090E17',
              borderRadius: '10px', border: '1px solid #1E293B'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'
              }}>
                <span style={{
                  fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px',
                  color: '#64748B', fontWeight: '700'
                }}>
                  ⚡ Hand Joint State
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: handsDetected ? '#10B981' : '#475569'
                }}>
                  {handsDetected ? '● Tracking' : '○ Idle'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {Object.entries(fingerHUD).map(([finger, state]) => (
                  <div key={finger} style={{
                    padding: '6px 4px', borderRadius: '6px', textAlign: 'center',
                    backgroundColor: state === 'OPEN' ? 'rgba(16,185,129,0.12)' : '#0F172A',
                    border: state === 'OPEN' ? '1px solid rgba(16,185,129,0.4)' : '1px solid #1E293B'
                  }}>
                    <div style={{
                      fontSize: '0.7rem', textTransform: 'uppercase', color: '#94A3B8',
                      marginBottom: '2px'
                    }}>{finger}</div>
                    <div style={{
                      fontSize: '0.8rem', fontWeight: '800',
                      color: state === 'OPEN' ? '#10B981' : state === 'CLOSED' ? '#F87171' : '#475569'
                    }}>{state}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Debug Panel */}
            {showDebug && Object.keys(debugInfo).length > 0 && (
              <div style={{
                marginTop: '10px', padding: '10px 12px', backgroundColor: '#0C0F1A',
                borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)',
                fontFamily: 'monospace', fontSize: '0.72rem', color: '#F59E0B'
              }}>
                <div style={{ marginBottom: '4px', fontWeight: '700', letterSpacing: '1px' }}>DEBUG DATA</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '4px' }}>
                  {Object.entries(debugInfo).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ color: '#94A3B8' }}>{key}:</span>
                      <span style={{ color: typeof val === 'boolean' ? (val ? '#10B981' : '#EF4444') : '#F59E0B' }}>
                        {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: RECOGNITION + GUIDE */}
        {!isFullscreen && (
          <div>
            {/* Current Sign Card */}
            <div style={{
              backgroundColor: '#0B1120', borderRadius: '16px', padding: '20px',
              border: '1px solid #1E293B', marginBottom: '18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #1E293B', paddingBottom: '10px', marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: handsDetected ? '#38BDF8' : '#475569',
                    display: 'inline-block',
                    boxShadow: handsDetected ? '0 0 6px #38BDF8' : 'none'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px', color: '#94A3B8' }}>
                    DETECTED SIGN
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#0F172A', padding: '3px 10px', borderRadius: '16px',
                  border: `1px solid ${confColor}33`
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Conf: </span>
                  <strong style={{ color: confColor, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {(confidence * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>

              {/* Big Sign Display */}
              <div style={{
                padding: '28px 16px', textAlign: 'center',
                background: 'linear-gradient(180deg, #0F172A 0%, #0B1120 100%)',
                borderRadius: '12px', border: '1px solid #1E293B'
              }}>
                <span style={{
                  fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px',
                  color: '#475569', fontWeight: '700'
                }}>
                  ISL SIGN
                </span>
                <h2 style={{
                  fontSize: currentSign.length > 6 ? '2.6rem' : '3.5rem',
                  fontWeight: '900', margin: '8px 0',
                  color: currentSign === 'READY' || currentSign === 'BLANK' ? '#475569' :
                         currentSign === 'ANALYZING...' ? '#F59E0B' : '#38BDF8',
                  letterSpacing: '1px',
                  textShadow: currentSign !== 'READY' && currentSign !== 'BLANK' ?
                    '0 0 20px rgba(56,189,248,0.3)' : 'none',
                  transition: 'color 0.3s ease'
                }}>
                  {currentSign}
                </h2>
                <button onClick={speakSign} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 16px', borderRadius: '20px',
                  backgroundColor: 'rgba(56,189,248,0.1)', color: '#38BDF8',
                  fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(56,189,248,0.2)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <Volume2 size={13} /> Speak
                </button>
              </div>

              {/* History */}
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'
                }}>
                  <span style={{ fontWeight: '700', color: '#CBD5E1', fontSize: '0.85rem' }}>
                    History ({history.length})
                  </span>
                  {history.length > 0 && (
                    <button onClick={clearHistory} style={{
                      background: 'none', border: 'none', color: '#EF4444',
                      cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '50px',
                  padding: '10px', backgroundColor: '#090E17', borderRadius: '8px',
                  border: '1px solid #1E293B', maxHeight: '130px', overflowY: 'auto'
                }}>
                  {history.length === 0 ? (
                    <span style={{ color: '#475569', fontSize: '0.8rem' }}>
                      Show signs in front of camera to build history...
                    </span>
                  ) : (
                    history.map((sign, idx) => (
                      <span key={idx} style={{
                        padding: '5px 12px', borderRadius: '6px',
                        backgroundColor: '#1E293B', color: '#F1F5F9',
                        fontWeight: '700', fontSize: '0.82rem',
                        border: '1px solid #334155'
                      }}>
                        {sign}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 56 ISL Sign Guide */}
            <div style={{
              backgroundColor: '#0B1120', borderRadius: '16px', padding: '18px',
              border: '1px solid #1E293B'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#38BDF8" />
                  <h4 style={{ margin: 0, color: '#FFFFFF', fontSize: '0.95rem', fontWeight: '700' }}>
                    ISL Sign Guide (56)
                  </h4>
                </div>
                <select
                  value={simulatorCategory}
                  onChange={(e) => setSimulatorCategory(e.target.value)}
                  style={{
                    backgroundColor: '#1E293B', color: '#F1F5F9',
                    border: '1px solid #334155', borderRadius: '6px',
                    padding: '5px 10px', fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  {ISL_VOCABULARY_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Active Sign Instruction */}
              {activeGuideSign && (
                <div style={{
                  padding: '10px 12px', backgroundColor: '#0F172A', borderRadius: '8px',
                  border: '1px solid rgba(56,189,248,0.2)', marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{activeGuideSign.emoji}</span>
                    <strong style={{ color: '#38BDF8', fontSize: '0.95rem' }}>
                      How to Sign: {activeGuideSign.label}
                    </strong>
                  </div>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.82rem', lineHeight: '1.4' }}>
                    {activeGuideSign.actionSummary || activeGuideSign.description}
                  </p>
                </div>
              )}

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(62px, 1fr))',
                gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px'
              }}>
                {COMPREHENSIVE_SIGNS.filter(s => s.category === simulatorCategory).map((sign) => (
                  <button
                    key={sign.id}
                    onClick={() => triggerSign(sign)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', padding: '8px 2px', borderRadius: '8px',
                      backgroundColor: sign.label === currentSign ? 'rgba(56,189,248,0.2)' : '#0F172A',
                      border: sign.label === currentSign ? '2px solid #38BDF8' : '1px solid #1E293B',
                      color: sign.label === currentSign ? '#38BDF8' : '#CBD5E1',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', marginBottom: '1px' }}>{sign.emoji}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>{sign.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
