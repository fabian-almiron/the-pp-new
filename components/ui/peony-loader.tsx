import React from 'react';

interface PeonyLoaderProps {
  className?: string;
}

export const PeonyLoader: React.FC<PeonyLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative w-20 h-24 mb-6">
        {/* Simple peony outline with gentle pulse animation */}
        <div 
          className="w-full h-full bg-contain bg-no-repeat bg-center animate-pulse"
          style={{
            backgroundImage: 'url(/loading_peony.webp)',
            filter: 'grayscale(0%) contrast(1.1)',
            opacity: 0.7,
            animationDuration: '2s'
          }}
        />
      </div>
      
      <p className="font-serif text-gray-700 text-base">loading your page now...</p>
    </div>
  );
};
