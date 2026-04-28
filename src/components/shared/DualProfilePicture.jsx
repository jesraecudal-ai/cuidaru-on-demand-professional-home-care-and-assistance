import React from 'react';

export default function DualProfilePicture({ userAvatar, userInitial, companyLogo, companyName, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const logoBadgeSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} relative inline-flex items-center justify-center`}>
      {/* Main profile picture */}
      <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm`}>
        {userAvatar ? (
          <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-blue-600 text-lg">{userInitial || '?'}</span>
        )}
      </div>

      {/* Company logo badge - overlapping circles effect */}
      {companyLogo && (
        <div className={`${logoBadgeSize[size]} absolute bottom-0 right-0 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center overflow-hidden`}>
          <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}