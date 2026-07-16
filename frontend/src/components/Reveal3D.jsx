import { useEffect, useRef, useState } from 'react';

const VARIANTS = {
  up:    'reveal-3d--up',
  left:  'reveal-3d--left',
  right: 'reveal-3d--right',
  zoom:  'reveal-3d--zoom',
  flip:  'reveal-3d--flip',
};

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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Fires both on enter AND exit → re-hides when scrolled past
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(root);

    // Already in view on mount
    const rect = root.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setVisible(true);
    }

    return () => observer.disconnect();
  }, [refreshKey]);

  const variantClass = VARIANTS[variant] || VARIANTS.up;
  const style = {
    '--reveal-delay': `${delay}ms`,
    '--reveal-duration': `${duration}ms`,
    '--reveal-stagger': `${Math.round(stagger)}ms`,
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
