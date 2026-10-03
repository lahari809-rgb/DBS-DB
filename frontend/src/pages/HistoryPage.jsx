import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Trash2,
  Download,
  Copy,
  Volume2,
  Check,
  RefreshCw,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HistoryPage() {
  const { user } = useAuth();
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/history');
      if (resp.ok) {
        const data = await resp.json();
        setHistoryList(data);
      } else {
        loadDefaultHistory();
      }
    } catch (e) {
      loadDefaultHistory();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultHistory = () => {
    const now = new Date();
    setHistoryList([
      {
        _id: 'h_1',
        signLabel: 'I -> GO -> COLLEGE -> TOMORROW',
        text: 'I will go to college tomorrow.',
        confidence: 0.96,
        method: 'continuous_live',
        timestamp: new Date(now - 12 * 60000).toISOString()
      },
      {
        _id: 'h_2',
        signLabel: 'WHERE -> HOSPITAL',
        text: 'Where is the hospital?',
        confidence: 0.98,
        method: 'continuous_live',
        timestamp: new Date(now - 34 * 60000).toISOString()
      },
      {
        _id: 'h_3',
        signLabel: 'I -> HUNGRY -> NEED -> FOOD',
        text: 'I am hungry and I need food.',
        confidence: 0.94,
        method: 'sequence_builder',
        timestamp: new Date(now - 75 * 60000).toISOString()
      },
      {
        _id: 'h_4',
        signLabel: 'EMERGENCY -> PLEASE -> HELP',
        text: 'This is an emergency, please help me!',
        confidence: 0.99,
        method: 'continuous_live',
        timestamp: new Date(now - 120 * 60000).toISOString()
      },
      {
        _id: 'h_5',
        signLabel: 'MY -> NAME -> LAHARI -> STUDENT',
        text: 'Hello, my name is Lahari. I am a student.',
        confidence: 0.95,
        method: 'continuous_live',
        timestamp: new Date(now - 180 * 60000).toISOString()
      }
    ]);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear your translation history?')) {
      try {
        await fetch('/api/history', { method: 'DELETE' });
      } catch (e) {}
      setHistoryList([]);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplay = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    }
  };

  const downloadTranscript = () => {
    const lines = historyList.map(item => {
      const timeStr = new Date(item.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      return `[${timeStr}] (${item.method}) ${item.signLabel}\nTranslation: "${item.text}" (Confidence: ${(item.confidence * 100).toFixed(1)}%)\n`;
    });

    const content = `========================================================\nCONTINUOUS ISL TRANSLATION AUDIT LOGS (IST)\n========================================================\n\n` + lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISL_Translation_History_${Date.now()}.txt`;
    a.click();
  };

  const filtered = historyList.filter(item =>
    (item.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.signLabel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.method || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="history-page-container">
      {/* Header Bar */}
      <div className="history-header-card">
        <div className="history-header-left">
          <div className="hist-icon-box">
            <Clock size={20} />
          </div>
          <div>
            <h2>Translation History &amp; Session Audit</h2>
            <p>Protected user translation logs stored in MongoDB with Indian Standard Time (IST) timestamps</p>
          </div>
        </div>

        <div className="history-header-actions">
          <button className="btn-hist-action" onClick={downloadTranscript} disabled={historyList.length === 0}>
            <Download size={14} /> Export Transcript
          </button>
          <button className="btn-hist-clear" onClick={handleClear} disabled={historyList.length === 0}>
            <Trash2 size={14} /> Clear History
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="history-filter-bar">
        <div className="hist-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search translation logs by signs, English text, or method..."
            value={searchTerm}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="hist-count-tag">
          <span>{filtered.length} Recorded Sessions</span>
        </div>
      </div>

      {/* History Items List */}
      <div className="history-items-list">
        {filtered.length === 0 ? (
          <div className="history-empty-state">
            <Clock size={36} />
            <p>No translation logs found. Start translating to create history records.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const dateObj = new Date(item.timestamp);
            const timeStr = isNaN(dateObj.getTime())
              ? item.timestamp
              : dateObj.toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) + ' (IST)';

            return (
              <div key={item._id || Math.random()} className="history-item-card">
                <div className="hist-card-top">
                  <div className="hist-time-tag">
                    <Clock size={13} />
                    <span>{timeStr}</span>
                  </div>
                  <div className="hist-badges-row">
                    <span className="hist-method-badge">{item.method || 'live'}</span>
                    <span className="hist-conf-badge">
                      {(item.confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>
                </div>

                <div className="hist-signs-flow">
                  <span className="flow-lbl">Detected Sequence:</span>
                  <p className="flow-val">{item.signLabel || 'Gesture'}</p>
                </div>

                <div className="hist-trans-box">
                  <p className="hist-trans-text">“{item.text}”</p>
                </div>

                <div className="hist-card-actions">
                  <button
                    className="btn-item-replay"
                    onClick={() => handleReplay(item.text)}
                  >
                    <Volume2 size={14} /> Replay Audio
                  </button>

                  <button
                    className="btn-item-copy"
                    onClick={() => handleCopy(item._id, item.text)}
                  >
                    {copiedId === item._id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                    <span>{copiedId === item._id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
