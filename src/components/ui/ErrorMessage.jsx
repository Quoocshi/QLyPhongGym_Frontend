import { AlertCircle, XCircle } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry, variant = 'default' }) => {
  if (variant === 'inline') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in-up">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold underline"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-16 max-w-md border border-white/20 animate-fade-in-up">
      <div className="bg-red-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle className="w-12 h-12 text-red-400" />
      </div>
      <p className="text-red-400 mb-8 text-xl font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

export const FullPageError = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <ErrorMessage message={message} onRetry={onRetry} />
    </div>
  );
};
