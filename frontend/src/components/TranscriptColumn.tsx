import { useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import type { TranscriptChunk } from '../types';
import { formatTime } from '../utils/export';
import type { MicStatus } from '../hooks/useMicrophone';

interface Props {
  status: MicStatus;
  transcript: TranscriptChunk[];
  onStart: () => void;
  onStop: () => void;
}

export function TranscriptColumn({ status, transcript, onStart, onStop }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new chunks
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const isRecording = status === 'recording';

  return (
    <section className="column" id="transcript-column">
      <div className="column-header">
        <h2 className="column-title">1. MIC &amp; TRANSCRIPT</h2>
        <span className={`status-pill ${isRecording ? 'status-recording' : 'status-idle'}`}>
          {isRecording ? 'RECORDING' : 'IDLE'}
        </span>
      </div>

      <div className="mic-btn-wrapper">
        <button
          id="mic-toggle-btn"
          className={`mic-btn ${isRecording ? 'mic-btn--active' : ''}`}
          onClick={isRecording ? onStop : onStart}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <p className="mic-hint">
          {isRecording
            ? 'Recording… click to stop.'
            : transcript.length > 0
            ? 'Stopped. Click to resume.'
            : 'Click mic to start. Transcript appends every ~30s.'}
        </p>
      </div>

      {/* Description box — matches the reference info panel */}
      <div className="col-description-box">
        The transcript scrolls and appends new chunks every ~30 seconds while recording. Use the mic
        button to start/stop. Include an export button (not shown) so we can pull the full session.
      </div>

      <div className="transcript-list">
        {transcript.length === 0 ? (
          <p className="empty-hint">No transcript yet — start the mic.</p>
        ) : (
          transcript.map((chunk) => (
            <div key={chunk.id} className="transcript-chunk">
              <span className="transcript-time">{formatTime(chunk.timestamp)}</span>
              <p className="transcript-text">{chunk.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
