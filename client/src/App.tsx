import { useState, useEffect } from 'react';
import { useVyapar } from './hooks/useVyapar';
import { LobbyHome } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
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

  const handleJoin = (roomCode: string, playerName: string) => {
    setPendingName(playerName);
    connect(roomCode);
  };

  // Once connected, set the player name via useEffect
  useEffect(() => {
    if (connected && playerId && pendingName) {
      sendIntent({ type: 'setName', name: pendingName });
      setPendingName('');
    }
  }, [connected, playerId, pendingName, sendIntent]);

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
