import React from 'react';
import '../styles/Board.css';

export type Player = 'red' | 'black';

export interface BoardSquare {
  occupant: Player | null;
  isKing: boolean;
}

interface BoardProps {
  board: BoardSquare[][];
  currentPlayer: Player;
  handleSquareClick?: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({ board, currentPlayer, handleSquareClick }) => {
  // Add visual indicator for current player's turn
  const boardStyle = {
    boxShadow: `0 0 10px ${currentPlayer === 'red' ? '#ff0000' : '#000000'}`
  };
  return (
    <div className="board" style={boardStyle}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((square, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-square ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'}`}
              onClick={() => handleSquareClick?.(rowIndex, colIndex)}
            >
              {square.occupant && (
                <div
                  className={`piece ${square.occupant} ${square.isKing ? 'king' : ''}`}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
