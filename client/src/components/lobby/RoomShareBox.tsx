import React, { useState } from 'react';
import { CopyIcon, CheckmarkIcon } from '../icons/Icons';

interface RoomShareBoxProps {
  roomId: string;
}

export function RoomShareBox({ roomId }: RoomShareBoxProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/?room=${roomId.toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="share-box">
      <input type="text" readOnly value={shareUrl} />
      <button
        type="button"
        className="btn-ghost"
        onClick={handleCopy}
        style={{
          padding: '8px 14px',
          fontSize: '12px',
          minWidth: '85px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: copied ? 'var(--saffron)' : undefined,
          borderColor: copied ? 'var(--saffron)' : undefined,
        }}
      >
        {copied ? (
          <>
            <CheckmarkIcon size={14} color="var(--saffron)" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <CopyIcon size={14} />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
