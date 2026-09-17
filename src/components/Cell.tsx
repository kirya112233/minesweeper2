import React from 'react';
import { Cell as CellType, GameStatus } from '../types';

interface CellProps {
  cell: CellType;
  gameStatus: GameStatus;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  onMiddleClick: () => void;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-700',
  5: 'text-red-800',
  6: 'text-teal-600',
  7: 'text-black',
  8: 'text-gray-600',
};

export const CellComponent: React.FC<CellProps> = React.memo(({
  cell,
  gameStatus,
  onClick,
  onRightClick,
  onMiddleClick,
}) => {
  const { isMine, isRevealed, isFlagged, adjacentMines } = cell;

  const getCellContent = () => {
    if (isFlagged && !isRevealed) return '🚩';
    if (!isRevealed) return '';
    if (isMine) return '💣';
    if (adjacentMines > 0) return adjacentMines.toString();
    return '';
  };

  const getCellClasses = () => {
    const base = 'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base font-bold select-none transition-all duration-100 border';

    if (!isRevealed) {
      return `${base} bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500 hover:from-gray-250 hover:to-gray-350 cursor-pointer active:from-gray-400 active:to-gray-500 shadow-sm hover:shadow-md`;
    }

    if (isRevealed && isMine) {
      if (gameStatus === 'lost') {
        return `${base} bg-red-500 border-red-600`;
      }
      return `${base} bg-gray-200 border-gray-300`;
    }

    if (isRevealed) {
      return `${base} bg-gray-100 border-gray-200 ${adjacentMines > 0 ? NUMBER_COLORS[adjacentMines] || 'text-black' : ''}`;
    }

    return `${base} bg-gray-200 border-gray-300`;
  };

  return (
    <button
      className={getCellClasses()}
      onClick={onClick}
      onContextMenu={onRightClick}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          onMiddleClick();
        }
      }}
      disabled={gameStatus === 'won' || gameStatus === 'lost'}
    >
      <span className={isFlagged && !isRevealed ? 'text-sm' : ''}>
        {getCellContent()}
      </span>
    </button>
  );
});

CellComponent.displayName = 'CellComponent';
