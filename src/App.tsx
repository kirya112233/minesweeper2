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
      <div className="overflow-auto max-w-full max-h-[60vh] p-2">
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

        {/* Feedback buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg"
          >
            📩 Написать отзыв
          </button>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
          >
            📋 Открыть форму
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              const btn = document.getElementById('share-btn');
              if (btn) {
                btn.textContent = '✅ Ссылка скопирована!';
                setTimeout(() => { btn.textContent = '🔗 Поделиться'; }, 2000);
              }
            }}
            id="share-btn"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/20 transition-all hover:scale-105 border border-white/20"
          >
            🔗 Поделиться
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-gray-500 text-xs text-center mt-4">
        <p>Нажмите на смайлик для новой игры • Средняя кнопка мыши — открыть соседние клетки</p>
        <p className="mt-1">© 2026 Сапёр • Все права защищены</p>
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
