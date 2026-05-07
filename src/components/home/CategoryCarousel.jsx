import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    label: 'Home Services',
    items: [
      { key: 'house_cleaner', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', label: 'House Cleaner' },
      { key: 'laundry_helper', image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop', label: 'Laundry' },
      { key: 'errand_runner', image: 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=400&h=300&fit=crop', label: 'Errand Runner' },
    ],
  },
  {
    label: 'Health & Care',
    items: [
      { key: 'doctor', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop', label: 'Doctor' },
      { key: 'nurse', image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop', label: 'Nurse' },
      { key: 'caregiver', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop', label: 'Caregiver' },
    ],
  },
  {
    label: 'Education & Fitness',
    items: [
      { key: 'tutor', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop', label: 'Tutor' },
      { key: 'sports_teacher', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', label: 'Gym Teacher' },
      { key: 'teacher', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop', label: 'Teacher' },
    ],
  },
];

export default function CategoryCarousel() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  const handleNext = () => setCurrent(prev => (prev + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">What we offer</h2>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-8">Find experts in any field</p>

        <div className="relative">
          {/* Slide label */}
          <div className="text-center mb-5">
            <span className="inline-block bg-blue-100 text-blue-700 font-semibold text-sm px-4 py-1.5 rounded-full">
              {slide.label}
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {slide.items.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(`/browse?category=${item.key}`)}
                className="group rounded-2xl overflow-hidden border-2 border-gray-100 bg-white hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="relative h-40 sm:h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-white font-bold text-sm sm:text-base drop-shadow">
                    {item.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Arrows */}
          <button
            onClick={handlePrev}
            className="absolute -left-4 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="absolute -right-4 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'bg-blue-600 w-8' : 'bg-gray-300 w-2'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}