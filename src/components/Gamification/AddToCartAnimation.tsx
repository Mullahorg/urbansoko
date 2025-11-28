import confetti from 'canvas-confetti';

export const triggerAddToCartAnimation = () => {
  // Small burst of confetti
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7, x: 0.5 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    ticks: 100,
    gravity: 1.2,
    scalar: 0.8,
  });
};

export const triggerPurchaseAnimation = () => {
  // Grand celebration
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const triggerRewardAnimation = () => {
  // Stars and sparkles
  confetti({
    particleCount: 50,
    spread: 100,
    origin: { y: 0.5 },
    shapes: ['star'],
    colors: ['#FFD700', '#FFA500', '#FFFF00'],
  });
};
