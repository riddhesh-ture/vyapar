import React, { useState } from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { GavelIcon, CountryCrestBadge } from '../icons/Icons';

interface AuctionArenaProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

const QUICK_BIDS = [50, 100, 500];

export function AuctionArena({ gameState, playerId, sendIntent }: AuctionArenaProps) {
  const [customBid, setCustomBid] = useState('');
  const auction = gameState.auction;
  if (!auction) return null;

  const tile = BOARD[auction.tileIndex];
  const currentBidder = auction.activeParticipants[auction.currentBidderTurnIndex];
  const isMyBid = currentBidder === playerId;
  const currentHighestBidder = gameState.players.find(p => p.id === auction.currentBidderId);
  const minBid = Math.max(auction.currentBid + 10, 10);
  const me = gameState.players.find(p => p.id === playerId);

  const handleCustomBid = () => {
    const amount = parseInt(customBid, 10);
    if (!isNaN(amount) && amount >= minBid) {
      sendIntent({ type: 'placeBid', amount });
      setCustomBid('');
    }
  };

  return (
    <div className="aa-card">
      {/* Header */}
      <div className="aa-header">
        <div className="aa-header-left">
          <div className="aa-eyebrow">Live Auction</div>
          <div className="aa-title">{tile.name}</div>
          {tile.group && (
            <div className="aa-subtitle">Group {tile.group} · ₹{tile.price?.toLocaleString()}</div>
          )}
        </div>
        {tile.group && <CountryCrestBadge group={tile.group} size={36} />}
      </div>

      {/* Current bid display */}
      <div className="aa-bid-display">
        <div className="aa-bid-left">
          <div className="aa-bid-label">Highest Bid</div>
          <div className="aa-bid-amount">
            <span className="rs">₹</span>
            {auction.currentBid > 0 ? auction.currentBid.toLocaleString() : '—'}
          </div>
        </div>
        <div className="aa-bid-right">
          <div className="aa-bid-label">Leader</div>
          <div className="aa-bid-leader">
            {currentHighestBidder?.name ?? 'No bids yet'}
          </div>
        </div>
      </div>

      {/* Participants status */}
      <div className="aa-participants">
        {auction.activeParticipants.map(pid => {
          const p = gameState.players.find(pl => pl.id === pid);
          const isCurrent = pid === currentBidder;
          const hasPassed = auction.passed.includes(pid);
          return (
            <div
              key={pid}
              className={`aa-participant ${isCurrent ? 'aa-participant-active' : ''} ${hasPassed ? 'aa-participant-passed' : ''}`}
            >
              <span className="aa-p-name">{p?.name ?? '?'}</span>
              {hasPassed && <span className="aa-p-tag">Passed</span>}
              {isCurrent && !hasPassed && <span className="aa-p-tag aa-p-tag-active">Bidding</span>}
            </div>
          );
        })}
      </div>

      {/* Action area */}
      {isMyBid ? (
        <div className="aa-actions">
          <div className="aa-my-turn-label">⚡ Your turn to bid!</div>

          {/* Quick bid buttons */}
          <div className="aa-quick-bids">
            {QUICK_BIDS.map(inc => {
              const amount = auction.currentBid + inc;
              const canAfford = !me || me.cash >= amount;
              return (
                <button
                  key={inc}
                  className="btn-ghost aa-quick-btn"
                  disabled={!canAfford}
                  onClick={() => sendIntent({ type: 'placeBid', amount })}
                >
                  +₹{inc}
                </button>
              );
            })}
          </div>

          {/* Min bid + custom */}
          <div className="aa-main-bid-row">
            <button
              className="btn aa-bid-btn"
              onClick={() => sendIntent({ type: 'placeBid', amount: minBid })}
              disabled={!me || me.cash < minBid}
            >
              Bid ₹{minBid.toLocaleString()}
            </button>
            <button
              className="btn-ghost aa-pass-btn"
              onClick={() => sendIntent({ type: 'passAuction' })}
            >
              Pass
            </button>
          </div>

          {/* Custom bid input */}
          <div className="aa-custom-row">
            <input
              type="number"
              className="aa-custom-input"
              placeholder={`Min ₹${minBid}`}
              value={customBid}
              min={minBid}
              onChange={e => setCustomBid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomBid()}
            />
            <button
              className="btn-ghost aa-custom-btn"
              onClick={handleCustomBid}
              disabled={!customBid || parseInt(customBid) < minBid}
            >
              <GavelIcon size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="aa-waiting">
          <div className="aa-waiting-dot" />
          <span>Waiting for <strong>{gameState.players.find(p => p.id === currentBidder)?.name ?? '…'}</strong></span>
        </div>
      )}
    </div>
  );
}
