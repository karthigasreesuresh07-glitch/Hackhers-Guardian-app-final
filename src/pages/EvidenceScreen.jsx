import { useState } from 'react'
import { useEmergency } from '../contexts/EmergencyContext'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import BackButton from '../components/BackButton'
import {
  Mic, Video, Square, Play, Trash2, FileAudio, FileVideo,
  Clock, Download, Volume2, Pause
} from 'lucide-react'
import { formatTime, formatDate } from '../utils/formatters'

export default function EvidenceScreen() {
  const { evidence, addEvidence, deleteEvidence } = useEmergency()
  const { isRecording, mediaType, duration, startRecording, stopRecording } = useMediaRecorder()
  const [playingId, setPlayingId] = useState(null)

  const handleStartAudio = async () => {
    try {
      await startRecording('audio')
    } catch (err) {
      alert('Microphone permission is required to record audio.')
    }
  }

  const handleStartVideo = async () => {
    try {
      await startRecording('video')
    } catch (err) {
      alert('Camera & microphone permissions are required.')
    }
  }

  const handleStop = async () => {
    const result = await stopRecording()
    if (result) {
      addEvidence({
        type: result.type,
        url: result.url,
        duration: result.duration,
        name: `${result.type === 'video' ? 'Video' : 'Audio'} Recording`
      })
    }
  }

  return (
    <div className="page" id="evidence-screen">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <h1 className="page-title">Evidence</h1>
        </div>
        <span className="badge badge-info">{evidence.length} Files</span>
      </div>

      {/* Recording Controls */}
      <div className="evidence-controls animate-fadeInUp">
        {isRecording ? (
          <div className="evidence-recording-active">
            <div className="evidence-rec-indicator">
              <div className="evidence-rec-dot" />
              <span>Recording {mediaType === 'video' ? 'Video' : 'Audio'}</span>
            </div>
            <span className="evidence-rec-timer">{formatTime(duration)}</span>
            <button className="evidence-stop-btn" onClick={handleStop} id="stop-recording-btn">
              <Square size={14} fill="white" /> Stop
            </button>
          </div>
        ) : (
          <div className="evidence-record-btns">
            <button className="evidence-record-btn" onClick={handleStartAudio} id="record-audio-btn">
              <div className="evidence-record-icon audio">
                <Mic size={24} />
              </div>
              <span className="evidence-record-label">Record Audio</span>
              <span className="evidence-record-hint">Microphone capture</span>
            </button>
            <button className="evidence-record-btn" onClick={handleStartVideo} id="record-video-btn">
              <div className="evidence-record-icon video">
                <Video size={24} />
              </div>
              <span className="evidence-record-label">Record Video</span>
              <span className="evidence-record-hint">Camera + audio capture</span>
            </button>
          </div>
        )}
      </div>

      {/* Evidence List */}
      <div className="evidence-list">
        {evidence.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Volume2 size={32} />
            </div>
            <p className="empty-state-title">No Evidence Recorded</p>
            <p className="empty-state-desc">Record audio or video during an emergency for secure evidence capture</p>
          </div>
        ) : (
          evidence.map((item, i) => (
            <div key={item.id} className="evidence-card animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`evidence-card-icon ${item.type}`}>
                {item.type === 'video' ? <FileVideo size={20} /> : <FileAudio size={20} />}
              </div>
              <div className="evidence-card-info">
                <p className="evidence-card-name">{item.name}</p>
                <div className="evidence-card-meta">
                  <span><Clock size={11} /> {item.duration ? formatTime(item.duration) : '0:00'}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
              <div className="evidence-card-actions">
                {item.url && (
                  <button className="contact-action-btn" onClick={() => {
                    const a = document.createElement('a')
                    a.href = item.url
                    a.download = `evidence_${item.id}.webm`
                    a.click()
                  }}>
                    <Download size={14} />
                  </button>
                )}
                {item.url && (
                  <button className="contact-action-btn call" onClick={() => {
                    if (playingId === item.id) {
                      setPlayingId(null)
                    } else {
                      setPlayingId(item.id)
                      const el = item.type === 'video'
                        ? document.createElement('video')
                        : document.createElement('audio')
                      el.src = item.url
                      el.play()
                      el.onended = () => setPlayingId(null)
                    }
                  }}>
                    {playingId === item.id ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                )}
                <button className="contact-action-btn delete" onClick={() => deleteEvidence(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .evidence-controls {
          margin-bottom: 24px;
        }
        .evidence-record-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .evidence-record-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 28px 16px 22px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-2xl);
          cursor: pointer;
          transition: all var(--transition-base);
          color: var(--text-secondary);
          font-family: var(--font-family);
          position: relative;
          overflow: hidden;
        }
        .evidence-record-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
        }
        .evidence-record-btn:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-strong);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .evidence-record-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .evidence-record-icon.audio {
          background: var(--accent-red-surface);
          color: var(--accent-red);
        }
        .evidence-record-icon.video {
          background: var(--accent-blue-surface);
          color: var(--accent-blue);
        }
        .evidence-record-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .evidence-record-hint {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }
        .evidence-recording-active {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          background: var(--accent-red-surface);
          border: 1px solid rgba(244,63,94,0.12);
          border-radius: var(--radius-2xl);
          animation: borderGlow 2.5s infinite;
        }
        .evidence-rec-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          font-weight: 600;
          font-size: 14px;
          color: var(--accent-red);
        }
        .evidence-rec-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-red);
          animation: glow 1s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(244,63,94,0.4);
        }
        .evidence-rec-timer {
          font-size: 22px;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--text-primary);
          letter-spacing: 0.02em;
        }
        .evidence-stop-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border: none;
          border-radius: var(--radius-lg);
          background: var(--gradient-red);
          color: white;
          font-family: var(--font-family);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: var(--shadow-red);
        }
        .evidence-stop-btn:hover {
          transform: translateY(-1px);
        }
        .evidence-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .evidence-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          transition: all var(--transition-base);
        }
        .evidence-card:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-strong);
        }
        .evidence-card-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .evidence-card-icon.audio {
          background: var(--accent-red-surface);
          color: var(--accent-red);
        }
        .evidence-card-icon.video {
          background: var(--accent-blue-surface);
          color: var(--accent-blue);
        }
        .evidence-card-info { flex: 1; min-width: 0; }
        .evidence-card-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 3px;
        }
        .evidence-card-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--text-tertiary);
        }
        .evidence-card-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .evidence-card-actions {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </div>
  )
}
