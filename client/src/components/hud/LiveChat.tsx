import React, { useState, useRef, useEffect } from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { Send, MessageSquare, Smile } from 'lucide-react';
import { GotiToken } from '../board/GotiToken';

interface LiveChatProps {
  gameState: GameState;
  playerId: string;
  sendIntent?: (intent: PlayerIntent) => void;
}

const QUICK_EMOJIS = ['🎲', '💰', '🚀', '🔥', '👏', '😢', '👑', '🤝'];

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
          <MessageSquare size={15} color="var(--saffron)" />
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
            <Smile size={16} color="var(--ink-dim)" />
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
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
