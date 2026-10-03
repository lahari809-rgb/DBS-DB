import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Camera,
  Play,
  Square,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  Volume2,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import { CONTINUOUS_SEQUENCE_PRESETS, COMPREHENSIVE_SIGNS } from '../data/signsData';
import { translateISLSequenceToEnglish } from '../utils/islGrammarTranslator';

export default function PracticePage() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [detectedSequence, setDetectedSequence] = useState([]);
  const [isPracticing, setIsPracticing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [activeSignHint, setActiveSignHint] = useState(null);

  const practiceScenarios = [
    {
      id: 'prac_1',
      sentence: 'I will go to school tomorrow.',
      targetSigns: ['I', 'GO', 'SCHOOL', 'TOMORROW'],
      difficulty: 'Intermediate',
      category: 'Education',
      hint: "Sign 'I' (point to chest) → 'GO' (point forward) → 'SCHOOL' (double palm clap) → 'TOMORROW'."
    },
    {
      id: 'prac_2',
      sentence: 'Where is the hospital?',
      targetSigns: ['WHERE', 'HOSPITAL'],
      difficulty: 'Beginner',
      category: 'Places & Emergency',
      hint: "Sign 'WHERE' (oscillating index finger) → 'HOSPITAL' (cross on shoulder)."
    },
    {
      id: 'prac_3',
      sentence: 'I am hungry and need food.',
      targetSigns: ['I', 'HUNGRY', 'NEED', 'FOOD'],
      difficulty: 'Intermediate',
      category: 'Food & Needs',
      hint: "Sign 'I' → 'HUNGRY' (stroke chest) → 'NEED' (hooked finger) → 'FOOD' (tap lips)."
    },
    {
      id: 'prac_4',
      sentence: 'Mother is cooking food.',
      targetSigns: ['MOTHER', 'COOK', 'FOOD'],
      difficulty: 'Beginner',
      category: 'Family & Food',
      hint: "Sign 'MOTHER' (thumb on chin) → 'COOK' (palm flip) → 'FOOD' (tap lips)."
    },
    {
      id: 'prac_5',
      sentence: 'What is the time?',
      targetSigns: ['TIME', 'WHAT'],
      difficulty: 'Beginner',
      category: 'Time & Basic',
      hint: "Sign 'TIME' (tap wrist) → 'WHAT' (palms up shrug)."
    },
    {
      id: 'prac_6',
      sentence: 'Do you need help?',
      targetSigns: ['YOU', 'NEED', 'HELP'],
      difficulty: 'Beginner',
      category: 'Basic Signs',
      hint: "Sign 'YOU' (point forward) → 'NEED' → 'HELP' (fist lifted on palm)."
    }
  ];

  const currentScenario = practiceScenarios[selectedScenarioIndex];

  // Evaluate when practicing
  const handleEvaluate = async () => {
    try {
      const resp = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: currentScenario.id,
          target_signs: currentScenario.targetSigns,
          detected_signs: detectedSequence,
          user_id: '650c82f91a2b3c4d5e6f7081'
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setEvaluationResult(data);
      } else {
        fallbackEvaluation();
      }
    } catch (e) {
      fallbackEvaluation();
    }
  };

  const fallbackEvaluation = () => {
    const target = currentScenario.targetSigns;
    const detected = detectedSequence.filter(s => s !== 'BLANK');
    const targetSet = new Set(target);
    const detectedSet = new Set(detected);

    const correct = detected.filter(s => targetSet.has(s));
    const missing = target.filter(s => !detectedSet.has(s));
    const extra = detected.filter(s => !targetSet.has(s));

    const signAcc = Math.min(100, Math.round((correct.length / target.length) * 100));
    
    let orderMatches = 0;
    let tIdx = 0;
    for (const s of detected) {
      if (tIdx < target.length && s === target[tIdx]) {
        orderMatches++;
        tIdx++;
      }
    }
    const orderAcc = Math.round((orderMatches / target.length) * 100);
    const overall = Math.round(signAcc * 0.6 + orderAcc * 0.4);

    setEvaluationResult({
      accuracy: signAcc,
      order_accuracy: orderAcc,
      overall_match: overall,
      target_signs: target,
      detected_signs: detected,
      missing_signs: missing,
      extra_signs: extra,
      passed: overall >= 75,
      feedback: overall >= 85
        ? 'Excellent execution! All gestures were distinct and in the correct temporal sequence.'
        : overall >= 60
        ? `Good attempt! You missed ${missing.length} sign(s): ${missing.join(', ')}.`
        : 'Keep practicing! Focus on completing each sign steadily before moving to the next.'
    });
  };

  const addSignToPractice = (signLabel) => {
    if (!detectedSequence.includes(signLabel) || detectedSequence[detectedSequence.length - 1] !== signLabel) {
      const updated = [...detectedSequence, signLabel];
      setDetectedSequence(updated);
    }
  };

  const resetPractice = () => {
    setDetectedSequence([]);
    setEvaluationResult(null);
  };

  return (
    <div className="practice-page-container">
      {/* Header */}
      <div className="practice-header-card">
        <div className="header-badge-row">
          <span className="practice-badge">
            <Target size={14} /> Interactive Evaluation Mode
          </span>
          <span className="ist-tag">AI Temporal Scoring</span>
        </div>
        <h1>Continuous ISL Practice Studio</h1>
        <p>
          Select a target English sentence, perform the continuous sign sequence, and let the AI evaluate your sign accuracy, order, and timing.
        </p>
      </div>

      {/* Main Practice Workspace */}
      <div className="practice-workspace-grid">
        {/* Left Column: Target Sentence & Evaluation */}
        <div className="practice-main-panel">
          {/* Target Card */}
          <div className="target-sentence-card">
            <div className="target-top-bar">
              <span className="target-difficulty-tag">{currentScenario.difficulty}</span>
              <span className="target-cat-tag">{currentScenario.category}</span>
            </div>

            <h2 className="target-sentence-text">
              “{currentScenario.sentence}”
            </h2>

            <div className="target-sequence-flow">
              <span className="flow-title">Expected Sign Sequence:</span>
              <div className="flow-badges">
                {currentScenario.targetSigns.map((sign, idx) => (
                  <React.Fragment key={idx}>
                    <span className="target-sign-pill">{sign}</span>
                    {idx < currentScenario.targetSigns.length - 1 && (
                      <span className="target-arrow">&rarr;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="target-hint-box">
              <Sparkles size={16} className="hint-icon" />
              <span><strong>Hint:</strong> {currentScenario.hint}</span>
            </div>
          </div>

          {/* Detected Sequence Monitor */}
          <div className="detected-monitor-card">
            <div className="monitor-header">
              <div className="monitor-title-group">
                <Activity size={18} className="pulse-icon" />
                <h3>Your Live Performed Sequence</h3>
              </div>
              <div className="monitor-btn-group">
                <button
                  className="btn-practice-eval"
                  onClick={handleEvaluate}
                  disabled={detectedSequence.length === 0}
                >
                  <Award size={16} /> Evaluate Attempt
                </button>
                <button
                  className="btn-practice-reset"
                  onClick={resetPractice}
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>

            <div className="monitor-sequence-tray">
              {detectedSequence.length === 0 ? (
                <div className="empty-tray-state">
                  <Camera size={28} />
                  <p>Click signs below or use camera to sign the sequence continuously...</p>
                </div>
              ) : (
                <div className="detected-tokens-list">
                  {detectedSequence.map((sign, idx) => {
                    const isTarget = currentScenario.targetSigns.includes(sign);
                    return (
                      <React.Fragment key={idx}>
                        <span className={`detected-sign-token ${isTarget ? 'token-correct' : 'token-extra'}`}>
                          {sign}
                        </span>
                        {idx < detectedSequence.length - 1 && (
                          <span className="detected-arrow">&rarr;</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Translation of current attempt */}
            {detectedSequence.length > 0 && (
              <div className="attempt-translation-preview">
                <span className="preview-label">Current Translated English:</span>
                <p className="preview-text">
                  {translateISLSequenceToEnglish(detectedSequence)}
                </p>
              </div>
            )}
          </div>

          {/* Evaluation Results Card */}
          {evaluationResult && (
            <div className={`evaluation-results-card ${evaluationResult.passed ? 'eval-pass' : 'eval-review'}`}>
              <div className="eval-card-header">
                <div className="eval-status-badge">
                  {evaluationResult.passed ? (
                    <>
                      <CheckCircle size={20} color="#10B981" />
                      <span>Sentence Passed!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} color="#F59E0B" />
                      <span>Needs Refinement</span>
                    </>
                  )}
                </div>
                <div className="eval-score-ring">
                  <span className="score-num">{evaluationResult.overall_match}%</span>
                  <span className="score-label">Overall Match</span>
                </div>
              </div>

              <div className="eval-metrics-row">
                <div className="metric-box">
                  <span className="metric-title">Sign Accuracy</span>
                  <span className="metric-value">{evaluationResult.accuracy}%</span>
                </div>
                <div className="metric-box">
                  <span className="metric-title">Temporal Order</span>
                  <span className="metric-value">{evaluationResult.order_accuracy}%</span>
                </div>
                <div className="metric-box">
                  <span className="metric-title">Missing Signs</span>
                  <span className="metric-value">
                    {evaluationResult.missing_signs?.length || 0}
                  </span>
                </div>
              </div>

              <p className="eval-feedback-text">
                {evaluationResult.feedback}
              </p>
            </div>
          )}

          {/* Interactive Fast Sign Input Tray */}
          <div className="practice-quick-trigger-panel">
            <div className="quick-trigger-header">
              <h4>Quick Sign Simulator (Click in Order)</h4>
              <span className="trigger-subtitle">Test target sequence without camera hardware</span>
            </div>

            <div className="quick-buttons-row">
              {currentScenario.targetSigns.map((sign) => (
                <button
                  key={sign}
                  className="btn-trigger-target-sign"
                  onClick={() => addSignToPractice(sign)}
                >
                  <Sparkles size={14} />
                  <span>{sign}</span>
                </button>
              ))}

              {['PLEASE', 'HELP', 'FOOD', 'WATER', 'YES', 'NO', 'STOP'].map((sign) => (
                <button
                  key={sign}
                  className="btn-trigger-common-sign"
                  onClick={() => addSignToPractice(sign)}
                >
                  <span>{sign}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scenario Selection List */}
        <div className="practice-scenarios-sidebar">
          <h3>Practice Challenges</h3>
          <p className="sidebar-sub">Select a scenario to practice</p>

          <div className="scenarios-list">
            {practiceScenarios.map((scen, idx) => {
              const isSelected = idx === selectedScenarioIndex;
              return (
                <div
                  key={scen.id}
                  className={`scenario-card ${isSelected ? 'selected-scenario' : ''}`}
                  onClick={() => {
                    setSelectedScenarioIndex(idx);
                    resetPractice();
                  }}
                >
                  <div className="scen-card-top">
                    <span className="scen-diff">{scen.difficulty}</span>
                    <span className="scen-category">{scen.category}</span>
                  </div>
                  <h4 className="scen-sentence">{scen.sentence}</h4>
                  <div className="scen-signs-preview">
                    {scen.targetSigns.join(' → ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
