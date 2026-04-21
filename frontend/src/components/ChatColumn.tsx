import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage, Suggestion } from '../types';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string, suggestion?: Suggestion) => void;
}

export function ChatColumn({ messages, isLoading, onSend }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="column" id="chat-column">
      <div className="column-header">
        <h2 className="column-title">3. CHAT (DETAILED ANSWERS)</h2>
        <span className="session-pill">SESSION ONLY</span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-info-box">
              <p>
                Clicking a suggestion adds it to the chat and streams a detailed answer (separate
                prompt, more context). User can also type questions directly. One continuous chat per
                session — no login, no persistence.
              </p>
            </div>
            <p className="empty-hint">Click a suggestion or type a question below.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              {msg.role === 'user' ? (
                <>
                  {/* Row: YOU · CATEGORY */}
                  <div className="chat-msg-meta">
                    <span className="chat-role-label">YOU</span>
                    {msg.label && (
                      <>
                        <span className="chat-role-label">·</span>
                        <span className="chat-category-inline">{msg.label}</span>
                      </>
                    )}
                  </div>
                  {/* User bubble */}
                  <div className="chat-bubble">
                    {msg.content}
                  </div>
                </>
              ) : (
                <>
                  {/* Row: ASSISTANT */}
                  <div className="chat-msg-meta">
                    <span className="chat-role-label">ASSISTANT</span>
                  </div>
                  {/* Assistant bubble */}
                  <div className={`chat-bubble ${msg.isStreaming ? 'chat-text--streaming' : ''}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.isStreaming && <span className="cursor-blink">▌</span>}
                  </div>
                </>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          id="chat-input"
          className="chat-input"
          type="text"
          placeholder="Ask anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          id="chat-send-btn"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader size={16} className="spin" /> : <Send size={16} />}
          Send
        </button>
      </div>
    </section>
  );
}
