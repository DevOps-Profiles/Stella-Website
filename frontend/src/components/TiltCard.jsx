import { useTilt } from '@/hooks/useTilt';

export default function TiltCard({ children, className = '', maxTilt = 10, scale = 1.02, ...rest }) {
  const { ref, glareRef, onPointerMove, onPointerLeave } = useTilt({ maxTilt, scale });

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerUp={onPointerLeave}
      onPointerCancel={onPointerLeave}
      className={`relative overflow-hidden min-w-0 max-w-full ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', contain: 'paint' }}
      {...rest}
    >
      {children}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
