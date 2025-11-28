import React from 'react';
import { motion } from 'framer-motion';
import { GenerationResult, Language } from '../types';
import { t } from '../translations';

interface Props {
  isOpen: boolean;
  history: GenerationResult[];
  onToggle: () => void;
  lang: Language;
}

export default function GenerationHistoryPanel({ isOpen, history, onToggle, lang }: Props) {
  return (
    <motion.div
      initial={false}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-[300px] bg-card border-l border-gray-800 shadow-2xl z-30 flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-1/2 -left-6 -translate-y-1/2 w-6 h-24 bg-card border-l border-t border-b border-gray-800 rounded-l-lg flex items-center justify-center text-gray-400 hover:bg-surface"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </motion.svg>
      </button>

      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-display font-semibold text-white">{t(lang, 'history')}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 text-sm">
            <p>{t(lang, 'historyPlaceholder')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {history.map((item, index) =>
              item.image ? (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-700 aspect-square">
                  <img
                    src={`data:${item.image.mimeType};base64,${item.image.data}`}
                    alt={`Generated ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full">
                      Use
                    </button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}