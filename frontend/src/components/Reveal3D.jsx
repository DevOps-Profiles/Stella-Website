import { useEffect, useRef, useState } from 'react';

const VARIANTS = {
  up:    'reveal-3d--up',
  left:  'reveal-3d--left',
  right: 'reveal-3d--right',
  zoom:  'reveal-3d--zoom',
  flip:  'reveal-3d--flip',
};

/** True when any meaningful part of the element is on screen */
function isEnteringView(rect) {
  const vh = window.innerHeight || 0;
  if (!vh) return false;
  return rect.bottom > 48 && rect.top < vh - 24;
}

/**
 * Scroll reveal: show on scroll-down into view, hide on scroll-up / leave.
 */
export default function Reveal3D({
  as: Tag = 'div',
  children,
  className = '',
  variant = 'up',
  delay = 0,
  duration = 800,
  stagger = 0,
  refreshKey,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    setVisible(false);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Enter → visible, leave → hide (replays next time you scroll to it)
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(root);

    // First row / above-fold content should start visible
    if (isEnteringView(root.getBoundingClientRect())) {
      setVisible(true);
    }

    return () => observer.disconnect();
  }, [refreshKey]);

  const variantClass = VARIANTS[variant] || VARIANTS.up;
  const style = {
    '--reveal-delay': `${delay}ms`,
    '--reveal-duration': `${duration}ms`,
    '--reveal-stagger': `${Math.round(stagger)}ms`,
    overflowAnchor: 'none',
  };

  const classes = [
    'reveal-3d',
    variantClass,
    visible ? 'is-visible' : '',
    stagger > 0 ? 'reveal-3d--stagger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} style={style} {...rest}>
      {stagger > 0 ? children : <div className="reveal-3d__inner">{children}</div>}
    </Tag>
  );
}
