import React from 'react';

export default function CleanLogo({ className, style, height = 48, ...props }) {
  return (
    <img
      src="/logo1.jpeg"
      alt="Stella Icon"
      className={className}
      style={{ height, ...style }}
      {...props}
    />
  );
}
