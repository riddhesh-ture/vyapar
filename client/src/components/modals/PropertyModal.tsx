import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import {
  BOARD,
  GROUP_COUNTRIES,
  BASE_RENT,
  RENT_MULTIPLIERS,
  canBuildHouse,
  getBuildCost,
  canSellHouse,
  getHouseSellPrice,
  canMortgage,
  getMortgageValue,
  canUnmortgage,
  getUnmortgageCost,
} from '@vyapar/game-logic';
import { CountryCrestBadge, HouseIcon, HotelIcon, CloseIcon } from '../icons/Icons';

interface PropertyModalProps {
  tileIndex: number;
  gameState: GameState;
  playerId: string;
  onClose: () => void;
  sendIntent?: (intent: PlayerIntent) => void;
}

const GROUP_WASHES: Record<string, string> = {
  A: 'brazil',
  B: 'france',
  C: 'china',
  D: 'japan',
  E: 'italy',
  F: 'germany',
  G: 'uk',
  H: 'usa',
};

export function PropertyModal({
  tileIndex,
  gameState,
  playerId,
  onClose,
  sendIntent,
}: PropertyModalProps) {
  const tile = BOARD[tileIndex];
  if (!tile) return null;

  const propState = gameState.properties[tileIndex];
  const owner = propState?.ownerId
    ? gameState.players.find(p => p.id === propState.ownerId)
    : null;
  const isOwner = propState?.ownerId === playerId;
  const me = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === playerId;

  const isProperty = tile.type === 'property' && tile.group;
  const country = tile.group ? GROUP_COUNTRIES[tile.group] : '';
  const wash = tile.group ? GROUP_WASHES[tile.group] : 'special-util';
  const baseRent = tile.group ? BASE_RENT[tile.group] : 0;

  const buildCost = propState ? getBuildCost(tileIndex, propState.houses) : 0;
  const sellRefund = propState ? getHouseSellPrice(tileIndex, propState.houses) : 0;
  const mortgageVal = getMortgageValue(tileIndex);
  const unmortgageCost = getUnmortgageCost(tileIndex);

  const canBuild = sendIntent && canBuildHouse(playerId, tileIndex, gameState);
  const canSell = sendIntent && canSellHouse(playerId, tileIndex, gameState);
  const canMort = sendIntent && canMortgage(playerId, tileIndex, gameState);
  const canUnmort = sendIntent && canUnmortgage(playerId, tileIndex, gameState);

  return (
    <div className="modal-backdrop show" onClick={onClose}>
      <div className="modal-wrap" onClick={e => e.stopPropagation()}>
        {/* Floating Vector Crest Badge */}
        {tile.group ? (
          <div className="modal-flag">
            <CountryCrestBadge group={tile.group} size={36} />
          </div>
        ) : (
          <div className="modal-flag">
            <span style={{ fontSize: '20px' }}>📍</span>
          </div>
        )}

        <div className="modal-card">
          <div className={`wash ${wash}`}></div>
          <div className="perf-h" style={{ top: '22px' }}></div>
          <div className="modal-content">
            <div className="modal-name" style={{ fontSize: '32px' }}>{tile.name}</div>
            <div className="modal-sub">
              {country ? `${country} · Group ${tile.group}` : tile.type.toUpperCase()}
            </div>

            {/* Ownership Badge — v4 status-pill */}
            <div style={{ marginBottom: '18px', textAlign: 'center' }}>
              {owner ? (
                <span className="status-pill" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 16px', borderRadius: '100px',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em',
                  background: propState?.mortgaged ? 'rgba(227, 92, 92, 0.15)' : 'rgba(242, 169, 59, 0.15)',
                  border: `1px solid ${propState?.mortgaged ? 'rgba(227, 92, 92, 0.4)' : 'rgba(242, 169, 59, 0.4)'}`,
                  color: propState?.mortgaged ? '#ffb4b4' : 'var(--saffron)',
                }}>
                  <span>{isOwner ? 'Owned by You' : `Owned by ${owner.name}`}</span>
                  {propState?.mortgaged && <span>(MORTGAGED)</span>}
                  {propState && propState.houses > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                      {propState.houses === 5 ? (
                        <><HotelIcon size={12} color="#ffd18f" /><span>Hotel</span></>
                      ) : (
                        <><HouseIcon size={11} color="var(--saffron)" /><span>{propState.houses} Houses</span></>
                      )}
                    </span>
                  )}
                </span>
              ) : tile.price ? (
                <span className="status-pill" style={{
                  display: 'block', width: 'fit-content', margin: '0 auto',
                  padding: '6px 16px', borderRadius: '100px',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--ink-dim)',
                }}>
                  Unclaimed · Available to Purchase
                </span>
              ) : null}
            </div>

            {/* Rent Table for Properties */}
            {isProperty && baseRent > 0 && (
              <div className="rent-table">
                <div className="rent-head">
                  <span>When</span>
                  <span>Rent</span>
                </div>
                <div className="rent-row">
                  <span>Base Rent</span>
                  <span className="val" style={{ fontSize: '17px' }}><span className="rs">₹</span>{baseRent.toLocaleString()}</span>
                </div>
                <div className="rent-row highlight">
                  <span>With Color Set (×2)</span>
                  <span className="val" style={{ fontSize: '17px' }}><span className="rs">₹</span>{(baseRent * 2).toLocaleString()}</span>
                </div>
                <div className="rent-row">
                  <span>With 1 House</span>
                  <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[1] || 5)).toLocaleString()}</span>
                </div>
                <div className="rent-row">
                  <span>With 2 Houses</span>
                  <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[2] || 15)).toLocaleString()}</span>
                </div>
                <div className="rent-row">
                  <span>With 3 Houses</span>
                  <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[3] || 45)).toLocaleString()}</span>
                </div>
                <div className="rent-row">
                  <span>With 4 Houses</span>
                  <span className="val"><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[4] || 80)).toLocaleString()}</span>
                </div>
                <div className="rent-row">
                  <span>With Hotel</span>
                  <span className="val" style={{ color: '#ffd18f' }}><span className="rs">₹</span>{(baseRent * (RENT_MULTIPLIERS[5] || 125)).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Rent Table for Airports */}
            {tile.type === 'railway' && (
              <div className="rent-table">
                <div className="rent-head">
                  <span>Airports Owned</span>
                  <span>Rent</span>
                </div>
                <div className="rent-row">
                  <span>If 1 Airport is owned</span>
                  <span className="val"><span className="rs">₹</span>250</span>
                </div>
                <div className="rent-row">
                  <span>If 2 Airports are owned</span>
                  <span className="val"><span className="rs">₹</span>500</span>
                </div>
                <div className="rent-row">
                  <span>If 3 Airports are owned</span>
                  <span className="val"><span className="rs">₹</span>1,000</span>
                </div>
                <div className="rent-row">
                  <span>If all 4 Airports owned</span>
                  <span className="val"><span className="rs">₹</span>2,000</span>
                </div>
              </div>
            )}

            {/* Financial Stats */}
            {tile.price ? (
              <div className="stat-grid">
                <div className="stat-box">
                  <div className="stat-lbl">Price</div>
                  <div className="stat-v"><span className="rs" style={{ color: 'var(--saffron)' }}>₹</span>{tile.price.toLocaleString()}</div>
                </div>
                {tile.group ? (
                  <div className="stat-box">
                    <div className="stat-lbl">House / Hotel</div>
                    <div className="stat-v"><span className="rs" style={{ color: 'var(--saffron)' }}>₹</span>{Math.round(tile.price / 2 / 50) * 50}</div>
                  </div>
                ) : null}
                <div className="stat-box">
                  <div className="stat-lbl">Mortgage</div>
                  <div className="stat-v"><span className="rs" style={{ color: 'var(--saffron)' }}>₹</span>{mortgageVal.toLocaleString()}</div>
                </div>
              </div>
            ) : null}

            {/* Interactive Upgrades / Mortgage / Buy Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {/* Buy Button if on current turn & in buyDecision phase on this tile */}
              {!owner &&
                isMyTurn &&
                gameState.phase === 'buyDecision' &&
                me &&
                me.position === tileIndex &&
                tile.price &&
                me.cash >= tile.price &&
                sendIntent && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn"
                      style={{ flex: 1 }}
                      onClick={() => {
                        sendIntent({ type: 'buyProperty' });
                        onClose();
                      }}
                    >
                      Buy for ₹{tile.price.toLocaleString()}
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ flex: 1 }}
                      onClick={() => {
                        sendIntent({ type: 'declineBuy' });
                        onClose();
                      }}
                    >
                      Decline & Auction
                    </button>
                  </div>
                )}

              {/* House / Hotel Upgrades for Owner */}
              {isOwner && isProperty && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {canBuild && (
                    <button
                      className="btn"
                      style={{ flex: 1, padding: '9px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => sendIntent?.({ type: 'buildHouse', tileIndex })}
                    >
                      {propState?.houses === 4 ? <HotelIcon size={14} color="#0b0b12" /> : <HouseIcon size={13} color="#0b0b12" />}
                      <span>{propState?.houses === 4 ? `Build Hotel (-₹${buildCost})` : `Build House (-₹${buildCost})`}</span>
                    </button>
                  )}
                  {canSell && (
                    <button
                      className="btn-ghost"
                      style={{ flex: 1, padding: '9px 10px', fontSize: '11.5px' }}
                      onClick={() => sendIntent?.({ type: 'sellHouse', tileIndex })}
                    >
                      {propState?.houses === 5 ? `Sell Hotel (+₹${sellRefund})` : `Sell House (+₹${sellRefund})`}
                    </button>
                  )}
                </div>
              )}

              {/* Mortgage / Unmortgage action for owner */}
              {isOwner && sendIntent && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {canMort && (
                    <button
                      className="btn-ghost"
                      style={{ flex: 1, color: 'var(--danger)', borderColor: 'rgba(227,92,92,0.4)', padding: '9px 10px', fontSize: '11.5px' }}
                      onClick={() => sendIntent({ type: 'mortgage', tileIndex })}
                    >
                      Mortgage (+₹{mortgageVal.toLocaleString()})
                    </button>
                  )}
                  {canUnmort && (
                    <button
                      className="btn"
                      style={{ flex: 1, padding: '9px 10px', fontSize: '11.5px' }}
                      onClick={() => sendIntent({ type: 'unmortgage', tileIndex })}
                    >
                      Unmortgage (-₹{unmortgageCost.toLocaleString()})
                    </button>
                  )}
                </div>
              )}

              <button className="btn-ghost" onClick={onClose} style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <CloseIcon size={14} />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
