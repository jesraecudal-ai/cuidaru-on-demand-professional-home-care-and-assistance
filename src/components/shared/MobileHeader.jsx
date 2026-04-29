import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

/**
 * Native-style mobile header with back button.
 * Props:
 *   title     – page title (string)
 *   onBack    – optional override for back action (defaults to navigate(-1))
 *   right     – optional right-side React node
 */
export default function MobileHeader({ title, onBack, right }) {
  const navigate = useNavigate();

  return (
    <div
      className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-2 h-14"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <button
        onClick={onBack ?? (() => navigate(-1))}
        className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <h1 className="text-base font-semibold text-gray-900 truncate max-w-[60%] text-center">{title}</h1>

      <div className="w-11 flex items-center justify-end">
        {right ?? null}
      </div>
    </div>
  );
}