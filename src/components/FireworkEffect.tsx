import React, { useEffect, useState } from 'react';

interface FireworkProps {
  isActive: boolean;
}

interface Rocket {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  particleCount: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  delay: number;
  size: number;
}

export const FireworkEffect: React.FC<FireworkProps> = ({ isActive }) => {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
        '#ffa500', '#ff1493', '#7fff00', '#ff69b4', '#00ced1', '#ffd700'
      ];

      // Generate multiple fireworks over time
      const newRockets: Rocket[] = [];
      const newParticles: Particle[] = [];
      let particleId = 0;

      // Create 8 fireworks with staggered timing
      for (let i = 0; i < 8; i++) {
        const rocketX = Math.random() * 80 + 10; // 10% to 90% of screen width
        const rocketY = Math.random() * 30 + 10; // 10% to 40% from top
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = i * 0.4; // Staggered launches
        const particleCount = Math.floor(Math.random() * 20) + 30; // 30-50 particles

        newRockets.push({
          id: i,
          x: rocketX,
          y: rocketY,
          color,
          delay,
          particleCount,
        });

        // Generate particles for this firework
        for (let j = 0; j < particleCount; j++) {
          const angle = (j / particleCount) * 360;
          const distance = Math.random() * 150 + 80;
          
          newParticles.push({
            id: particleId++,
            x: rocketX,
            y: rocketY,
            color,
            angle,
            distance,
            delay: delay + 0.8, // Explode after rocket reaches peak
            size: Math.random() * 4 + 2,
          });
        }
      }

      setRockets(newRockets);
      setParticles(newParticles);

      // Clear after animation
      setTimeout(() => {
        setRockets([]);
        setParticles([]);
      }, 5000);
    } else {
      setRockets([]);
      setParticles([]);
    }
  }, [isActive]);

  if (!isActive && rockets.length === 0 && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Rockets */}
      {rockets.map((rocket) => (
        <div
          key={`rocket-${rocket.id}`}
          className="absolute firework-rocket"
          style={{
            left: `${rocket.x}%`,
            bottom: '0%',
            animationDelay: `${rocket.delay}s`,
            '--target-y': `${rocket.y}vh`,
          } as React.CSSProperties}
        >
          <div
            className="w-2 h-8 rounded-full"
            style={{
              backgroundColor: rocket.color,
              boxShadow: `0 0 10px ${rocket.color}, 0 0 20px ${rocket.color}`,
            }}
          />
          {/* Trail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-12 rocket-trail" />
        </div>
      ))}

      {/* Explosion particles */}
      {particles.map((particle) => {
        const radians = (particle.angle * Math.PI) / 180;
        const endX = Math.cos(radians) * particle.distance;
        const endY = Math.sin(radians) * particle.distance;

        return (
          <div
            key={`particle-${particle.id}`}
            className="absolute firework-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              borderRadius: '50%',
              animationDelay: `${particle.delay}s`,
              '--end-x': `${endX}px`,
              '--end-y': `${endY}px`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Victory text */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="victory-text">
            🎉 ПОБЕДА! 🎉
          </div>
        </div>
      )}
    </div>
  );
};
