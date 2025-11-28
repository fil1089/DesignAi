
import React from 'react';
import { Language } from '../../types';
import { t } from '../../translations';

interface Props {
  onRun: () => void;
  isGenerating: boolean;
  hasKey: boolean;
  onSelectKey: () => void;
  isValid: boolean;
  lang: Language;
}

export default function GeneratorNode({ onRun, isGenerating, hasKey, onSelectKey, isValid, lang }: Props) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center p-2 min-h-[140px]">
      <div className="text-center space-y-1">
        <h3 className="font-display font-bold text-accent-primary">Gemini 3 Pro</h3>
        <p className="text-[10px] text-gray-400">Image Generation Model</p>
      </div>

      {!hasKey ? (
        <button 
          onClick={onSelectKey}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-4 rounded transition-colors"
        >
          {t(lang, 'actions.connectApi')}
        </button>
      ) : (
        <button 
          onClick={onRun}
          disabled={isGenerating || !isValid}
          className={`
            w-full py-3 px-6 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg
            flex items-center justify-center gap-2
            ${isGenerating || !isValid
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-black hover:scale-105 hover:shadow-accent-primary/25'}
          `}
        >
          {isGenerating ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            t(lang, 'actions.run')
          )}
        </button>
      )}

      {isGenerating && (
         <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
           <div className="h-full bg-accent-primary animate-[shimmer_1s_infinite] w-full origin-left-right scale-x-50"></div>
         </div>
      )}
    </div>
  );
}
