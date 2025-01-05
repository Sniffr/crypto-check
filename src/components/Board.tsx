import React from 'react';

interface BoardProps {
  title?: string;
}

const Board: React.FC<BoardProps> = ({ title = 'Solana Checkers Board' }) => {
  return (
    <div className="board">
      <h2>{title}</h2>
      <div>Board component placeholder</div>
    </div>
  );
};

export default Board;
