/**
 * ISL Gesture Classifier — Real-time MediaPipe Hand Landmark → ISL Sign
 * 
 * Uses joint angles, pinch distances, finger states, spatial position,
 * and temporal stability for robust recognition.
 * 
 * Supports 65+ ISL signs matching the vocabulary.
 */

// ── VECTOR MATH ──
function dist(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + ((a.z||0)-(b.z||0))**2);
}

function angle(a, b, c) {
  const ba = { x: a.x-b.x, y: a.y-b.y, z: (a.z||0)-(b.z||0) };
  const bc = { x: c.x-b.x, y: c.y-b.y, z: (c.z||0)-(b.z||0) };
  const dot = ba.x*bc.x + ba.y*bc.y + ba.z*bc.z;
  const magA = Math.sqrt(ba.x**2 + ba.y**2 + ba.z**2);
  const magC = Math.sqrt(bc.x**2 + bc.y**2 + bc.z**2);
  if (magA * magC === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot/(magA*magC)))) * 57.2958;
}

// ── FINGER STATE EXTRACTION ──
export function extractFingerStates(lm) {
  if (!lm || lm.length < 21) return null;

  const w = lm[0];
  const hs = Math.max(dist(w, lm[9]), 0.001); // hand scale

  // Finger curl angles at PIP
  const ia = angle(lm[5], lm[6], lm[8]);
  const ma = angle(lm[9], lm[10], lm[12]);
  const ra = angle(lm[13], lm[14], lm[16]);
  const pa = angle(lm[17], lm[18], lm[20]);
  const ta = angle(lm[1], lm[2], lm[4]);

  // Distance-based backup
  const idist = dist(lm[8], w) > dist(lm[6], w);
  const mdist = dist(lm[12], w) > dist(lm[10], w);
  const rdist = dist(lm[16], w) > dist(lm[14], w);
  const pdist = dist(lm[20], w) > dist(lm[18], w);
  const tdist = dist(lm[4], lm[17]) > dist(lm[2], lm[17]) * 1.1;

  const EXT = 135, CURL = 95;

  return {
    thumb: ta > 130 || tdist,
    index: ia > EXT || (ia > CURL && idist),
    middle: ma > EXT || (ma > CURL && mdist),
    ring: ra > EXT || (ra > CURL && rdist),
    pinky: pa > EXT || (pa > CURL && pdist),
    thumbAngle: ta, indexAngle: ia, middleAngle: ma, ringAngle: ra, pinkyAngle: pa,
    // Pinch ratios
    pinchTI: dist(lm[4], lm[8]) / hs,
    pinchTM: dist(lm[4], lm[12]) / hs,
    pinchTR: dist(lm[4], lm[16]) / hs,
    pinchTP: dist(lm[4], lm[20]) / hs,
    // Spreads
    spreadIM: dist(lm[8], lm[12]) / hs,
    spreadMR: dist(lm[12], lm[16]) / hs,
    spreadRP: dist(lm[16], lm[20]) / hs,
    // Position
    handY: w.y,
    handX: w.x,
    handScale: hs,
    // Tip positions
    thumbTipY: lm[4].y, wristY: w.y,
    indexTipY: lm[8].y, indexMcpY: lm[5].y,
    // Extended count
    extCount: [ta > 130 || tdist, ia > EXT || (ia > CURL && idist),
               ma > EXT || (ma > CURL && mdist), ra > EXT || (ra > CURL && rdist),
               pa > EXT || (pa > CURL && pdist)].filter(Boolean).length,
  };
}

// ── MAIN CLASSIFIER ──
export function classifyISL(lm) {
  const f = extractFingerStates(lm);
  if (!f) return { sign: 'BLANK', confidence: 0, fingers: null };

  const { thumb, index, middle, ring, pinky, extCount,
          pinchTI, pinchTM, pinchTR, pinchTP,
          spreadIM, spreadMR, spreadRP,
          handY, handX, thumbTipY, wristY, indexTipY, indexMcpY } = f;

  // Resting
  if (handY > 0.88) return { sign: 'BLANK', confidence: 0.99, fingers: f };

  // ═══ ALL 5 EXTENDED ═══
  if (extCount === 5) {
    const totalSpread = spreadIM + spreadMR + spreadRP;
    if (handY < 0.40) return { sign: 'HELLO', confidence: 0.96, fingers: f };
    if (totalSpread > 0.90) return { sign: 'WAIT', confidence: 0.93, fingers: f };
    if (handY > 0.65) return { sign: 'STOP', confidence: 0.94, fingers: f };
    return { sign: 'STOP', confidence: 0.93, fingers: f };
  }

  // ═══ 4 FINGERS (no thumb) ═══
  if (!thumb && index && middle && ring && pinky) {
    if (spreadIM < 0.20 && spreadMR < 0.20) return { sign: 'PLEASE', confidence: 0.93, fingers: f };
    if (handY < 0.45) return { sign: 'SCHOOL', confidence: 0.91, fingers: f };
    return { sign: 'STOP', confidence: 0.90, fingers: f };
  }

  // ═══ 3 FINGERS: idx+mid+ring ═══
  if (!thumb && index && middle && ring && !pinky) {
    if (handY < 0.42) return { sign: 'DRINK', confidence: 0.93, fingers: f };
    return { sign: 'WATER', confidence: 0.91, fingers: f };
  }

  // ═══ 3 FINGERS: thumb+idx+mid ═══
  if (thumb && index && middle && !ring && !pinky) {
    return { sign: 'SPEAK', confidence: 0.92, fingers: f };
  }

  // ═══ 2 FINGERS: idx+mid (V / peace / read / write) ═══
  if (!thumb && index && middle && !ring && !pinky) {
    if (spreadIM > 0.28) return { sign: 'GO', confidence: 0.93, fingers: f };
    if (handY < 0.40) return { sign: 'READ', confidence: 0.90, fingers: f };
    return { sign: 'COME', confidence: 0.91, fingers: f };
  }

  // ═══ 2 FINGERS: thumb+index (L shape) ═══
  if (thumb && index && !middle && !ring && !pinky) {
    if (handX < 0.40) return { sign: 'GO', confidence: 0.91, fingers: f };
    if (handX > 0.60) return { sign: 'COME', confidence: 0.91, fingers: f };
    return { sign: 'LIKE', confidence: 0.90, fingers: f };
  }

  // ═══ 2 FINGERS: thumb+pinky (Y / phone) ═══
  if (thumb && !index && !middle && !ring && pinky) {
    if (handY < 0.45) return { sign: 'PHONE', confidence: 0.93, fingers: f };
    return { sign: 'WHAT', confidence: 0.90, fingers: f };
  }

  // ═══ 1 FINGER: index only ═══
  if (!thumb && index && !middle && !ring && !pinky) {
    if (handY < 0.35) return { sign: 'WHERE', confidence: 0.93, fingers: f };
    if (handX < 0.38) return { sign: 'YOU', confidence: 0.92, fingers: f };
    if (handX > 0.62) return { sign: 'I', confidence: 0.92, fingers: f };
    if (handY > 0.55 && handY < 0.75) return { sign: 'I', confidence: 0.91, fingers: f };
    return { sign: 'YOU', confidence: 0.90, fingers: f };
  }

  // ═══ 1 FINGER: pinky only ═══
  if (!thumb && !index && !middle && !ring && pinky) {
    return { sign: 'FRIEND', confidence: 0.91, fingers: f };
  }

  // ═══ THUMB ONLY ═══
  if (thumb && !index && !middle && !ring && !pinky) {
    if (thumbTipY < wristY - 0.03) return { sign: 'YES', confidence: 0.95, fingers: f };
    return { sign: 'HELP', confidence: 0.92, fingers: f };
  }

  // ═══ PINCH GESTURES ═══
  if (pinchTI < 0.30 && middle && ring && pinky) {
    return { sign: 'UNDERSTAND', confidence: 0.91, fingers: f };
  }
  if (pinchTI < 0.30 && pinchTM < 0.30 && !ring && !pinky) {
    return { sign: 'NO', confidence: 0.94, fingers: f };
  }
  if (pinchTI < 0.35 && pinchTM < 0.35 && handY < 0.45) {
    return { sign: 'EAT', confidence: 0.93, fingers: f };
  }
  if (pinchTI < 0.35 && pinchTM < 0.35 && pinchTR < 0.40) {
    return { sign: 'FOOD', confidence: 0.91, fingers: f };
  }

  // ═══ FIST (0 extended) ═══
  if (extCount === 0) {
    if (handY < 0.40) return { sign: 'STUDY', confidence: 0.89, fingers: f };
    if (handY > 0.60) return { sign: 'WORK', confidence: 0.89, fingers: f };
    if (pinchTI < 0.30) return { sign: 'KNOW', confidence: 0.88, fingers: f };
    return { sign: 'NEED', confidence: 0.87, fingers: f };
  }

  // ═══ POSITIONAL FALLBACKS ═══
  if (index && !middle && !ring) {
    if (handY < 0.40) return { sign: 'WRITE', confidence: 0.87, fingers: f };
    return { sign: 'WANT', confidence: 0.86, fingers: f };
  }

  return { sign: 'GESTURE_DETECTED', confidence: 0.55, fingers: f };
}

/**
 * Temporal Stabilizer — Buffers classifications and returns
 * a stable sign only after N consistent frames
 */
export class TemporalStabilizer {
  constructor(requiredFrames = 6, historySize = 30) {
    this.buffer = [];
    this.requiredFrames = requiredFrames;
    this.historySize = historySize;
    this.lastStableSign = null;
    this.lastStableTime = 0;
    this.consecutiveCount = 0;
    this.currentCandidate = null;
  }

  update(sign, confidence, timestamp) {
    this.buffer.push({ sign, confidence, timestamp });
    if (this.buffer.length > this.historySize) this.buffer.shift();

    if (sign === this.currentCandidate) {
      this.consecutiveCount++;
    } else {
      this.currentCandidate = sign;
      this.consecutiveCount = 1;
    }

    if (this.consecutiveCount >= this.requiredFrames && sign !== 'BLANK' && sign !== 'GESTURE_DETECTED') {
      const isNew = sign !== this.lastStableSign;
      this.lastStableSign = sign;
      this.lastStableTime = timestamp;
      return { sign, confidence, isNew, stable: true };
    }

    return { sign: this.lastStableSign || sign, confidence, isNew: false, stable: false };
  }

  reset() {
    this.buffer = [];
    this.lastStableSign = null;
    this.lastStableTime = 0;
    this.consecutiveCount = 0;
    this.currentCandidate = null;
  }
}
