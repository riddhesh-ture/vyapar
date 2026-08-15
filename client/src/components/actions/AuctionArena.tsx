import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { BOARD } from '@vyapar/game-logic';
import { GavelIcon, CountryCrestBadge } from '../icons/Icons';

interface AuctionArenaProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

export function AuctionArena({ gameState, playerId, sendIntent }: AuctionArenaProps) {
  const auction = gameState.auction;
  if (!auction) return null;

  const tile = BOARD[auction.tileIndex];
  const currentBidder = auction.activeParticipants[auction.currentBidderTurnIndex];
  const isMyBid = currentBidder === playerId;
  const currentHighestBidder = gameState.players.find(p => p.id === auction.currentBidderId);
  const minBid = Math.max(auction.currentBid + 10, 10);
  const me = gameState.players.find(p => p.id === playerId);

  return (
    <div
      style={{
        padding: '16px',
        background: 'radial-gradient(ellipse at center, rgba(242, 169, 59, 0.08), rgba(18, 18, 28, 0.95))',
        borderRadius: '18px',
        border: '1.5px solid rgba(242, 169, 59, 0.35)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '8px', background: 'rgba(242, 169, 59, 0.15)', borderRadius: '10px', color: 'var(--saffron)' }}>
          <GavelIcon size={20} color="var(--saffron)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--saffron)', fontWeight: 700 }}>
            Live Auction
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-serif)' }}>
            {tile.name}
          </div>
        </div>
        {tile.group && <CountryCrestBadge group={tile.group} size={28} />}
      </div>

      {/* Current Bid Display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Highest Bid</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--saffron)' }}>
            ₹{auction.currentBid.toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: 'var(--ink-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leader</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: currentHighestBidder ? 'var(--ink)' : 'var(--ink-dim)', fontFamily: 'var(--font-serif)' }}>
            {currentHighestBidder ? currentHighestBidder.name : 'No bids yet'}
          </div>
        </div>
      </div>

      {/* Action Area */}
      {isMyBid ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--saffron)', textAlign: 'center', fontWeight: 700 }}>
            ⚡ It's your turn to bid!
          </div>
          <div className="action-btns-row">
            <button
              className="btn"
              onClick={() => sendIntent({ type: 'placeBid', amount: minBid })}
              disabled={!me || me.cash < minBid}
              style={{ fontSize: '13px' }}
            >
              Bid ₹{minBid.toLocaleString()}
            </button>
            <button
              className="btn-ghost"
              onClick={() => sendIntent({ type: 'passAuction' })}
              style={{ fontSize: '13px', color: 'var(--danger)' }}
            >
              Pass
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: 'var(--ink-dim)', textAlign: 'center', padding: '8px' }}>
          Waiting for <strong style={{ color: 'var(--ink)' }}>{gameState.players.find(p => p.id === currentBidder)?.name}</strong> to place bid...
        </div>
      )}
    </div>
  );
}
