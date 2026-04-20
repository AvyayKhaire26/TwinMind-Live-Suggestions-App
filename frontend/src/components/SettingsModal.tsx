import { useState } from 'react';
import { X, Key, FileText, MessageSquare, Sliders } from 'lucide-react';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>({ ...settings });

  const update = (key: keyof Settings, value: string | number) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⚙ Settings</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* API Key */}
          <label className="settings-label">
            <Key size={14} /> Groq API Key
          </label>
          <input
            id="api-key-input"
            className="settings-input"
            type="password"
            placeholder="gsk_..."
            value={local.apiKey}
            onChange={(e) => update('apiKey', e.target.value)}
            autoComplete="off"
          />
          <p className="settings-hint">Never stored on servers. Sent only in request headers.</p>

          <hr className="settings-divider" />

          {/* Context Windows */}
          <label className="settings-label">
            <Sliders size={14} /> Context window — Live Suggestions (chunks)
          </label>
          <input
            id="suggestions-ctx-input"
            className="settings-input settings-input--num"
            type="number"
            min={1}
            max={20}
            value={local.suggestionsContextChunks}
            onChange={(e) => update('suggestionsContextChunks', Number(e.target.value))}
          />
          <p className="settings-hint">Each chunk ≈ 30s of audio. Default: 3 (~90s)</p>

          <label className="settings-label">
            <Sliders size={14} /> Context window — Chat answers (chunks)
          </label>
          <input
            id="chat-ctx-input"
            className="settings-input settings-input--num"
            type="number"
            min={1}
            max={50}
            value={local.chatContextChunks}
            onChange={(e) => update('chatContextChunks', Number(e.target.value))}
          />
          <p className="settings-hint">Full session context by default (10 chunks = ~5 min)</p>

          <hr className="settings-divider" />

          {/* Prompts */}
          <label className="settings-label">
            <FileText size={14} /> Live Suggestions Prompt
          </label>
          <textarea
            id="suggestions-prompt-input"
            className="settings-textarea"
            value={local.suggestionsPrompt}
            onChange={(e) => update('suggestionsPrompt', e.target.value)}
            rows={10}
          />

          <label className="settings-label">
            <MessageSquare size={14} /> General Chat Prompt
          </label>
          <textarea
            id="chat-prompt-input"
            className="settings-textarea"
            value={local.chatPrompt}
            onChange={(e) => update('chatPrompt', e.target.value)}
            rows={5}
          />

          <label className="settings-label">
            <MessageSquare size={14} /> On-Click Detailed Answer Prompt
          </label>
          <textarea
            id="onclick-prompt-input"
            className="settings-textarea"
            value={local.onClickPrompt}
            onChange={(e) => update('onClickPrompt', e.target.value)}
            rows={6}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            id="save-settings-btn"
            className="btn-primary"
            onClick={() => { onSave(local); onClose(); }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
