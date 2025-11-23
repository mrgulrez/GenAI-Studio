'use client';

import { useEffect, useRef } from 'react';

interface CloudParticle {
  x: number;
  y: number;
  z: number;
  radius: number;
  vx: number;
  vy: number;
  vz: number;
  opacity: number;
  color: string;
}

interface SphericalCloudProps {
  isActive?: boolean;
  intensity?: number;
}

export function SphericalCloud({ isActive = false, intensity = 1 }: SphericalCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<CloudParticle[]>([]);
  const animationFrameRef = useRef<number>();
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = 300;
      canvas.height = 300;
    };
    resizeCanvas();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = 100;
    const sphereRadius = 80;

    // Color palette for realistic sphere
    const colors = [
      'rgba(139, 92, 246, 1)',   // Purple
      'rgba(99, 102, 241, 1)',   // Indigo
      'rgba(168, 85, 247, 1)',   // Violet
      'rgba(124, 58, 237, 1)',   // Purple-600
      'rgba(79, 70, 229, 1)',    // Indigo-600
    ];

    // Create cloud particles in 3D space
    const createCloudParticle = (): CloudParticle => {
      // Generate random point on sphere surface
      const theta = Math.random() * Math.PI * 2; // Longitude
      const phi = Math.acos(2 * Math.random() - 1); // Latitude
      const r = sphereRadius + (Math.random() - 0.5) * 20; // Slight variation in radius
      
      return {
        x: centerX + r * Math.sin(phi) * Math.cos(theta),
        y: centerY + r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        radius: Math.random() * 6 + 2,
        vx: (Math.random() - 0.5) * 0.2 * intensity,
        vy: (Math.random() - 0.5) * 0.2 * intensity,
        vz: (Math.random() - 0.5) * 0.2 * intensity,
        opacity: Math.random() * 0.5 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const particleCount = 60;
    particlesRef.current = Array.from({ length: particleCount }, createCloudParticle);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rotate sphere
      rotationRef.current.y += 0.01;
      rotationRef.current.x += 0.005;

      // Sort particles by z-depth for proper rendering
      const sortedParticles = [...particlesRef.current].sort((a, b) => {
        // Calculate rotated z position
        const aZ = a.z * Math.cos(rotationRef.current.x) - a.y * Math.sin(rotationRef.current.x);
        const bZ = b.z * Math.cos(rotationRef.current.x) - b.y * Math.sin(rotationRef.current.x);
        return bZ - aZ; // Back to front
      });

      // Draw sphere base with gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        sphereRadius * 1.5
      );
      
      // Light source from top-left
      const lightX = centerX - 30;
      const lightY = centerY - 30;
      
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
      gradient.addColorStop(0.3, 'rgba(99, 102, 241, 0.6)');
      gradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.4)');
      gradient.addColorStop(1, 'rgba(124, 58, 237, 0.2)');

      // Draw base sphere glow
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw particles with 3D rotation
      sortedParticles.forEach((particle) => {
        // Apply rotation around Y axis
        let x = particle.x - centerX;
        let y = particle.y - centerY;
        let z = particle.z;

        // Rotate around Y axis
        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);
        const rotatedX = x * cosY - z * sinY;
        const rotatedZ = x * sinY + z * cosY;

        // Rotate around X axis
        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const finalY = y * cosX - rotatedZ * sinX;
        const finalZ = y * sinX + rotatedZ * cosX;

        const screenX = centerX + rotatedX;
        const screenY = centerY + finalY;

        // Calculate distance from light source for shading
        const dx = screenX - lightX;
        const dy = screenY - lightY;
        const distanceFromLight = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = sphereRadius * 2;
        const lightIntensity = Math.max(0.3, 1 - (distanceFromLight / maxDistance));

        // Calculate depth-based opacity
        const depthFactor = (finalZ + sphereRadius) / (sphereRadius * 2);
        const finalOpacity = particle.opacity * depthFactor * lightIntensity;

        // Draw particle with glow effect
        const particleGradient = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          particle.radius * 3
        );
        
        particleGradient.addColorStop(0, particle.color.replace('1)', `${finalOpacity})`));
        particleGradient.addColorStop(0.5, particle.color.replace('1)', `${finalOpacity * 0.6})`));
        particleGradient.addColorStop(1, particle.color.replace('1)', '0)'));

        ctx.beginPath();
        ctx.arc(screenX, screenY, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();

        // Draw highlight for 3D effect
        if (finalZ > -sphereRadius * 0.5) {
          const highlightGradient = ctx.createRadialGradient(
            screenX - particle.radius * 0.3,
            screenY - particle.radius * 0.3,
            0,
            screenX,
            screenY,
            particle.radius
          );
          highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.4})`);
          highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.beginPath();
          ctx.arc(screenX, screenY, particle.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = highlightGradient;
          ctx.fill();
        }
      });

      // Draw connections between nearby particles (only visible ones)
      sortedParticles.forEach((particle, i) => {
        const x1 = particle.x - centerX;
        const y1 = particle.y - centerY;
        const z1 = particle.z;

        const cosY = Math.cos(rotationRef.current.y);
        const sinY = Math.sin(rotationRef.current.y);
        const rotatedX1 = x1 * cosY - z1 * sinY;
        const rotatedZ1 = x1 * sinY + z1 * cosY;

        const cosX = Math.cos(rotationRef.current.x);
        const sinX = Math.sin(rotationRef.current.x);
        const finalY1 = y1 * cosX - rotatedZ1 * sinX;
        const finalZ1 = y1 * sinX + rotatedZ1 * cosX;

        const screenX1 = centerX + rotatedX1;
        const screenY1 = centerY + finalY1;

        sortedParticles.slice(i + 1).forEach((otherParticle) => {
          const x2 = otherParticle.x - centerX;
          const y2 = otherParticle.y - centerY;
          const z2 = otherParticle.z;

          const rotatedX2 = x2 * cosY - z2 * sinY;
          const rotatedZ2 = x2 * sinY + z2 * cosY;

          const finalY2 = y2 * cosX - rotatedZ2 * sinX;
          const finalZ2 = y2 * sinX + rotatedZ2 * cosX;

          const screenX2 = centerX + rotatedX2;
          const screenY2 = centerY + finalY2;

          const dx = screenX1 - screenX2;
          const dy = screenY1 - screenY2;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50 && (finalZ1 > -sphereRadius || finalZ2 > -sphereRadius)) {
            const avgZ = (finalZ1 + finalZ2) / 2;
            const depthFactor = (avgZ + sphereRadius) / (sphereRadius * 2);
            const connectionOpacity = 0.2 * depthFactor * (1 - distance / 50);

            ctx.beginPath();
            ctx.moveTo(screenX1, screenY1);
            ctx.lineTo(screenX2, screenY2);
            ctx.strokeStyle = `rgba(139, 92, 246, ${connectionOpacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Draw shadow at the bottom
      const shadowGradient = ctx.createRadialGradient(
        centerX,
        centerY + sphereRadius * 0.8,
        0,
        centerX,
        centerY + sphereRadius * 0.8,
        sphereRadius * 0.6
      );
      shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
      shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY + sphereRadius * 0.8,
        sphereRadius * 0.6,
        sphereRadius * 0.3,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = shadowGradient;
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
