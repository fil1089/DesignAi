import React from 'react';

interface Props {
  offset: { x: number; y: number };
  zoom: number;
}

export default function Background({ offset, zoom }: Props) {
  const gridSize = 20 * zoom;
  const opacity = Math.min(1, Math.max(0.1, zoom));
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
        opacity: opacity
      }}
    />
  );
}