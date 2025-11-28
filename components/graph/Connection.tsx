import React from 'react';
import { Position } from '../../types';

interface Props {
  start: Position;
  end: Position;
  color?: string;
  onDoubleClick?: () => void;
}

export default function ConnectionLine({ start, end, color = '#7b61ff', onDoubleClick }: Props) {
  // Bezier curve logic
  const dist = Math.abs(end.x - start.x);
  const controlOffset = Math.max(dist * 0.5, 50);
  
  const path = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

  return (
    <g onDoubleClick={onDoubleClick} className="cursor-pointer group">
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
      />
      {/* Base static line */}
      <path
        d={path}
        stroke="#374151" // gray-700
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Animated flowing line */}
      <path
        d={path}
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="5 5"
        className="connection-flow"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </g>
  );
}