import React, { useState, useEffect } from 'react';

interface AnimatedCharacterProps {
  type: 'checkin' | 'checkout' | 'break' | 'success';
  onComplete?: () => void;
}

export const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getCharacterData = () => {
    switch (type) {
      case 'checkin':
        return {
          emoji: '🏃‍♂️',
          message: 'Great! You\'re here!',
          animation: 'animate-run-in',
          bgColor: 'from-green-400 to-blue-500',
          particles: ['⭐', '✨', '🎉', '💫']
        };
      case 'checkout':
        return {
          emoji: '🚶‍♂️',
          message: 'Well done today!',
          animation: 'animate-walk-out',
          bgColor: 'from-orange-400 to-red-500',
          particles: ['👋', '🌟', '🎊', '💪']
        };
      case 'break':
        return {
          emoji: '☕',
          message: 'Enjoy your break!',
          animation: 'animate-float-break',
          bgColor: 'from-yellow-400 to-orange-500',
          particles: ['☕', '🍪', '😊', '💤']
        };
      case 'success':
        return {
          emoji: '🎉',
          message: 'Awesome!',
          animation: 'animate-celebration',
          bgColor: 'from-purple-400 to-pink-500',
          particles: ['🎉', '🎊', '🌟', '✨']
        };
      default:
        return {
          emoji: '😊',
          message: 'Great job!',
          animation: 'animate-bounce',
          bgColor: 'from-blue-400 to-purple-500',
          particles: ['😊', '👍', '💯', '🎯']
        };
    }
  };

  const characterData = getCharacterData();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Background overlay with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${characterData.bgColor} opacity-20 animate-fade-in`} />
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {characterData.particles.map((particle, index) => (
          <div
            key={index}
            className="absolute text-2xl animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${index * 0.2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {particle}
          </div>
        ))}
      </div>

      {/* Main character */}
      <div className={`absolute inset-0 flex items-center justify-center ${characterData.animation}`}>
        <div className="text-center">
          <div className="text-8xl mb-4 animate-character-bounce">
            {characterData.emoji}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg animate-message-pop">
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {characterData.message}
            </p>
          </div>
        </div>
      </div>

      {/* Running trail effect for check-in */}
      {type === 'checkin' && (
        <div className="absolute bottom-1/2 left-0 w-full h-2">
          <div className="relative w-full h-full">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="absolute w-4 h-4 bg-blue-500 rounded-full animate-trail-dots"
                style={{
                  left: `${index * 20}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Walking trail effect for check-out */}
      {type === 'checkout' && (
        <div className="absolute bottom-1/2 right-0 w-full h-2">
          <div className="relative w-full h-full">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="absolute w-4 h-4 bg-orange-500 rounded-full animate-trail-dots-reverse"
                style={{
                  right: `${index * 20}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};