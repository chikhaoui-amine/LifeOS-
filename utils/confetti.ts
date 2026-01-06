export const triggerConfetti = () => {
  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  
  const createParticle = (x: number, y: number) => {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 4;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.position = 'fixed';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.zIndex = '9999';
    particle.style.pointerEvents = 'none';
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    
    // Random Animation
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 100 + 50;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - 100; // slightly upwards
    
    particle.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 1000,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      fill: 'forwards'
    }).onfinish = () => particle.remove();
    
    document.body.appendChild(particle);
  };

  // Burst
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  for (let i = 0; i < 50; i++) {
    createParticle(centerX, centerY);
  }
};