import React, { useEffect, useState } from 'react';

interface ExplosionEffectProps {
  isActive: boolean;
}

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'triangle';
}

export const ExplosionEffect: React.FC<ExplosionEffectProps> = ({ isActive }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);

  useEffect(() => {
    if (isActive) {
      const colors = ['#ff4500', '#ff6347', '#ffa500', '#ffd700', '#ff1493', '#dc143c', '#ff8c00'];
      const shapes: Particle['shape'][] = ['circle', 'square', 'triangle'];
      const newParticles: Particle[] = [];
      
      // Generate particles radiating from center
      for (let i = 0; i < 60; i++) {
        const angle = (Math.random() * 360) * (Math.PI / 180);
        const distance = Math.random() * 400 + 100;
        
        newParticles.push({
          id: i,
          startX: 50,
          startY: 50,
          endX: 50 + Math.cos(angle) * (distance / window.innerWidth * 100),
          endY: 50 + Math.sin(angle) * (distance / window.innerHeight * 100),
          size: Math.random() * 10 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.15,
          duration: Math.random() * 0.8 + 0.7,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
      
      setParticles(newParticles);
      
      // Flash sequence
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
      
      // Shockwave
      setTimeout(() => setShowShockwave(true), 50);
      setTimeout(() => setShowShockwave(false), 1000);
      
      // Clear particles after animation
      setTimeout(() => setParticles([]), 2500);
    } else {
      setParticles([]);
      setShowFlash(false);
      setShowShockwave(false);
    }
  }, [isActive]);

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Flash overlay */}
      {showFlash && (
        <div className="absolute inset-0 explosion-flash" />
      )}

      {/* Shockwave */}
      {showShockwave && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="shockwave-ring" />
        </div>
      )}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute explosion-particle"
          style={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            '--end-x': `${particle.endX - particle.startX}vw`,
            '--end-y': `${particle.endY - particle.startY}vh`,
          } as React.CSSProperties}
        />
      ))}

      {/* Smoke/embers effect */}
      {isActive && (
        <>
          <div className="absolute inset-0 smoke-effect" />
          <div className="absolute inset-0 ember-glow" />
        </>
      )}
    </div>
  );
};
