import { useCallback, useRef } from 'react';

/**
 * Returns { ref, onMouseMove, onMouseLeave } for CSS 3D tilt + specular highlight.
 * maxTilt: degrees of tilt, glare: show specular highlight
 */
export function useTilt({ maxTilt = 12, scale = 1.03, glare = true } = {}) {
  const ref = useRef(null);
  const glareRef = useRef(null);

  const onPointerMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * maxTilt;
    const rotY = dx * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    el.style.transition = 'transform 0.05s linear';

    if (glare && glareRef.current) {
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.18) 0%, transparent 60%)`;
      glareRef.current.style.opacity = '1';
    }
  }, [maxTilt, scale, glare]);

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [glare]);

  return { ref, glareRef, onPointerMove, onPointerLeave };
}
