import React from 'react';
import { Difficulty, DifficultyConfig, GameStatus } from '../types';
import { DIFFICULTY_CONFIGS } from '../hooks/useMinesweeper';

interface GameControlsProps {
  difficulty: Difficulty;
  config: DifficultyConfig;
  gameStatus: GameStatus;
  timer: number;
  flagCount: number;
  onReset: (difficulty?: Difficulty) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  difficulty,
  config,
  gameStatus,
  timer,
  flagCount,
  onReset,
  onDifficultyChange,
}) => {
  const getResetIcon = () => {
    const iconColor = gameStatus === 'won' ? '#22c55e' : gameStatus === 'lost' ? '#ef4444' : '#fbbf24';
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="reset-icon"
      >
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    );
  };

  const formatTime = (seconds: number): string => {
    return seconds.toString().padStart(3, '0');
  };

  const minesRemaining = config.mines - flagCount;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
      {/* Difficulty selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.entries(DIFFICULTY_CONFIGS) as [Difficulty, typeof config][]).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => onDifficultyChange(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              difficulty === key
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-102'
            }`}
          >
            {cfg.emoji} {cfg.label}
            <span className="block text-xs opacity-75">{cfg.rows}×{cfg.cols} • {cfg.mines} мин</span>
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between w-full max-w-md bg-gray-800 rounded-xl p-3 shadow-inner">
        {/* Mine counter */}
        <div className="flex items-center gap-2 bg-black rounded-lg px-3 py-1.5">
          <span className="text-red-500 text-lg">💣</span>
          <span className="font-mono text-red-500 text-xl font-bold min-w-[3ch] text-right">
            {minesRemaining < 0 ? '-' : ''}{formatTime(Math.abs(minesRemaining))}
          </span>
        </div>

        {/* Reset button */}
        <button
          onClick={() => onReset()}
          className="group flex items-center justify-center w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-lg"
          title="Начать заново"
        >
          <span className="transition-transform duration-500 group-hover:rotate-180">
            {getResetIcon()}
          </span>
        </button>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-black rounded-lg px-3 py-1.5">
          <span className="text-red-500 text-lg">⏱️</span>
          <span className="font-mono text-red-500 text-xl font-bold min-w-[3ch] text-right">
            {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Game status message */}
      {gameStatus === 'won' && (
        <div className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-3 rounded-xl font-bold text-lg animate-bounce">
          🎉 Поздравляем! Вы победили за {timer} сек! 🎉
        </div>
      )}
      {gameStatus === 'lost' && (
        <div className="bg-red-100 border-2 border-red-500 text-red-800 px-6 py-3 rounded-xl font-bold text-lg">
          💥 Бум! Вы наступили на мину! 💥
        </div>
      )}
    </div>
  );
};
