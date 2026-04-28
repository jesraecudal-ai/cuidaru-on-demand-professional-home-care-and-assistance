import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { CATEGORIES } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

export default function CategoryCarousel() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [plugin.current]
  );

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">What we offer</h2>
        <p className="text-gray-600 text-center mb-8">Find experts in any field</p>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {CATEGORIES.map(cat => (
              <div
                key={cat.key}
                className="flex-[0_0_calc(20%-0.8rem)] min-w-0"
              >
                <button
                  onClick={() => navigate(`/browse?category=${cat.key}`)}
                  className="w-full p-6 rounded-lg border-2 border-gray-100 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-center group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                  <p className="font-semibold text-gray-800 text-sm group-hover:text-blue-600">{t(`cat_${cat.key}`)}</p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}