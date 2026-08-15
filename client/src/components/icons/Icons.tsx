import React from 'react';

export interface IconProps {
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Prestige Player Tokens ──────────────────────────────────────────

export function FalconIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2L4 7v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V7l-8-5z" />
      <path d="M12 7l-3 4h6l-3-4z" fill={color} fillOpacity="0.3" />
      <path d="M9 14l3 3 3-3" />
      <circle cx="12" cy="11" r="1.5" fill={color} />
    </svg>
  );
}

export function CrownIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 8l3.5 7h11L21 8l-4.5 4-4.5-8-4.5 8L3 8z" fill={color} fillOpacity="0.25" />
      <path d="M5 19h14v2H5v-2z" fill={color} />
      <circle cx="3" cy="8" r="1.5" fill={color} />
      <circle cx="21" cy="8" r="1.5" fill={color} />
      <circle cx="12" cy="4" r="1.5" fill={color} />
    </svg>
  );
}

export function AnchorIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}

export function GemIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill={color} fillOpacity="0.25" />
      <path d="M10 3l2 6-4 12" />
      <path d="M14 3l-2 6 4 12" />
      <line x1="2" y1="9" x2="22" y2="9" />
    </svg>
  );
}

export function CompassIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={color} fillOpacity="0.4" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

export function ShieldIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} fillOpacity="0.25" />
      <path d="M12 7v10" />
      <path d="M8 11h8" />
    </svg>
  );
}

export function CitadelIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 21h18" />
      <path d="M5 21V7l3-3 3 3v14" fill={color} fillOpacity="0.25" />
      <path d="M13 21V7l3-3 3 3v14" fill={color} fillOpacity="0.25" />
      <path d="M9 10h6v11H9V10z" />
      <path d="M11 15h2" />
    </svg>
  );
}

export function MedallionIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9" fill={color} fillOpacity="0.2" />
      <circle cx="12" cy="12" r="6" strokeWidth="1.5" />
      <path d="M12 8v8" />
      <path d="M9.5 10.5h5" />
      <path d="M9.5 13.5h5" />
    </svg>
  );
}

// ─── Board Corners & Special Tile Badges ─────────────────────────────

export function StartFlagIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill={color} fillOpacity="0.3" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function JailBarsIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="3" x2="7" y2="21" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="17" y1="3" x2="17" y2="21" />
    </svg>
  );
}

export function VacationPalmIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 21a8 8 0 0 0 2-15" />
      <path d="M14 6C9 6 6 10 6 13c3 0 6-2 8-7z" fill={color} fillOpacity="0.3" />
      <path d="M14 6c5 0 8 4 8 7-3 0-6-2-8-7z" fill={color} fillOpacity="0.3" />
      <path d="M12 21c-2-5-1-10 2-15" />
    </svg>
  );
}

export function PoliceBadgeIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2L4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z" fill={color} fillOpacity="0.2" />
      <polygon points="12 8 13.5 11.5 17 12 14.5 14.5 15 18 12 16.5 9 18 9.5 14.5 7 12 10.5 11.5 12 8" fill={color} />
    </svg>
  );
}

export function JetlinerIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.5.2-1.8.8l-.5 1 5.5 4-3.5 3.5-3-1-1 .5 2 3.5 3.5 2 .5-1-1-3 3.5-3.5 4 5.5 1-.5c.6-.3 1-1 .8-1.8z" fill={color} fillOpacity="0.25" />
    </svg>
  );
}

export function EnergyBoltIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

export function TreasuryIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="6" width="20" height="14" rx="2" fill={color} fillOpacity="0.2" />
      <path d="M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <circle cx="12" cy="13" r="1.5" fill={color} />
    </svg>
  );
}

export function ChanceIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
    </svg>
  );
}

export function ChestIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="4" width="20" height="16" rx="2" fill={color} fillOpacity="0.2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="12" cy="14" r="2" fill={color} />
    </svg>
  );
}

export function BusinessIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={color} fillOpacity="0.2" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function RestHouseIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <circle cx="6" cy="12" r="2" fill={color} fillOpacity="0.4" />
    </svg>
  );
}

// ─── Actions, Modals & Utility Vectors ───────────────────────────────

export function HouseIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5l5 4.5v6H7v-6l5-4.5z" />
    </svg>
  );
}

export function HotelIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
      <path d="M7 2h10a2 2 0 0 1 2 2v18H5V4a2 2 0 0 1 2-2zm2 4v3h2V6H9zm4 0v3h2V6h-2zm-4 5v3h2v-3H9zm4 0v3h2v-3h-2zm-4 5v4h6v-4H9z" />
    </svg>
  );
}

export function GavelIcon({ size = 18, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m14 13-7.5 7.5c-.8.8-2 .8-2.8 0s-.8-2 0-2.8L11 10" />
      <path d="m16 16 6-6" />
      <path d="m8 8 6-6" />
      <path d="m9 7 8 8" />
      <path d="m21 11-8-8" />
    </svg>
  );
}

export function DicePairIcon({ size = 20, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="2" width="13" height="13" rx="2.5" fill={color} fillOpacity="0.2" />
      <rect x="9" y="9" width="13" height="13" rx="2.5" fill={color} fillOpacity="0.3" />
      <circle cx="6" cy="6" r="1.2" fill={color} />
      <circle cx="11" cy="11" r="1.2" fill={color} />
      <circle cx="13" cy="13" r="1.2" fill={color} />
      <circle cx="18" cy="18" r="1.2" fill={color} />
    </svg>
  );
}

export function TrophyIcon({ size = 22, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
      <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" fill={color} fillOpacity="0.2" />
      <path d="M12 16v5" />
      <path d="M8 21h8" />
    </svg>
  );
}

export function CopyIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CheckmarkIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloseIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function RefreshIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function LockIcon({ size = 14, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function SkullIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="9" cy="12" r="1.5" fill={color} />
      <circle cx="15" cy="12" r="1.5" fill={color} />
      <path d="M8 20v2h8v-2" />
      <path d="M12.5 17l-.5 1-.5-1" />
      <path d="M16 20a3 3 0 0 0 3-3V9a7 7 0 0 0-14 0v8a3 3 0 0 0 3 3" />
    </svg>
  );
}

export function WalletIcon({ size = 16, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" fill={color} fillOpacity="0.3" />
    </svg>
  );
}

export function PinIcon({ size = 14, color = 'currentColor', className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={color} fillOpacity="0.25" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ─── Real SVG Country Flags (No Text Codes, No Emojis) ─────────────

export function CountryCrestBadge({ group, size = 24 }: { group: string; size?: number }) {
  const flags: Record<string, React.ReactNode> = {
    A: (
      // Brazil
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="90" height="60" fill="#1c8a4a" />
        <polygon points="45,8 82,30 45,52 8,30" fill="#f5c518" />
        <circle cx="45" cy="30" r="12" fill="#173e78" />
      </svg>
    ),
    B: (
      // France
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="30" height="60" fill="#2d4fa3" />
        <rect x="30" width="30" height="60" fill="#f5f1e8" />
        <rect x="60" width="30" height="60" fill="#c93b3b" />
      </svg>
    ),
    C: (
      // China
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="90" height="60" fill="#b8272a" />
        <polygon points="20,7 22.6,14.8 30.8,14.8 24.2,19.6 26.8,27.4 20,22.6 13.2,27.4 15.8,19.6 9.2,14.8 17.4,14.8" fill="#f5c518" />
        <circle cx="34" cy="10" r="1.6" fill="#f5c518" />
        <circle cx="37" cy="16" r="1.6" fill="#f5c518" />
        <circle cx="36" cy="23" r="1.6" fill="#f5c518" />
        <circle cx="32" cy="27" r="1.6" fill="#f5c518" />
      </svg>
    ),
    D: (
      // Japan
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="90" height="60" fill="#f5f1e8" />
        <circle cx="45" cy="30" r="16" fill="#c9282a" />
      </svg>
    ),
    E: (
      // Italy
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="30" height="60" fill="#1e8a4c" />
        <rect x="30" width="30" height="60" fill="#f5f1e8" />
        <rect x="60" width="30" height="60" fill="#c93b3b" />
      </svg>
    ),
    F: (
      // Germany
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="90" height="20" fill="#1a1a1a" />
        <rect y="20" width="90" height="20" fill="#c93b3b" />
        <rect y="40" width="90" height="20" fill="#d4af37" />
      </svg>
    ),
    G: (
      // United Kingdom
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="90" height="60" fill="#1f2b5c" />
        <polygon points="0,0 12,0 90,54 90,60 78,60 0,6" fill="#f5f1e8" />
        <polygon points="90,0 78,0 0,54 0,60 12,60 90,6" fill="#f5f1e8" />
        <polygon points="0,0 6,0 90,57 90,60 84,60 0,3" fill="#c93b3b" />
        <polygon points="90,0 84,0 0,57 0,60 6,60 90,3" fill="#c93b3b" />
        <rect x="36" width="18" height="60" fill="#f5f1e8" />
        <rect y="21" width="90" height="18" fill="#f5f1e8" />
        <rect x="40" width="10" height="60" fill="#c93b3b" />
        <rect y="25" width="90" height="10" fill="#c93b3b" />
      </svg>
    ),
    H: (
      // USA
      <svg viewBox="0 0 90 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect width="90" height="60" fill="#f5f1e8" />
        <rect y="0" width="90" height="10" fill="#c93b3b" />
        <rect y="20" width="90" height="10" fill="#c93b3b" />
        <rect y="40" width="90" height="10" fill="#c93b3b" />
        <rect width="42" height="32" fill="#2d4fa3" />
        <circle cx="10" cy="8" r="1.6" fill="#f5f1e8" />
        <circle cx="20" cy="8" r="1.6" fill="#f5f1e8" />
        <circle cx="30" cy="8" r="1.6" fill="#f5f1e8" />
        <circle cx="10" cy="16" r="1.6" fill="#f5f1e8" />
        <circle cx="20" cy="16" r="1.6" fill="#f5f1e8" />
        <circle cx="30" cy="16" r="1.6" fill="#f5f1e8" />
        <circle cx="10" cy="24" r="1.6" fill="#f5f1e8" />
        <circle cx="20" cy="24" r="1.6" fill="#f5f1e8" />
        <circle cx="30" cy="24" r="1.6" fill="#f5f1e8" />
      </svg>
    ),
  };

  const flagSvg = flags[group];
  if (!flagSvg) return null;

  return (
    <div
      className="flag-badge"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        border: '1.5px solid rgba(255, 255, 255, 0.65)',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.7), inset 0 0 2px rgba(255, 255, 255, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {flagSvg}
    </div>
  );
}
