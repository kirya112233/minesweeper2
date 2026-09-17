import { useState, useCallback } from 'react';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { GoogleForm } from './components/GoogleForm';
import { useMinesweeper } from './hooks/useMinesweeper';
import { Difficulty } from './types';

// ============================================
// НАСТРОЙКА GOOGLE FORMS
// ============================================
const GOOGLE_FORM_ID = '1Qnc8kNMgZO-HkI-FPfzBdroc5ercvZ6LdL97xUSwA-A';
const GOOGLE_FORM_EMBED_URL = `https://docs.google.com/forms/d/${GOOGLE_FORM_ID}/viewform?embedded=true`;

function App() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<number | null>(null);
  const [showQuickFeedback, setShowQuickFeedback] = useState(true);

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

  const handleQuickFeedback = (rating: number) => {
    setQuickFeedback(rating);
    setTimeout(() => {
      setShowQuickFeedback(false);
    }, 1500);
  };

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
      <div className="overflow-auto max-w-full max-h-[60vh] p-2 game-board-container">
        <Board
          board={board}
          gameStatus={gameStatus}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          onRevealAdjacent={revealAdjacentCells}
        />
      </div>

      {/* Feedback Section */}
      <div className="w-full max-w-lg">
        {/* Quick Feedback */}
        {showQuickFeedback && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-3">
            <p className="text-white text-sm font-medium mb-2 text-center">
              {quickFeedback !== null
                ? `Спасибо за оценку! ${quickFeedback >= 4 ? '🎉' : '🙏'}`
                : 'Как вам игра?'}
            </p>
            {quickFeedback === null ? (
              <div className="flex justify-center gap-2">
                {['😞', '😐', '🙂', '😄', '🤩'].map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickFeedback(idx + 1)}
                    className="text-2xl sm:text-3xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-3xl animate-bounce">
                {['😞', '😐', '🙂', '😄', '🤩'][quickFeedback - 1]}
              </div>
            )}
          </div>
        )}

        {/* Feedback button */}
        <div className="flex justify-center">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg"
          >
            📩 Написать отзыв
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-2xl mt-4 space-y-4">
        {/* How to play */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10">
          <h3 className="text-white font-bold text-sm sm:text-base mb-3 flex items-center gap-2">
            🎮 Как играть
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            {/* Desktop controls */}
            <div className="space-y-2">
              <p className="text-gray-300 font-semibold text-xs uppercase tracking-wider">💻 Компьютер</p>
              <div className="space-y-1.5 text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 font-mono text-xs whitespace-nowrap">ЛКМ</span>
                  <span>Открыть клетку</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 font-mono text-xs whitespace-nowrap">ПКМ</span>
                  <span>Поставить / снять флажок 🚩</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 font-mono text-xs whitespace-nowrap">СКМ</span>
                  <span>Открыть соседние клетки (если все мины отмечены)</span>
                </p>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="space-y-2">
              <p className="text-gray-300 font-semibold text-xs uppercase tracking-wider">📱 Телефон</p>
              <div className="space-y-1.5 text-gray-400">
                <p className="flex items-start gap-2">
                  <span className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 font-mono text-xs whitespace-nowrap">Тап</span>
                  <span>Открыть клетку</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 font-mono text-xs whitespace-nowrap">Удержание</span>
                  <span>Поставить / снять флажок 🚩</span>
                </p>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-gray-300 font-semibold text-xs uppercase tracking-wider mb-2">📖 Правила</p>
            <ul className="text-gray-400 text-xs sm:text-sm space-y-1 list-disc list-inside">
              <li>Цель — открыть все клетки, не наступив на мину</li>
              <li>Цифры показывают количество мин в соседних клетках</li>
              <li>Первый клик всегда безопасен — мины размещаются после него</li>
              <li>Используйте флажки, чтобы отмечать предполагаемые мины</li>
            </ul>
          </div>
        </div>

        <p className="text-gray-600 text-xs text-center">© 2026 Сапёр • Все права защищены</p>
      </div>

      {/* Google Form Modal */}
      <GoogleForm
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        embedUrl={GOOGLE_FORM_EMBED_URL}
      />
    </div>
  );
}

export default App;
