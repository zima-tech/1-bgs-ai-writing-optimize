'use client';

import { useEffect, useState } from 'react';

type TrailDot = {
  id: number;
  x: number;
  y: number;
  hue: number;
};

export function LoginTrail() {
  const [dots, setDots] = useState<TrailDot[]>([]);

  useEffect(() => {
    let dragging = false;
    let dotId = 0;

    function updateTrail(event: PointerEvent) {
      const x = event.clientX;
      const y = event.clientY;
      const rootStyle = getComputedStyle(document.documentElement);
      const baseHue = Number(rootStyle.getPropertyValue('--login-trail-base-hue').trim()) || 214;
      const hueRange = Number(rootStyle.getPropertyValue('--login-trail-hue-range').trim()) || 34;
      const offset = dragging ? (x / Math.max(window.innerWidth, 1) - 0.5) * hueRange : 0;
      const hue = Math.round(baseHue + offset);

      document.documentElement.style.setProperty('--login-trail-x', `${x}px`);
      document.documentElement.style.setProperty('--login-trail-y', `${y}px`);
      document.documentElement.style.setProperty('--login-trail-hue', `${hue}`);

      setDots((current) => [...current.slice(-10), { id: dotId++, x, y, hue }]);
    }

    function handlePointerDown(event: PointerEvent) {
      dragging = true;
      updateTrail(event);
    }

    function handlePointerUp() {
      dragging = false;
    }

    window.addEventListener('pointermove', updateTrail);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', updateTrail);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  return (
    <div className="login-trail-layer" aria-hidden="true">
      <div className="login-trail-glow" />
      {dots.map((dot, index) => (
        <span
          key={dot.id}
          className="login-trail-dot"
          style={{
            left: dot.x,
            top: dot.y,
            ['--dot-hue' as string]: dot.hue,
            ['--dot-scale' as string]: 1 + index * 0.045
          }}
        />
      ))}
    </div>
  );
}
