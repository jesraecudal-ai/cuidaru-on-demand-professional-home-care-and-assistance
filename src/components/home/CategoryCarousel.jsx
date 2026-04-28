import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryCarousel() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % CATEGORIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + CATEGORIES.length) % CATEGORIES.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % CATEGORIES.length);
  };

  const getVisibleCategories = () => {
    const visible = [];
    for (let i = 0; i < 5; i++) {
      visible.push(CATEGORIES[(currentIndex + i) % CATEGORIES.length]);
    }
    return visible;
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">What we offer</h2>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">Find experts in any field</p>
        
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {getVisibleCategories().map((cat, idx) => (
              <button
                key={`${cat.key}-${idx}`}
                onClick={() => navigate(`/browse?category=${cat.key}`)}
                className="p-3 sm:p-6 rounded-lg border-2 border-gray-100 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-center group"
              >
                <div className="text-2xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform inline-block">{cat.icon}</div>
                <p className="font-semibold text-gray-800 text-xs sm:text-sm group-hover:text-blue-600 line-clamp-2">{t(`cat_${cat.key}`)}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handlePrev}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {CATEGORIES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}