import React, { useState } from 'react';
import '../styles/Board.css';
import Board from './Board';
import Board3D from './Board3D';
import { Player, BoardSquare } from './Board';

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
    // Handle piece selection and movement
      const clickedSquare = gameState.board[row][col];
      
      // If no piece is selected and clicked square has current player's piece
      if (!gameState.selectedPiece && clickedSquare.occupant === gameState.currentPlayer) {
        // Only allow selection if there are no mandatory captures
        // or if this piece has a capture available
        if (!hasCaptures(gameState.currentPlayer) || isValidMove(row, col, row + 2, col + 2) || 
            isValidMove(row, col, row + 2, col - 2) || isValidMove(row, col, row - 2, col + 2) || 
            isValidMove(row, col, row - 2, col - 2)) {
          setGameState(prev => ({ ...prev, selectedPiece: { row, col } }));
        }
      } 
      // If a piece is selected, try to move it
      else if (gameState.selectedPiece) {
        const isCapturing = Math.abs(row - gameState.selectedPiece.row) === 2;
        
        if (isValidMove(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col)) {
          // Create new board state
          const newBoard = gameState.board.map(row => [...row]);
          
          // Move piece
          newBoard[row][col] = {
            ...newBoard[gameState.selectedPiece.row][gameState.selectedPiece.col]
          };
          newBoard[gameState.selectedPiece.row][gameState.selectedPiece.col] = {
            occupant: null,
            isKing: false
          };
          
          // Handle capture
          if (isCapturing) {
            const jumpedRow = gameState.selectedPiece.row + Math.sign(row - gameState.selectedPiece.row);
            const jumpedCol = gameState.selectedPiece.col + Math.sign(col - gameState.selectedPiece.col);
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
          
          setGameState(prev => ({
            ...prev,
            board: newBoard,
            selectedPiece: null,
            currentPlayer: !isCapturing || !hasCaptures(prev.currentPlayer) 
              ? (prev.currentPlayer === 'red' ? 'black' : 'red')
              : prev.currentPlayer
          }));
        } else {
          // Invalid move, deselect piece
          setGameState(prev => ({ ...prev, selectedPiece: null }));
        }
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
        <h2>Local Checkers Game</h2>
        <div className="game-info">
          <div className="current-player">
            Current Player: {gameState.currentPlayer === 'red' ? 'Red' : 'Black'}
          </div>
          <button onClick={handleResetGame} className="reset-button">
            Reset Game
          </button>
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
