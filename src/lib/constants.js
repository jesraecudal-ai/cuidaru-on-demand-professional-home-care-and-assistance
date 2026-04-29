export const CATEGORIES = [
  { key: 'caregiver', icon: '🤲' },
  { key: 'assistant_nurse', icon: '💊' },
  { key: 'nurse', icon: '🩺' },
  { key: 'doctor', icon: '👨‍⚕️' },
  { key: 'social_worker', icon: '🤝' },
  { key: 'house_cleaner', icon: '🧹' },
  { key: 'cook', icon: '👨‍🍳' },
  { key: 'laundry_helper', icon: '👕' },
  { key: 'nanny', icon: '👶' },
  { key: 'errand_runner', icon: '🏃' },
  { key: 'tutor', icon: '📚' },
  { key: 'teacher', icon: '🎓' },
  { key: 'sports_teacher', icon: '⚽' },
  { key: 'gym', icon: '💪' },
];

export const CATEGORY_COLORS = {
  caregiver: 'from-teal-500 to-cyan-500',
  assistant_nurse: 'from-pink-500 to-rose-500',
  nurse: 'from-blue-500 to-cyan-500',
  doctor: 'from-indigo-500 to-purple-500',
  social_worker: 'from-green-500 to-emerald-500',
  house_cleaner: 'from-emerald-500 to-teal-500',
  cook: 'from-orange-500 to-amber-500',
  laundry_helper: 'from-violet-500 to-fuchsia-500',
  nanny: 'from-amber-500 to-orange-500',
  errand_runner: 'from-sky-500 to-blue-500',
  tutor: 'from-purple-500 to-pink-500',
  teacher: 'from-blue-600 to-indigo-600',
  sports_teacher: 'from-green-500 to-lime-500',
  gym: 'from-red-500 to-orange-500',
};

export const CATEGORY_BADGE_COLORS = {
  caregiver: 'bg-teal-100 text-teal-700 border-teal-200',
  assistant_nurse: 'bg-pink-100 text-pink-700 border-pink-200',
  nurse: 'bg-blue-100 text-blue-700 border-blue-200',
  doctor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  social_worker: 'bg-green-100 text-green-700 border-green-200',
  house_cleaner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cook: 'bg-orange-100 text-orange-700 border-orange-200',
  laundry_helper: 'bg-violet-100 text-violet-700 border-violet-200',
  nanny: 'bg-amber-100 text-amber-700 border-amber-200',
  errand_runner: 'bg-sky-100 text-sky-700 border-sky-200',
  tutor: 'bg-purple-100 text-purple-700 border-purple-200',
  teacher: 'bg-blue-100 text-blue-700 border-blue-200',
  sports_teacher: 'bg-green-100 text-green-700 border-green-200',
  gym: 'bg-red-100 text-red-700 border-red-200',
};

export const COUNTRY_SETTINGS = {
  brazil: { label: 'Brazil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$', fee_pct: 10, sub_client: 29.9, sub_provider: 49.9 },
  uruguay: { label: 'Uruguay', flag: '🇺🇾', currency: 'UYU', symbol: '$U', fee_pct: 10, sub_client: 299, sub_provider: 499 },
  usa: { label: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', fee_pct: 10, sub_client: 9.99, sub_provider: 14.99 },
  canada: { label: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$', fee_pct: 10, sub_client: 12.99, sub_provider: 19.99 },
  philippines: { label: 'Philippines', flag: '🇵🇭', currency: 'PHP', symbol: '₱', fee_pct: 10, sub_client: 299, sub_provider: 499 },
};

export const BOOKING_STATUSES = {
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700' },
  counter_offered: { label: 'Counter Offered', color: 'bg-violet-100 text-violet-700' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-700' },
  paid_confirmed: { label: 'Paid & Confirmed', color: 'bg-cyan-100 text-cyan-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  release_pending: { label: 'Release Pending', color: 'bg-lime-100 text-lime-700' },
  payment_released: { label: 'Payment Released', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700' },
};

// Regex patterns for anti-bypass detection
export const BYPASS_PATTERNS = [
  /\b\d{9,}\b/,                              // phone numbers (9+ digits)
  /whatsapp/i,
  /wh?a?ts?app?/i,
  /\bwpp\b/i,
  /@[a-z0-9.]+\.[a-z]{2,}/i,               // emails
  /pay.*outside/i,
  /pay.*cash/i,
  /transfer.*directly/i,
  /contact.*directly/i,
  /\btelegram\b/i,
  /\binstagram\b/i,
];

export function detectBypass(text) {
  if (!text) return false;
  return BYPASS_PATTERNS.some(p => p.test(text));
}

export function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
    Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}