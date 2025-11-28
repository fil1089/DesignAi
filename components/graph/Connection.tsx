
import React from 'react';
import { Position } from '../../types';

interface Props {
  start: Position;
  end: Position;
  color?: string;
}

export default function Connection({ start, end, color = '#555' }: Props) {
  // Bezier curve logic
  const dist = Math.abs(end.x - start.x);
  const controlOffset = Math.max(dist * 0.5, 50);
  
  const path = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible z-0">
      <path
        d={path}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        className="opacity-70 drop-shadow-md"
      />
      <circle cx={start.x} cy={start.y} r="4" fill={color} />
      <circle cx={end.x} cy={end.y} r="4" fill={color} />
    </svg>
  );
}
