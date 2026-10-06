import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    // Elegant celebratory burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#e6af45', '#10b981', '#ffffff', '#ffd67a', '#34d399']
    });

    // Secondary subtle sparkle
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e6af45', '#10b981']
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e6af45', '#10b981']
      });
    }, 250);
  } catch (err) {
    console.warn('Confetti error:', err);
  }
}
