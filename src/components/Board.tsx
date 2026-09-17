import React from 'react';
import { Cell as CellType, GameStatus } from '../types';
import { CellComponent } from './Cell';

interface BoardProps {
  board: CellType[][];
  gameStatus: GameStatus;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onRevealAdjacent: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  gameStatus,
  onCellClick,
  onCellRightClick,
  onRevealAdjacent,
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="inline-block border-2 border-gray-600 bg-gray-300 p-1 rounded shadow-lg"
      onContextMenu={handleContextMenu}
    >
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((cell, colIndex) => (
            <CellComponent
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              gameStatus={gameStatus}
              onClick={() => onCellClick(rowIndex, colIndex)}
              onRightClick={(e) => {
                e.preventDefault();
                onCellRightClick(rowIndex, colIndex);
              }}
              onMiddleClick={() => onRevealAdjacent(rowIndex, colIndex)}
              onLongPress={() => onCellRightClick(rowIndex, colIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
