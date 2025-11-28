
import React from 'react';
import { NodeType, Language } from '../../types';
import { t } from '../../translations';

interface Props {
  x: number;
  y: number;
  onSelect: (type: NodeType) => void;
  onClose: () => void;
  lang: Language;
}

// Icons matching the requested line-art style
const Icons = {
  reference: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  asset: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  prompt: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  ),
  style: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.74 5.74-8.43 8.43-5.74-5.74L12 2.69z" />
      <path d="M3.56 12L12 20.44" />
      <path d="M17.6 15l2.84 2.84" />
    </svg>
  ),
  generator: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  preview: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export default function ContextMenu({ x, y, onSelect, onClose, lang }: Props) {
  const options: { type: NodeType; label: string; icon: React.ReactNode }[] = [
    { type: 'reference', label: t(lang, 'nodes.reference'), icon: Icons.reference },
    { type: 'asset', label: t(lang, 'nodes.asset'), icon: Icons.asset },
    { type: 'prompt', label: t(lang, 'nodes.prompt'), icon: Icons.prompt },
    { type: 'style', label: t(lang, 'nodes.style'), icon: Icons.style },
    { type: 'generator', label: t(lang, 'nodes.generator'), icon: Icons.generator },
    { type: 'preview', label: t(lang, 'nodes.preview'), icon: Icons.preview },
  ];

  return (
    <>
      {/* Handle closing when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }} 
      />
      <div 
        className="fixed z-50 bg-[#1e1e24] border border-[#2a2a35] rounded-xl shadow-2xl p-1.5 min-w-[220px] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1"
        style={{ top: y, left: x }}
        onMouseDown={(e) => e.stopPropagation()} // Prevent click from bubbling to App
      >
        <div className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider border-b border-gray-800/50 mb-1 select-none">
          {t(lang, 'addNode')}
        </div>
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={(e) => {
              e.stopPropagation(); // Prevent bubble
              onSelect(opt.type);
              onClose();
            }}
            className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-3 transition-all group"
          >
            <span className="text-gray-400 group-hover:text-accent-primary transition-colors">
              {opt.icon}
            </span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
