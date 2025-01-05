import React, { useState } from 'react';
import '../styles/Board.css';
import '../styles/Game.css';
import Board3D from './Board3D';
import { Player, BoardSquare } from './Board3D';

const createInitialBoard = (): BoardSquare[][] => {
  // Create empty 8x8 board
  const board: BoardSquare[][] = Array(8).fill(null).map(() => 
    Array(8).fill(null).map(() => ({
      occupant: null,
      isKing: false
    }))
  );

  // Initialize pieces on dark squares
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = {
            occupant: 'black',
            isKing: false
          };
        } else if (row > 4) {
          board[row][col] = {
            occupant: 'red',
            isKing: false
          };
        } else {
          board[row][col] = {
            occupant: null,
            isKing: false
          };
        }
      }
    }
  }

  // Place pieces for both players
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      // Only place pieces on dark squares (where row + col is odd)
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          // Place black pieces in first three rows
          board[row][col].occupant = 'black';
        } else if (row > 4) {
          // Place red pieces in last three rows
          board[row][col].occupant = 'red';
        }
      }
    }
  }

  return board;
};

const Game = (): JSX.Element => {
  const [gameState, setGameState] = useState<{
    board: BoardSquare[][];
    currentPlayer: Player;
    selectedPiece: {row: number; col: number} | null;
  }>({
    board: createInitialBoard(),
    currentPlayer: 'red',
    selectedPiece: null
  });



  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = gameState.board[fromRow][fromCol];
    if (!piece.occupant) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    
    // Basic movement rules
    const isForwardMove = piece.occupant === 'red' ? rowDiff < 0 : rowDiff > 0;
    const isKingMove = piece.isKing;
    
    // Check if move is diagonal
    if (colDiff !== Math.abs(rowDiff)) return false;
    
    // Normal move (distance of 1)
    if (colDiff === 1) {
      if (!isKingMove && !isForwardMove) return false;
      return gameState.board[toRow][toCol].occupant === null;
    }
    
    // Capture move (distance of 2)
    if (colDiff === 2) {
      if (!isKingMove && !isForwardMove) return false;
      
      const jumpedRow = fromRow + Math.sign(rowDiff);
      const jumpedCol = fromCol + Math.sign(toCol - fromCol);
      const jumpedPiece = gameState.board[jumpedRow][jumpedCol];
      
      return (
        jumpedPiece.occupant !== null &&
        jumpedPiece.occupant !== piece.occupant &&
        gameState.board[toRow][toCol].occupant === null
      );
    }
    
    return false;
  };

  const hasCaptures = (player: Player): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece.occupant === player) {
          // Check all possible capture moves
          const directions = piece.isKing ? [-2, 2] : (player === 'red' ? [-2] : [2]);
          for (const rowDiff of directions) {
            for (const colDiff of [-2, 2]) {
              const newRow = row + rowDiff;
              const newCol = col + colDiff;
              if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (isValidMove(row, col, newRow, newCol)) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  };

  const handleSquareClick = (row: number, col: number) => {
    console.log('Handling square click:', { row, col });
    const clickedSquare = gameState.board[row][col];
    
    // If no piece is selected and clicked square has current player's piece
    if (!gameState.selectedPiece && clickedSquare.occupant === gameState.currentPlayer) {
      const hasAvailableCapture = hasCaptures(gameState.currentPlayer);
      const pieceHasCapture = 
        isValidMove(row, col, row + 2, col + 2) || 
        isValidMove(row, col, row + 2, col - 2) || 
        isValidMove(row, col, row - 2, col + 2) || 
        isValidMove(row, col, row - 2, col - 2);
      
      console.log('Piece selection:', {
        hasAvailableCapture,
        pieceHasCapture,
        currentPlayer: gameState.currentPlayer
      });
      
      // Only allow selection if there are no mandatory captures
      // or if this piece has a capture available
      if (!hasAvailableCapture || pieceHasCapture) {
        setGameState(prev => ({ ...prev, selectedPiece: { row, col } }));
      }
    } 
    // If a piece is selected, try to move it
    else if (gameState.selectedPiece) {
      const { row: fromRow, col: fromCol } = gameState.selectedPiece;
      const isCapturing = Math.abs(row - fromRow) === 2;
      
      console.log('Attempting move:', {
        from: { row: fromRow, col: fromCol },
        to: { row, col },
        isCapturing
      });
      
      if (isValidMove(fromRow, fromCol, row, col)) {
        console.log('Move is valid, updating board state');
        // Create new board state
        const newBoard = gameState.board.map(r => r.map(square => ({...square})));
        
        // Move piece
        newBoard[row][col] = {
          ...newBoard[fromRow][fromCol]
        };
        newBoard[fromRow][fromCol] = {
          occupant: null,
          isKing: false
        };
        
        // Handle capture
        if (isCapturing) {
          const jumpedRow = fromRow + Math.sign(row - fromRow);
          const jumpedCol = fromCol + Math.sign(col - fromCol);
          newBoard[jumpedRow][jumpedCol] = {
            occupant: null,
            isKing: false
          };
        }
        
        // Check for king promotion
        if ((gameState.currentPlayer === 'red' && row === 0) || 
            (gameState.currentPlayer === 'black' && row === 7)) {
          newBoard[row][col].isKing = true;
        }
        
        // Check if the piece can make another capture
        const canContinueCapturing = isCapturing && hasCaptures(gameState.currentPlayer);
        
        console.log('Updating game state:', {
          isCapturing,
          canContinueCapturing,
          kingPromotion: newBoard[row][col].isKing
        });
        
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          selectedPiece: canContinueCapturing ? { row, col } : null,
          currentPlayer: !canContinueCapturing 
            ? (prev.currentPlayer === 'red' ? 'black' : 'red')
            : prev.currentPlayer
        }));
      } else {
        console.log('Invalid move, deselecting piece');
        // Invalid move, deselect piece
        setGameState(prev => ({ ...prev, selectedPiece: null }));
      }
    }
  };

  const handleResetGame = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'red',
      selectedPiece: null
    });
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>2-Player Checkers Game</h2>
        <div className="game-info">
          <div className={`current-player ${gameState.currentPlayer}`}>
            Current Player: {gameState.currentPlayer === 'red' ? 'Red' : 'Black'}
            {gameState.selectedPiece && (
              <div className="move-hint">
                {hasCaptures(gameState.currentPlayer) 
                  ? "Capture move available!" 
                  : "Select a valid move"}
              </div>
            )}
          </div>
          <div className="game-controls">
            <button onClick={handleResetGame} className="reset-button">
              Reset Game
            </button>
          </div>
        </div>
      </div>

      <div className="board-container">
        <Board3D
          board={gameState.board}
          selectedPiece={gameState.selectedPiece}
          onSquareClick={handleSquareClick}
          currentPlayer={gameState.currentPlayer}
        />
      </div>
    </div>
  );
};

export default Game;
