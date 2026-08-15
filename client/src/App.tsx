import { useState, useEffect } from 'react';
import { useVyapar } from './hooks/useVyapar';
import { LobbyHome } from './components/lobby/Lobby';
import { WaitingRoom } from './components/lobby/WaitingRoom';
import { GameView } from './components/GameView';

type AppScreen = 'home' | 'connecting' | 'connected';

function App() {
  const {
    gameState,
    playerId,
    roomId,
    connected,
    error,
    connect,
    sendIntent,
    clearError,
  } = useVyapar();

  const [pendingName, setPendingName] = useState<string>('');
  const [pendingGoti, setPendingGoti] = useState<string>('');

  const handleJoin = (roomCode: string, playerName: string, gotiId?: string) => {
    const normalizedCode = roomCode.trim().toUpperCase();
    setPendingName(playerName);
    if (gotiId) setPendingGoti(gotiId);
    window.history.replaceState(null, '', `/?room=${normalizedCode}`);
    connect(normalizedCode);
  };

  // Once connected, set the player name & goti via useEffect
  useEffect(() => {
    if (connected && playerId) {
      if (pendingName) {
        sendIntent({ type: 'setName', name: pendingName });
        setPendingName('');
      }
      if (pendingGoti) {
        sendIntent({ type: 'setGoti', gotiId: pendingGoti });
        setPendingGoti('');
      }
    }
  }, [connected, playerId, pendingName, pendingGoti, sendIntent]);

  // Determine which screen to show
  let screen: AppScreen = 'home';
  if (connected && gameState) {
    screen = 'connected';
  } else if (connected) {
    screen = 'connecting';
  }

  const isGameActive = Boolean(gameState && gameState.phase !== 'waiting');

  return (
    <div className={`app ${isGameActive ? 'in-game' : ''}`}>
      {/* Error toast */}
      {error && (
        <div className="error-toast" onClick={clearError}>
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <span className="error-dismiss">✕</span>
        </div>
      )}

      {/* Home screen */}
      {screen === 'home' && (
        <LobbyHome onJoin={handleJoin} />
      )}

      {/* Connecting screen */}
      {screen === 'connecting' && (
        <div className="connecting-screen">
          <div className="spinner" />
          <p>Connecting to room...</p>
        </div>
      )}

      {/* Connected: waiting room or game */}
      {screen === 'connected' && gameState && playerId && roomId && (
        <>
          {!isGameActive ? (
            <WaitingRoom
              gameState={gameState}
              playerId={playerId}
              roomId={roomId}
              sendIntent={sendIntent}
            />
          ) : (
            <GameView
              gameState={gameState}
              playerId={playerId}
              sendIntent={sendIntent}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
