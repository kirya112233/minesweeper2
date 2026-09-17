import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Cell as CellType, GameStatus } from '../types';

interface CellProps {
  cell: CellType;
  gameStatus: GameStatus;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  onMiddleClick: () => void;
  onLongPress: () => void;
}

const LONG_PRESS_DURATION = 400; // ms
const MOVE_THRESHOLD = 10; // px — допустимое смещение пальца

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
  onLongPress,
}) => {
  const { isMine, isRevealed, isFlagged, adjacentMines } = cell;
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressFiredRef = useRef(false);

  const isDisabled = gameStatus === 'won' || gameStatus === 'lost';
  const canFlag = !isRevealed && !isDisabled;

  // Cleanup on unmount
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

    // Progress animation
    const step = 50; // update every 50ms
    const totalSteps = LONG_PRESS_DURATION / step;
    let currentStep = 0;

    progressRef.current = setInterval(() => {
      currentStep++;
      setPressProgress(Math.min(currentStep / totalSteps, 1));
    }, step);

    timerRef.current = setTimeout(() => {
      // Long press triggered
      setLongPressTriggered(true);
      longPressFiredRef.current = true;
      setIsPressing(false);
      setPressProgress(0);
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      onLongPress();

      // Reset the flag after a short delay to allow normal clicks again
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

    // Cancel long press if finger moved too much
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      clearTimers();
      touchStartRef.current = null;
    }
  }, [clearTimers]);

  const handleTouchEnd = useCallback(() => {
    // If long press was triggered, prevent the subsequent click event
    if (longPressTriggered) {
      // The click handler will check this flag
    }
    clearTimers();
    touchStartRef.current = null;
  }, [clearTimers, longPressTriggered]);

  const handleTouchCancel = useCallback(() => {
    clearTimers();
    touchStartRef.current = null;
  }, [clearTimers]);

  const getCellContent = () => {
    if (isFlagged && !isRevealed) return '🚩';
    if (!isRevealed) return '';
    if (isMine) return '💣';
    if (adjacentMines > 0) return adjacentMines.toString();
    return '';
  };

  const getCellClasses = () => {
    const base = 'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base font-bold select-none transition-all duration-100 border relative overflow-hidden';

    if (!isRevealed) {
      let stateClasses = 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500 hover:from-gray-250 hover:to-gray-350 cursor-pointer active:from-gray-400 active:to-gray-500 shadow-sm hover:shadow-md';

      // Long press visual feedback
      if (isPressing) {
        stateClasses = 'bg-gradient-to-br from-yellow-200 to-yellow-400 border-yellow-500 shadow-md scale-95';
      }

      if (longPressTriggered) {
        stateClasses = 'bg-gradient-to-br from-green-200 to-green-400 border-green-500 shadow-md';
      }

      return `${base} ${stateClasses}`;
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

  // Prevent context menu on mobile for unrevealed cells
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(e);
  };

  const handleClick = useCallback(() => {
    // Prevent click after long press
    if (longPressFiredRef.current) {
      return;
    }
    onClick();
  }, [onClick]);

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
      {/* Long press progress ring */}
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

      {/* Content */}
      <span className={`relative z-10 ${isFlagged && !isRevealed ? 'text-sm' : ''} ${longPressTriggered ? 'animate-ping-once' : ''}`}>
        {getCellContent()}
      </span>
    </button>
  );
});

CellComponent.displayName = 'CellComponent';
