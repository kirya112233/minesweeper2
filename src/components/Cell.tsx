import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Cell as CellType, GameStatus } from '../types';

interface CellProps {
  cell: CellType;
  gameStatus: GameStatus;
  isRadarHighlighted: boolean;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  onMiddleClick: () => void;
  onLongPress: () => void;
}

const LONG_PRESS_DURATION = 400;
const MOVE_THRESHOLD = 10;

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
  isRadarHighlighted,
  onClick,
  onRightClick,
  onMiddleClick,
  onLongPress,
}) => {
  const { isMine, isRevealed, isFlagged, adjacentMines, ability, isDisarmed } = cell;
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressFiredRef = useRef(false);

  const isDisabled = gameStatus === 'won' || gameStatus === 'lost';
  const canFlag = !isRevealed && !isDisabled;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setIsPressing(false);
    setPressProgress(0);
  }, []);

  const startLongPress = useCallback(() => {
    if (!canFlag) return;

    setIsPressing(true);
    setLongPressTriggered(false);
    setPressProgress(0);

    const step = 50;
    const totalSteps = LONG_PRESS_DURATION / step;
    let currentStep = 0;

    progressRef.current = setInterval(() => {
      currentStep++;
      setPressProgress(Math.min(currentStep / totalSteps, 1));
    }, step);

    timerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      longPressFiredRef.current = true;
      setIsPressing(false);
      setPressProgress(0);
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      onLongPress();

      setTimeout(() => {
        longPressFiredRef.current = false;
        setLongPressTriggered(false);
      }, 300);
    }, LONG_PRESS_DURATION);
  }, [canFlag, onLongPress]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isDisabled) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    startLongPress();
  }, [isDisabled, startLongPress]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);

    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      clearTimers();
      touchStartRef.current = null;
    }
  }, [clearTimers]);

  const handleTouchEnd = useCallback(() => {
    clearTimers();
    touchStartRef.current = null;
  }, [clearTimers, longPressTriggered]);

  const handleTouchCancel = useCallback(() => {
    clearTimers();
    touchStartRef.current = null;
  }, [clearTimers]);

  const getCellContent = () => {
    if (isDisarmed) return '🛡️';
    if (isFlagged && !isRevealed) return '🚩';
    if (!isRevealed) {
      if (ability === 'radar') return '📡';
      if (ability === 'toolkit') return '🧰';
      if (ability === 'shovel') return '⛏️';
      return '';
    }
    if (isMine) return '💣';
    if (adjacentMines > 0) return adjacentMines.toString();
    return '';
  };

  const getCellClasses = () => {
    const base = 'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base font-bold select-none transition-all duration-100 border relative overflow-hidden';

    // Radar highlight effect
    if (isRadarHighlighted) {
      return `${base} bg-red-500 border-red-600 radar-pulse`;
    }

    if (!isRevealed) {
      let stateClasses = 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500 hover:from-gray-250 hover:to-gray-350 cursor-pointer active:from-gray-400 active:to-gray-500 shadow-sm hover:shadow-md';

      // Ability cells have special styling
      if (ability === 'radar') {
        stateClasses = 'bg-gradient-to-br from-cyan-300 to-cyan-500 border-cyan-600 cursor-pointer shadow-md hover:shadow-lg ability-glow-radar';
      } else if (ability === 'toolkit') {
        stateClasses = 'bg-gradient-to-br from-green-300 to-green-500 border-green-600 cursor-pointer shadow-md hover:shadow-lg ability-glow-toolkit';
      } else if (ability === 'shovel') {
        stateClasses = 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-600 cursor-pointer shadow-md hover:shadow-lg ability-glow-shovel';
      }

      if (isPressing) {
        stateClasses = 'bg-gradient-to-br from-yellow-200 to-yellow-400 border-yellow-500 shadow-md scale-95';
      }

      if (longPressTriggered) {
        stateClasses = 'bg-gradient-to-br from-green-200 to-green-400 border-green-500 shadow-md';
      }

      return `${base} ${stateClasses}`;
    }

    if (isDisarmed) {
      return `${base} bg-gradient-to-br from-green-200 to-green-400 border-green-500 disarmed-cell`;
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

  const handleClick = useCallback(() => {
    if (longPressFiredRef.current) {
      return;
    }
    onClick();
  }, [onClick]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(e);
  };

  return (
    <button
      className={getCellClasses()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          onMiddleClick();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      disabled={isDisabled}
    >
      {isPressing && canFlag && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="rgba(234, 179, 8, 0.5)"
              strokeWidth="2"
              strokeDasharray={`${pressProgress * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      <span className={`relative z-10 ${isFlagged && !isRevealed ? 'text-sm' : ''} ${longPressTriggered ? 'animate-ping-once' : ''}`}>
        {getCellContent()}
      </span>
    </button>
  );
});

CellComponent.displayName = 'CellComponent';
