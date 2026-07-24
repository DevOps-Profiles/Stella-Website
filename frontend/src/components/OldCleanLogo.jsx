import React from 'react';

/** Optimized wordmark (~560px / 33KB). Avoid /new-logo.png in UI — it is 8K/3.7MB and glitches on mobile. */
export default function OldCleanLogo({ className, style, height, width, ...props }) {
  const sizeStyle =
    height != null
      ? { height, width: width ?? 'auto', flexShrink: 0, ...style }
      : { flexShrink: 0, ...style };

  return (
    <img
      src="/images/stella-wordmark.png"
      alt="Stella Text Logo"
      className={className}
      width={width ?? 140}
      height={height ?? 44}
      decoding="async"
      draggable={false}
      style={sizeStyle}
      {...props}
    />
  );
}
