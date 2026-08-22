import React, { useState, useEffect, useRef } from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import {
  BOARD,
  BASE_RENT,
  RENT_MULTIPLIERS,
  RAILWAY_RENT,
  GROUP_COUNTRIES,
} from '@vyapar/game-logic';
import {
  GavelIcon,
  CountryCrestBadge,
  JetlinerIcon,
  EnergyBoltIcon,
} from '../icons/Icons';

interface AuctionOverlayProps {
  gameState: GameState;
  playerId: string;
  sendIntent: (intent: PlayerIntent) => void;
}

/** Quick-bid increments, richup style tuned for ₹ scale */
const INCREMENTS = [50, 100, 500];

/** Timer bar duration per bid turn in ms */
const TURN_DURATION_MS = 5_000;

export function AuctionOverlay({ gameState, playerId, sendIntent }: AuctionOverlayProps) {
  const auction = gameState.auction;
  const [customBid, setCustomBid] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const hasAutoPassedRef = useRef(false);

  const currentBidder = auction ? auction.activeParticipants[auction.currentBidderTurnIndex] : null;
  const isMyBid = currentBidder === playerId;
  const me = gameState.players.find(p => p.id === playerId);
  const highestBidder = auction ? gameState.players.find(p => p.id === auction.currentBidderId) : null;
  const currentBidderPlayer = currentBidder ? gameState.players.find(p => p.id === currentBidder) : null;

  // Reset timer when bidder changes
  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    hasAutoPassedRef.current = false;

    const id = setInterval(() => {
      const ms = Date.now() - startRef.current;
      setElapsed(ms);
      if (ms >= TURN_DURATION_MS) {
        clearInterval(id);
        if (isMyBid && !hasAutoPassedRef.current) {
          hasAutoPassedRef.current = true;
          sendIntent({ type: 'passAuction' });
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [auction?.currentBidderTurnIndex, isMyBid, sendIntent]);

  if (!auction) return null;

  const tile = BOARD[auction.tileIndex];
  const minBid = Math.max(auction.currentBid + 10, 10);
  const timerPct = Math.min((elapsed / TURN_DURATION_MS) * 100, 100);
  const timerSecs = Math.max(0, Math.ceil((TURN_DURATION_MS - elapsed) / 1000));

  const handleCustomBid = () => {
    const amount = parseInt(customBid, 10);
    if (!isNaN(amount) && amount >= minBid && (!me || me.cash >= amount)) {
      sendIntent({ type: 'placeBid', amount });
      setCustomBid('');
    }
  };

  // Build the rent / info table for the property card
  const rentRows = buildRentRows(tile);

  return (
    <div className="auction-overlay">
      <div className="ao-backdrop" />
      <div className="ao-modal">
        {/* Left: Auction controls */}
        <div className="ao-left">

          {/* Header */}
          <div className="ao-header-label">Auction</div>
          <div className="ao-property-header">
            <div className="ao-property-icon">
              {tile.type === 'railway' && <JetlinerIcon size={28} color="var(--saffron)" />}
              {tile.type === 'utility' && <EnergyBoltIcon size={28} color="var(--saffron)" />}
              {tile.type === 'property' && tile.group && (
                <CountryCrestBadge group={tile.group} size={36} />
              )}
            </div>
            <div className="ao-property-name">{tile.name}</div>
          </div>

          {/* Current bid display */}
          <div className="ao-bid-section">
            <div className="ao-bid-label">Current bid</div>
            <div className="ao-bid-amount">
              <span className="rs">₹</span>
              {auction.currentBid > 0 ? auction.currentBid.toLocaleString() : '—'}
            </div>
            {highestBidder && (
              <div className="ao-bid-leader">
                🏆 {highestBidder.name} is winning
              </div>
            )}
          </div>

          {/* Timer bar */}
          {isMyBid && (
            <div className="ao-timer-row">
              <div className="ao-timer-bar-track">
                <div
                  className="ao-timer-bar-fill"
                  style={{ width: `${100 - timerPct}%` }}
                />
              </div>
              <span className="ao-timer-secs">Ends in {timerSecs}s</span>
            </div>
          )}

          {/* Who's bidding now */}
          <div className="ao-bidder-row">
            {isMyBid ? (
              <div className="ao-my-turn-badge">⚡ I'm bidding…</div>
            ) : (
              <div className="ao-other-turn-badge">
                <div className="ao-other-dot" />
                {currentBidderPlayer?.name ?? '…'} is bidding
              </div>
            )}
          </div>

          {/* Bid buttons */}
          {isMyBid ? (
            <div className="ao-bid-actions">
              {/* Quick increment buttons — richup style */}
              <div className="ao-quick-row">
                {INCREMENTS.map(inc => {
                  const total = auction.currentBid + inc;
                  const canAfford = !me || me.cash >= total;
                  return (
                    <button
                      key={inc}
                      className={`ao-quick-btn ${canAfford ? '' : 'ao-quick-btn-disabled'}`}
                      disabled={!canAfford}
                      onClick={() => sendIntent({ type: 'placeBid', amount: total })}
                    >
                      <span className="ao-quick-total">₹{total.toLocaleString()}</span>
                      <span className="ao-quick-inc">+₹{inc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Min bid + Pass row */}
              <div className="ao-main-row">
                <button
                  className="btn ao-bid-btn"
                  disabled={!me || me.cash < minBid}
                  onClick={() => sendIntent({ type: 'placeBid', amount: minBid })}
                >
                  Bid ₹{minBid.toLocaleString()}
                </button>
                <button
                  className="btn-ghost ao-pass-btn"
                  onClick={() => sendIntent({ type: 'passAuction' })}
                >
                  Pass
                </button>
              </div>

              {/* Custom amount */}
              <div className="ao-custom-row">
                <input
                  type="number"
                  className="ao-custom-input"
                  placeholder={`Custom amount (min ₹${minBid})`}
                  value={customBid}
                  min={minBid}
                  onChange={e => setCustomBid(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomBid()}
                />
                <button
                  className="btn-ghost ao-custom-go"
                  disabled={!customBid || parseInt(customBid) < minBid}
                  onClick={handleCustomBid}
                >
                  <GavelIcon size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="ao-spectate-msg">
              Waiting for {currentBidderPlayer?.name ?? 'player'} to bid…
            </div>
          )}

          {/* Participants status row */}
          <div className="ao-participants">
            {auction.activeParticipants.map(pid => {
              const p = gameState.players.find(pl => pl.id === pid);
              const isCurrent = pid === currentBidder;
              const hasPassed = auction.passed.includes(pid);
              const isWinner = pid === auction.currentBidderId;
              return (
                <div
                  key={pid}
                  className={[
                    'ao-participant',
                    isCurrent ? 'ao-p-current' : '',
                    hasPassed ? 'ao-p-passed' : '',
                    isWinner && !hasPassed ? 'ao-p-winning' : '',
                  ].join(' ')}
                >
                  <span className="ao-p-name">{p?.name ?? '?'}</span>
                  {hasPassed && <span className="ao-p-badge">Passed</span>}
                  {isCurrent && !hasPassed && <span className="ao-p-badge ao-p-active">Bidding</span>}
                  {isWinner && !isCurrent && !hasPassed && <span className="ao-p-badge ao-p-win">Winning</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Property info card */}
        <div className="ao-right">
          <div className="ao-info-card">
            <div className="ao-info-icon">
              {tile.type === 'railway' && <JetlinerIcon size={32} color="var(--saffron)" />}
              {tile.type === 'utility' && <EnergyBoltIcon size={32} color="var(--saffron)" />}
              {tile.type === 'property' && tile.group && (
                <CountryCrestBadge group={tile.group} size={44} />
              )}
            </div>
            <div className="ao-info-name">{tile.name}</div>
            {tile.group && (
              <div className="ao-info-country">{GROUP_COUNTRIES[tile.group]}</div>
            )}

            {/* Rent table */}
            {rentRows.length > 0 && (
              <div className="ao-rent-table">
                <div className="ao-rent-header">
                  <span>When</span>
                  <span>Rent</span>
                </div>
                {rentRows.map((row, i) => (
                  <div key={i} className="ao-rent-row">
                    <span className="ao-rent-when">{row.when}</span>
                    <span className="ao-rent-val">₹{row.rent.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="ao-info-price-row">
              <span className="ao-info-price-label">Price</span>
              <span className="ao-info-price-val">₹{tile.price?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Build readable rent rows based on tile type */
function buildRentRows(tile: typeof BOARD[number]) {
  if (tile.type === 'railway') {
    return [
      { when: '1 airport owned', rent: RAILWAY_RENT[1] },
      { when: '2 airports owned', rent: RAILWAY_RENT[2] },
      { when: '3 airports owned', rent: RAILWAY_RENT[3] },
      { when: '4 airports owned', rent: RAILWAY_RENT[4] },
    ];
  }
  if (tile.type === 'utility') {
    return [
      { when: '1 utility owned', rent: 0, note: '×4 dice' },
      { when: 'both utilities', rent: 0, note: '×10 dice' },
    ];
  }
  if (tile.type === 'property' && tile.group) {
    const base = BASE_RENT[tile.group];
    return [
      { when: '1 house', rent: base * RENT_MULTIPLIERS[1] },
      { when: '2 houses', rent: base * RENT_MULTIPLIERS[2] },
      { when: '3 houses', rent: base * RENT_MULTIPLIERS[3] },
      { when: '4 houses', rent: base * RENT_MULTIPLIERS[4] },
      { when: 'Hotel', rent: base * RENT_MULTIPLIERS[5] },
    ];
  }
  return [];
}
