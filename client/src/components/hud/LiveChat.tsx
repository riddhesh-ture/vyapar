import React, { useState, useRef, useEffect } from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { GotiToken } from '../board/GotiToken';

interface LiveChatProps {
  gameState: GameState;
  playerId: string;
  sendIntent?: (intent: PlayerIntent) => void;
}

const QUICK_EMOJIS = ['🎲', '💰', '🚀', '🔥', '👏', '😢', '👑', '🤝'];

function SendIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MessageSquareIcon({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SmileIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

export function LiveChat({ gameState, playerId, sendIntent }: LiveChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.log.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !sendIntent) return;

    sendIntent({ type: 'chat', message: text });
    setInputMessage('');
    setShowEmojiPicker(false);
  };

  const handleSendEmoji = (emoji: string) => {
    if (!sendIntent) return;
    sendIntent({ type: 'chat', message: emoji });
    setShowEmojiPicker(false);
  };

  return (
    <div className="live-chat-panel">
      {/* Header */}
      <div className="live-chat-header">
        <div className="live-chat-title">
          <MessageSquareIcon size={15} color="var(--saffron)" />
          <span>Game Chat & Activity</span>
        </div>
        <div className="live-chat-count">
          {gameState.players.length} active
        </div>
      </div>

      {/* Messages Stream */}
      <div className="live-chat-stream">
        {gameState.log.map((entry, index) => {
          const isChat = entry.message.startsWith('💬');
          const player = entry.playerId ? gameState.players.find(p => p.id === entry.playerId) : null;
          const pIndex = entry.playerId ? gameState.players.findIndex(p => p.id === entry.playerId) : -1;
          const isMe = entry.playerId === playerId;

          if (isChat) {
            const cleanContent = entry.message.replace(/^💬\s*[^:]+:\s*/, '');
            return (
              <div key={index} className={`chat-bubble-wrap ${isMe ? 'chat-mine' : 'chat-theirs'}`}>
                {player && (
                  <div className="chat-avatar">
                    <GotiToken player={player} playerIndex={pIndex >= 0 ? pIndex : 0} size="sm" />
                  </div>
                )}
                <div className="chat-bubble">
                  <div className="chat-author">{player?.name || 'Player'}</div>
                  <div className="chat-text">{cleanContent}</div>
                </div>
              </div>
            );
          }

          // System Event
          return (
            <div key={index} className="chat-system-log">
              <span className="log-dot">•</span>
              <span className="log-msg">{entry.message}</span>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Quick Emojis Drawer */}
      {showEmojiPicker && (
        <div className="chat-quick-emojis">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              className="emoji-btn"
              onClick={() => handleSendEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      {sendIntent && (
        <form className="live-chat-input-row" onSubmit={handleSend}>
          <button
            type="button"
            className="chat-btn-icon"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            title="Add reaction"
          >
            <SmileIcon size={16} color="var(--ink-dim)" />
          </button>

          <input
            type="text"
            className="live-chat-input"
            placeholder="Say something to room..."
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            maxLength={120}
          />

          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputMessage.trim()}
            title="Send Message"
          >
            <SendIcon size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
