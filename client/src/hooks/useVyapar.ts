import { useState, useEffect, useCallback, useRef } from 'react';
import PartySocket from 'partysocket';
import type { GameState, PlayerIntent, ServerMessage } from '@vyapar/game-logic';

const PARTY_HOST = import.meta.env.VITE_PARTY_HOST || 'localhost:1999';

interface UseVyaparReturn {
  /** Current game state from the server */
  gameState: GameState | null;
  /** This player's ID (assigned on connect) */
  playerId: string | null;
  /** Room ID */
  roomId: string | null;
  /** Whether we're connected */
  connected: boolean;
  /** Last error message */
  error: string | null;
  /** Connect to a room */
  connect: (roomId: string) => void;
  /** Disconnect from the room */
  disconnect: () => void;
  /** Send a player intent to the server */
  sendIntent: (intent: PlayerIntent) => void;
  /** Clear error */
  clearError: () => void;
}

export function useVyapar(): UseVyaparReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<PartySocket | null>(null);

  const connect = useCallback((newRoomId: string) => {
    // Disconnect existing socket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new PartySocket({
      host: PARTY_HOST,
      room: newRoomId,
    });

    socket.addEventListener('open', () => {
      setConnected(true);
      setRoomId(newRoomId);
      setError(null);
    });

    socket.addEventListener('message', (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;

        switch (message.type) {
          case 'gameState':
            setGameState(message.state);
            break;
          case 'roomInfo':
            setPlayerId(message.playerId);
            setRoomId(message.roomId);
            break;
          case 'error':
            setError(message.message);
            // Auto-clear error after 5 seconds
            setTimeout(() => setError(null), 5000);
            break;
        }
      } catch {
        console.error('Failed to parse server message');
      }
    });

    socket.addEventListener('close', () => {
      setConnected(false);
    });

    socket.addEventListener('error', () => {
      setError('Connection error. Make sure the server is running.');
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
    setGameState(null);
    setPlayerId(null);
    setRoomId(null);
  }, []);

  const sendIntent = useCallback((intent: PlayerIntent) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(intent));
    } else {
      setError('Not connected to server.');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

  return {
    gameState,
    playerId,
    roomId,
    connected,
    error,
    connect,
    disconnect,
    sendIntent,
    clearError,
  };
}

/**
 * Generate a random 6-character room code.
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for readability
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
