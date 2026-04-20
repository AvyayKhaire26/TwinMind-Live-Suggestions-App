import { useState, useCallback, useEffect } from 'react';
import { Settings, Download } from 'lucide-react';
import { TranscriptColumn } from './components/TranscriptColumn';
import { SuggestionsColumn } from './components/SuggestionsColumn';
import { ChatColumn } from './components/ChatColumn';
import { SettingsModal } from './components/SettingsModal';
import { useMicrophone } from './hooks/useMicrophone';
import { useCopilotSession } from './hooks/useCopilotSession';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { exportSession } from './utils/export';
import { DEFAULT_SETTINGS } from './constants';
import type { Suggestion, TranscriptChunk } from './types';
import './App.css';

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(!DEFAULT_SETTINGS.apiKey);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const session = useCopilotSession(settings);

  const handleChunkTranscribed = useCallback(
    (chunk: TranscriptChunk) => {
      session.addTranscriptChunk(chunk);
      setGlobalError(null);
    },
    [session]
  );

  const handleError = useCallback((msg: string) => {
    setGlobalError(msg);
  }, []);

  const mic = useMicrophone({
    apiKey: settings.apiKey,
    onChunkTranscribed: handleChunkTranscribed,
    onError: handleError,
  });

  const { secondsLeft } = useAutoRefresh({
    isActive: mic.status === 'recording',
    onRefresh: session.fetchSuggestions,
  });

  // Automatically fetch suggestions the moment the very first transcript arrives
  useEffect(() => {
    if (session.transcript.length === 1 && session.suggestionBatches.length === 0 && !session.isFetchingSuggestions) {
      session.fetchSuggestions();
    }
  }, [session.transcript.length, session.suggestionBatches.length, session.isFetchingSuggestions, session.fetchSuggestions]);

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      session.sendChatMessage(suggestion.preview, suggestion);
    },
    [session]
  );

  const handleExport = () => {
    exportSession(session.transcript, session.suggestionBatches, session.chatMessages);
  };

  const error = globalError || session.error;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">TwinMind — Live Suggestions Web App</h1>
        </div>
        <nav className="header-nav">
          <span className="header-nav-label">3-column layout · Transcript · Live Suggestions · Chat</span>
          <button
            id="export-btn"
            className="header-btn"
            onClick={handleExport}
            title="Export session as JSON"
          >
            <Download size={15} />
            Export
          </button>
          <button
            id="settings-btn"
            className="header-btn header-btn--primary"
            onClick={() => setShowSettings(true)}
            title="Open settings"
          >
            <Settings size={15} />
            Settings
          </button>
        </nav>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button onClick={() => { setGlobalError(null); session.setError(null); }}>✕</button>
        </div>
      )}

      {/* 3-Column Layout */}
      <main className="app-main">
        <TranscriptColumn
          status={mic.status}
          transcript={session.transcript}
          onStart={mic.startRecording}
          onStop={mic.stopRecording}
        />

        <SuggestionsColumn
          batches={session.suggestionBatches}
          isLoading={session.isFetchingSuggestions}
          secondsLeft={secondsLeft}
          isRecording={mic.status === 'recording'}
          onRefresh={session.fetchSuggestions}
          onSuggestionClick={handleSuggestionClick}
        />

        <ChatColumn
          messages={session.chatMessages}
          isLoading={session.isChatLoading}
          onSend={(text, suggestion) => session.sendChatMessage(text, suggestion)}
        />
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => {
            setSettings(s);
            if (!s.apiKey) setGlobalError('Add your Groq API key to use TwinMind.');
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
