import React from 'react';
import {
  FalconIcon,
  CrownIcon,
  AnchorIcon,
  GemIcon,
  CompassIcon,
  ShieldIcon,
  CitadelIcon,
  MedallionIcon,
  type IconProps,
} from './components/icons/Icons';

export interface Goti {
  id: string;
  name: string;
  className: string;
  renderIcon: (props?: IconProps) => React.ReactNode;
}

export const GOTIS: readonly Goti[] = [
  { id: 'falcon', name: 'Falcon', className: 'goti-falcon', renderIcon: (props) => React.createElement(FalconIcon, props) },
  { id: 'crown', name: 'Crown', className: 'goti-crown', renderIcon: (props) => React.createElement(CrownIcon, props) },
  { id: 'anchor', name: 'Anchor', className: 'goti-anchor', renderIcon: (props) => React.createElement(AnchorIcon, props) },
  { id: 'gem', name: 'Gem', className: 'goti-gem', renderIcon: (props) => React.createElement(GemIcon, props) },
  { id: 'compass', name: 'Compass', className: 'goti-compass', renderIcon: (props) => React.createElement(CompassIcon, props) },
  { id: 'shield', name: 'Shield', className: 'goti-shield', renderIcon: (props) => React.createElement(ShieldIcon, props) },
  { id: 'citadel', name: 'Citadel', className: 'goti-citadel', renderIcon: (props) => React.createElement(CitadelIcon, props) },
  { id: 'medallion', name: 'Medallion', className: 'goti-medallion', renderIcon: (props) => React.createElement(MedallionIcon, props) },
] as const;

export function getGotiForPlayer(player: { gotiId?: string } | undefined, fallbackIndex: number): Goti {
  if (player?.gotiId) {
    const found = GOTIS.find(g => g.id === player.gotiId);
    if (found) return found;
  }
  return GOTIS[fallbackIndex % GOTIS.length] ?? GOTIS[0];
}

export function getGotiForPlayerIndex(playerIndex: number): Goti {
  return GOTIS[playerIndex % GOTIS.length] ?? GOTIS[0];
}
