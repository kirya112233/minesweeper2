import React from 'react';

interface GoogleFormProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
}

export const GoogleForm: React.FC<GoogleFormProps> = ({
  isOpen,
  onClose,
  embedUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📩 Обратная связь
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form iframe */}
        <div className="flex-1 overflow-hidden bg-white">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Google Form - Обратная связь"
          >
            Загрузка...
          </iframe>
        </div>
      </div>
    </div>
  );
};
