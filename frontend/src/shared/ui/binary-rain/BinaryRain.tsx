import React, { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface Stream {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
}

export interface BinaryRainProps {
  className?: string;
  opacityClassName?: string;
  fontSize?: number;
  targetFps?: number;
  speedMultiplier?: number;
}

export const BinaryRain: React.FC<BinaryRainProps> = ({
  className,
  opacityClassName = 'opacity-70 dark:opacity-60',
  fontSize = 16,
  targetFps = 30,
  speedMultiplier = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip canvas animation in headless test environments (jsdom)
    if (import.meta.env.MODE === 'test') {
      return;
    }

    if (!canvas || typeof canvas.getContext !== 'function') return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d', { alpha: true });
    } catch {
      return;
    }
    if (!ctx) return;

    // Detect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrameId: number;
    let lastTime = 0;
    const frameInterval = 1000 / targetFps;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let streams: Stream[] = [];

    const isDarkMode = () =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';

    const initStreams = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      const columns = Math.floor(width / (fontSize * 1.5));
      streams = [];

      for (let i = 0; i < columns; i++) {
        const streamLength = Math.floor(Math.random() * 14) + 8; // 8 to 22 chars
        const chars: string[] = [];
        for (let j = 0; j < streamLength; j++) {
          chars.push(Math.random() > 0.5 ? '1' : '0');
        }

        streams.push({
          x: i * fontSize * 1.5 + Math.random() * 5,
          y: Math.random() * -height, // Stagger initial starting positions
          speed: (Math.random() * 2 + 1.2) * speedMultiplier, // Falling speed
          length: streamLength,
          chars,
        });
      }
    };

    initStreams();

    const handleResize = () => {
      initStreams();
    };

    window.addEventListener('resize', handleResize);

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Throttle to target FPS for optimal battery and CPU performance
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);

      // Skip rendering if document is not visible
      if (document.hidden) return;

      const dark = isDarkMode();

      ctx.clearRect(0, 0, width, height);
      ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';

      for (let s = 0; s < streams.length; s++) {
        const stream = streams[s];

        // Randomly mutate bits to produce the authentic flickering matrix effect
        if (Math.random() < 0.1) {
          const randIdx = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randIdx] = Math.random() > 0.5 ? '1' : '0';
        }

        for (let i = 0; i < stream.length; i++) {
          const charY = stream.y - i * (fontSize + 3);

          // Only render characters on screen
          if (charY > -20 && charY < height + 30) {
            const char = stream.chars[i];

            if (i === 0) {
              // Stream head (Leading bit) - Brightest glow
              ctx.fillStyle = dark
                ? 'rgba(165, 243, 252, 0.95)' // glowing bright cyan
                : 'rgba(79, 70, 229, 0.9)'; // bold indigo
              ctx.shadowColor = dark ? '#38bdf8' : '#6366f1';
              ctx.shadowBlur = 8;
            } else {
              // Stream trail - Smooth fading gradient
              const fade = Math.max(0, 1 - i / stream.length);
              ctx.shadowBlur = 0;

              if (dark) {
                // Alternating cyber cyan / blue gradient in dark mode
                ctx.fillStyle =
                  i % 2 === 0
                    ? `rgba(56, 189, 248, ${fade * 0.45})`
                    : `rgba(99, 102, 241, ${fade * 0.4})`;
              } else {
                // Soft elegant indigo / slate in light mode
                ctx.fillStyle =
                  i % 2 === 0
                    ? `rgba(79, 70, 229, ${fade * 0.35})`
                    : `rgba(100, 116, 139, ${fade * 0.3})`;
              }
            }

            ctx.fillText(char, stream.x, charY);
          }
        }

        // Reset stream when it falls past the bottom
        stream.y += stream.speed * 4;
        const streamTail = stream.y - stream.length * (fontSize + 3);
        if (streamTail > height) {
          stream.y = Math.random() * -100;
          stream.speed = (Math.random() * 2 + 1.2) * speedMultiplier;
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [fontSize, targetFps, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'fixed inset-0 pointer-events-none z-0 transition-opacity duration-700',
        opacityClassName,
        className
      )}
    />
  );
};
