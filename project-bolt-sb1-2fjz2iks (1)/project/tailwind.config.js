/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scale-in': 'scaleIn 0.3s ease-out',
        'rotate-in': 'rotateIn 0.5s ease-out',
        'flip': 'flip 0.6s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(20) infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        'loading-dots': 'loadingDots 1.4s ease-in-out infinite',
        'success-check': 'successCheck 0.6s ease-out',
        'error-shake': 'errorShake 0.5s ease-in-out',
        'progress-fill': 'progressFill 1s ease-out',
        'notification-slide': 'notificationSlide 0.4s ease-out',
        // New cartoon and character animations
        'run-in': 'runIn 2s ease-out',
        'walk-out': 'walkOut 2s ease-out',
        'float-break': 'floatBreak 3s ease-in-out infinite',
        'celebration': 'celebration 2s ease-out',
        'character-bounce': 'characterBounce 1s ease-in-out infinite',
        'message-pop': 'messagePop 0.5s ease-out',
        'float-particle': 'floatParticle 3s ease-in-out infinite',
        'trail-dots': 'trailDots 2s ease-out',
        'trail-dots-reverse': 'trailDotsReverse 2s ease-out',
        'cartoon-jump': 'cartoonJump 0.8s ease-out',
        'cartoon-spin': 'cartoonSpin 1s ease-in-out',
        'cartoon-dance': 'cartoonDance 2s ease-in-out infinite',
        'rainbow-text': 'rainbowText 3s ease-in-out infinite',
        'confetti-fall': 'confettiFall 3s ease-out infinite',
        'star-twinkle': 'starTwinkle 2s ease-in-out infinite',
        'bubble-float': 'bubbleFloat 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-180deg) scale(0.5)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0)' },
          '50%': { transform: 'rotateY(180deg)' },
          '100%': { transform: 'rotateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        typewriter: {
          '0%': { width: '0' },
          '50%': { width: '100%' },
          '100%': { width: '0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        loadingDots: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        successCheck: {
          '0%': { transform: 'scale(0) rotate(45deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(45deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(45deg)', opacity: '1' },
        },
        errorShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        notificationSlide: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        // New cartoon and character keyframes
        runIn: {
          '0%': { transform: 'translateX(-100vw) scale(0.5)', opacity: '0' },
          '50%': { transform: 'translateX(0) scale(1.2)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        walkOut: {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateX(50vw) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateX(100vw) scale(0.5)', opacity: '0' },
        },
        floatBreak: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(5deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-5deg)' },
        },
        celebration: {
          '0%': { transform: 'scale(0.5) rotate(0deg)', opacity: '0' },
          '25%': { transform: 'scale(1.3) rotate(90deg)', opacity: '1' },
          '50%': { transform: 'scale(1) rotate(180deg)', opacity: '1' },
          '75%': { transform: 'scale(1.2) rotate(270deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        characterBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.1)' },
        },
        messagePop: {
          '0%': { transform: 'scale(0) translateY(20px)', opacity: '0' },
          '50%': { transform: 'scale(1.1) translateY(-5px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        floatParticle: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translateY(-50px) rotate(180deg)', opacity: '0.7' },
          '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' },
        },
        trailDots: {
          '0%': { transform: 'translateX(-100px) scale(0)', opacity: '0' },
          '50%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(100px) scale(0)', opacity: '0' },
        },
        trailDotsReverse: {
          '0%': { transform: 'translateX(100px) scale(0)', opacity: '0' },
          '50%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(-100px) scale(0)', opacity: '0' },
        },
        cartoonJump: {
          '0%': { transform: 'translateY(0) scaleY(1)' },
          '30%': { transform: 'translateY(-30px) scaleY(1.2)' },
          '50%': { transform: 'translateY(-40px) scaleY(0.8)' },
          '70%': { transform: 'translateY(-20px) scaleY(1.1)' },
          '100%': { transform: 'translateY(0) scaleY(1)' },
        },
        cartoonSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(90deg) scale(1.1)' },
          '50%': { transform: 'rotate(180deg) scale(0.9)' },
          '75%': { transform: 'rotate(270deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        cartoonDance: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(-10px) rotate(-10deg)' },
          '50%': { transform: 'translateX(0) rotate(0deg)' },
          '75%': { transform: 'translateX(10px) rotate(10deg)' },
        },
        rainbowText: {
          '0%': { color: '#ff0000' },
          '16%': { color: '#ff8000' },
          '33%': { color: '#ffff00' },
          '50%': { color: '#00ff00' },
          '66%': { color: '#0080ff' },
          '83%': { color: '#8000ff' },
          '100%': { color: '#ff0000' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.2)' },
        },
        bubbleFloat: {
          '0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) scale(1)', opacity: '0' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
};