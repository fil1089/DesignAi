
import React, { ReactNode, useRef, useLayoutEffect, useEffect } from 'react';
import { Node, NodeType } from '../../types';

interface Props {
  node: Node;
  isSelected?: boolean;
  children: ReactNode;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onClose?: () => void;
  title?: string;
  onPortMouseDown?: (e: React.MouseEvent, nodeId: string, type: 'input' | 'output') => void;
  onPortMouseUp?: (e: React.MouseEvent, nodeId: string, type: 'input' | 'output') => void;
  onResize?: (id: string, width: number, height: number) => void;
}

export default function NodeWrapper({ 
  node, 
  isSelected, 
  children, 
  onMouseDown, 
  onClose, 
  title,
  onPortMouseDown,
  onPortMouseUp,
  onResize
}: Props) {
  const nodeRef = useRef<HTMLDivElement>(null);

  // Use ResizeObserver to measure node size and avoid infinite loops
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (onResize) {
          onResize(node.id, width, height);
        }
      }
    });

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [node.id, onResize]);


  // Determine which ports to show based on node type
  const showInput = ['generator', 'preview'].includes(node.type);
  const showOutput = ['reference', 'asset', 'prompt', 'style', 'generator'].includes(node.type);

  // Tooltip text
  const getInputTooltip = (type: NodeType) => {
    if (type === 'generator') return "Connect Reference, Asset, Prompt, or Style nodes";
    if (type === 'preview') return "Connect Generator node";
    return "Input";
  };

  const getOutputTooltip = (type: NodeType) => {
    if (type === 'generator') return "Connect to Preview node";
    return "Connect to Generator node";
  };

  return (
    <div
      ref={nodeRef}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      className={`absolute shadow-xl rounded-xl bg-card border transition-shadow duration-200 backdrop-blur-sm
        ${isSelected ? 'border-accent-primary shadow-accent-primary/20 z-20' : 'border-gray-800 hover:border-gray-600 z-10'}
      `}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        width: node.width ? `${node.width}px` : 'auto',
        minWidth: '250px'
      }}
    >
      {/* Header */}
      <div className="bg-surface/50 p-2 rounded-t-xl border-b border-gray-800 flex items-center justify-between cursor-grab active:cursor-grabbing group">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-accent-primary' : 'bg-gray-600'}`} />
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-gray-300">
            {title || node.data.title}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {children}
      </div>

      {/* Input Port (Left) */}
      {showInput && (
        <div 
          className="node-port node-port-left"
          title={getInputTooltip(node.type)}
          onMouseDown={(e) => onPortMouseDown?.(e, node.id, 'input')}
          onMouseUp={(e) => onPortMouseUp?.(e, node.id, 'input')}
        />
      )}

      {/* Output Port (Right) */}
      {showOutput && (
        <div 
          className="node-port node-port-right"
          title={getOutputTooltip(node.type)}
          onMouseDown={(e) => onPortMouseDown?.(e, node.id, 'output')}
          onMouseUp={(e) => onPortMouseUp?.(e, node.id, 'output')}
        />
      )}
    </div>
  );
}
