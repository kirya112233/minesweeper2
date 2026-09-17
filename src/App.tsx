import { useCallback } from 'react';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { useMinesweeper } from './hooks/useMinesweeper';
import { Difficulty } from './types';

function App() {
  const {
    board,
    gameStatus,
    timer,
    flagCount,
    difficulty,
    config,
    handleCellClick,
    handleCellRightClick,
    revealAdjacentCells,
    resetGame,
  } = useMinesweeper('beginner');

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    resetGame(newDifficulty);
  }, [resetGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 flex flex-col items-center justify-center p-4 gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
          💣 Сапёр
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Классическая игра • ЛКМ — открыть • ПКМ — флажок
        </p>
      </div>

      {/* Controls */}
      <GameControls
        difficulty={difficulty}
        config={config}
        gameStatus={gameStatus}
        timer={timer}
        flagCount={flagCount}
        onReset={resetGame}
        onDifficultyChange={handleDifficultyChange}
      />

      {/* Board */}
      <div className="overflow-auto max-w-full max-h-[70vh] p-2">
        <Board
          board={board}
          gameStatus={gameStatus}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          onRevealAdjacent={revealAdjacentCells}
        />
      </div>

      {/* Footer */}
      <div className="text-gray-500 text-xs text-center mt-4">
        <p>Нажмите на смайлик для новой игры • Средняя кнопка мыши — открыть соседние клетки</p>
      </div>
    </div>
  );
}

export default App;
