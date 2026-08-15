import React from 'react';
import type { GameState, PlayerIntent } from '@vyapar/game-logic';
import { TreasuryIcon, VacationPalmIcon, GavelIcon, JailBarsIcon, StartFlagIcon } from '../icons/Icons';

interface RuleSettingsCardProps {
  gameState: GameState;
  isHost: boolean;
  sendIntent: (intent: PlayerIntent) => void;
}

export function RuleSettingsCard({ gameState, isHost, sendIntent }: RuleSettingsCardProps) {
  const handleToggle = (key: 'freeParkingJackpot' | 'auctionOnDecline' | 'rollTwelveToStart') => {
    if (!isHost) return;
    sendIntent({
      type: 'updateConfig',
      config: { [key]: !gameState.config[key] },
    });
  };

  return (
    <div className="settings-card">
      <div className="settings-title">Game Rules & Settings</div>
      <div className="settings-hint">
        {isHost ? 'As room host, you can customize the rules below before starting.' : 'Rules configured by host:'}
      </div>

      <div className="rule-row">
        <div className="rule-icon"><StartFlagIcon size={18} color="var(--ink-dim)" /></div>
        <div className="rule-text">
          <div className="rule-title">No GO bonus</div>
          <div className="rule-desc">Passing or landing on GO pays nothing — standard Vyapar rule</div>
        </div>
        <div className="toggle on locked" title="Standard rule"></div>
      </div>

      <div className="rule-row">
        <div className="rule-icon"><TreasuryIcon size={18} color="var(--saffron)" /></div>
        <div className="rule-text">
          <div className="rule-title">×2 rent on full sets</div>
          <div className="rule-desc">Owning every property in a group doubles base rent before building houses</div>
        </div>
        <div className="toggle on locked" title="Standard rule"></div>
      </div>

      <div
        className="rule-row"
        style={{ cursor: isHost ? 'pointer' : 'default' }}
        onClick={() => handleToggle('freeParkingJackpot')}
      >
        <div className="rule-icon"><VacationPalmIcon size={18} color="#5ce39a" /></div>
        <div className="rule-text">
          <div className="rule-title">Vacation jackpot</div>
          <div className="rule-desc">Landing on Vacation earns accumulated tax pool</div>
        </div>
        <div className={`toggle ${gameState.config.freeParkingJackpot ? 'on' : ''} ${!isHost ? 'locked' : ''}`}></div>
      </div>

      <div
        className="rule-row"
        style={{ cursor: isHost ? 'pointer' : 'default' }}
        onClick={() => handleToggle('auctionOnDecline')}
      >
        <div className="rule-icon"><GavelIcon size={18} color="var(--saffron)" /></div>
        <div className="rule-text">
          <div className="rule-title">Auction on decline</div>
          <div className="rule-desc">If a player skips buying, it goes to highest bidder</div>
        </div>
        <div className={`toggle ${gameState.config.auctionOnDecline ? 'on' : ''} ${!isHost ? 'locked' : ''}`}></div>
      </div>

      <div className="rule-row">
        <div className="rule-icon"><JailBarsIcon size={18} color="#ff9d6c" /></div>
        <div className="rule-text">
          <div className="rule-title">Jail Fine ₹{gameState.config.jailFine}</div>
          <div className="rule-desc">Pay fine or roll doubles to leave jail</div>
        </div>
        <div className="toggle on locked"></div>
      </div>
    </div>
  );
}
