import React from 'react';

export default function OldCleanLogo({ className, style, height = 48, ...props }) {
  return (
    <img
      src="/new-logo.png"
      alt="Stella Text Logo"
      className={className}
      style={{ height, ...style }}
      {...props}
    />
  );
}
