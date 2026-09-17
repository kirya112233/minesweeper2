import React, { useState } from 'react';
import { Difficulty, GameStatus } from '../types';
import { DIFFICULTY_CONFIGS } from '../hooks/useMinesweeper';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  gameStats?: {
    difficulty: Difficulty;
    gameStatus: GameStatus;
    timer: number;
    flagCount: number;
  };
}

type FeedbackType = 'feedback' | 'bug' | 'suggestion' | 'question';

const FEEDBACK_TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'feedback', label: 'Отзыв', emoji: '💬' },
  { value: 'bug', label: 'Ошибка', emoji: '🐛' },
  { value: 'suggestion', label: 'Предложение', emoji: '💡' },
  { value: 'question', label: 'Вопрос', emoji: '❓' },
];

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose, gameStats }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<FeedbackType>('feedback');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [includeStats, setIncludeStats] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Введите имя';
    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Некорректный email';
    }
    if (!message.trim()) {
      newErrors.message = 'Введите сообщение';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Минимум 10 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate submission
    console.log('Feedback submitted:', {
      name,
      email,
      type,
      message,
      rating,
      includeStats,
      gameStats: includeStats ? gameStats : null,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
      setType('feedback');
      setMessage('');
      setRating(0);
      setErrors({});
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              📩 Обратная связь
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Помогите нам стать лучше!
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h3 className="text-xl font-bold text-green-700 mb-2">Спасибо за отзыв!</h3>
            <p className="text-gray-600">Ваше сообщение успешно отправлено</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Feedback type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Тип обращения
              </label>
              <div className="grid grid-cols-4 gap-2">
                {FEEDBACK_TYPES.map((ft) => (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setType(ft.value)}
                    className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${
                      type === ft.value
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-700 scale-105'
                        : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg block">{ft.emoji}</span>
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Имя <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors outline-none ${
                  errors.name
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors outline-none ${
                  errors.email
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Оценка игры
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl transition-transform hover:scale-125"
                  >
                    {star <= (hoverRating || rating) ? '⭐' : '☆'}
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm text-gray-500 self-center ml-2">
                    {rating === 1 && 'Можно лучше'}
                    {rating === 2 && 'Неплохо'}
                    {rating === 3 && 'Хорошо'}
                    {rating === 4 && 'Отлично'}
                    {rating === 5 && 'Супер!'}
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Сообщение <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Расскажите о вашем опыте, найденной ошибке или предложении..."
                rows={4}
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors outline-none resize-none ${
                  errors.message
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 focus:border-blue-500'
                }`}
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
              <p className="text-gray-400 text-xs mt-1 text-right">
                {message.length} символов
              </p>
            </div>

            {/* Include game stats */}
            {gameStats && (
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Прикрепить статистику сессии
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Сложность: {DIFFICULTY_CONFIGS[gameStats.difficulty].label} •
                    Время: {gameStats.timer}с •
                    Статус: {gameStats.gameStatus === 'won' ? '🏆 Победа' : gameStats.gameStatus === 'lost' ? '💥 Поражение' : '⏳ В процессе'}
                  </p>
                </div>
              </label>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              📨 Отправить отзыв
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
