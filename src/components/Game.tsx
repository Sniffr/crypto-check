import React, { useState, useEffect } from 'react';
import { 
  createGamePlaceholder, 
  joinGamePlaceholder, 
  getActiveGamesPlaceholder,
  GameState 
} from '../contracts/backendPlaceholder';
import Board from './Board';

const Game: React.FC = () => {
  const [games, setGames] = useState<GameState[]>([]);
  const [stake, setStake] = useState<number>(0.1);
  
  useEffect(() => {
    // Load active games on component mount
    const loadGames = async () => {
      const activeGames = await getActiveGamesPlaceholder();
      setGames(activeGames);
    };
    loadGames();
  }, []);

  const handleCreateGame = async () => {
    try {
      const newGame = await createGamePlaceholder(stake);
      console.log("Game created:", newGame);
      alert("Game created successfully! Check console for details.");
      // Refresh games list
      const activeGames = await getActiveGamesPlaceholder();
      setGames(activeGames);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Check console for details.");
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const joinedGame = await joinGamePlaceholder(gameId);
      console.log("Joined game:", joinedGame);
      alert("Game joined successfully! Check console for details.");
      // Refresh games list
      const activeGames = await getActiveGamesPlaceholder();
      setGames(activeGames);
    } catch (error) {
      console.error("Error joining game:", error);
      alert("Failed to join game. Check console for details.");
    }
  };

  return (
    <div className="game-container">
      <h2>Solana Checkers Game</h2>
      
      <div className="game-controls">
        <div className="create-game">
          <h3>Create New Game</h3>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(Number(e.target.value))}
            min="0.1"
            max="10"
            step="0.1"
          />
          <button onClick={handleCreateGame}>Create Game</button>
        </div>

        <div className="active-games">
          <h3>Active Games</h3>
          {games.length === 0 ? (
            <p>No active games found</p>
          ) : (
            <ul>
              {games.map((game) => (
                <li key={game.id}>
                  Game {game.id} - Stake: {game.stake} SOL
                  {game.status === 'waiting' && (
                    <button onClick={() => handleJoinGame(game.id)}>
                      Join Game
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="board-container">
        <Board title="Current Game" />
      </div>
    </div>
  );
};

export default Game;
