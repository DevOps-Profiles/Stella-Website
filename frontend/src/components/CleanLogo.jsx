import React from 'react';

export default function CleanLogo({ className, style, height, width, ...props }) {
  const sizeStyle =
    height != null
      ? { height, width: width ?? height, flexShrink: 0, ...style }
      : { flexShrink: 0, ...style };

  return (
    <img
      src="/logo1.jpeg"
      alt="Stella Icon"
      className={className}
      width={width ?? height ?? 44}
      height={height ?? 44}
      decoding="async"
      draggable={false}
      style={sizeStyle}
      {...props}
    />
  );
}
