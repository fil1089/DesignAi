
import React from 'react';
import { Language, GeminiModel } from '../../types';
import { t } from '../../translations';

interface Props {
  onRun: () => void;
  isGenerating: boolean;
  hasKey: boolean;
  onSelectKey: () => void;
  isValid: boolean;
  lang: Language;
  selectedModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
}

const MODELS: { id: GeminiModel; name: string; description: string }[] = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', description: 'Standard Quality' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro', description: 'High Quality' },
];

export default function GeneratorNode({ 
  onRun, 
  isGenerating, 
  hasKey, 
  onSelectKey, 
  isValid, 
  lang,
  selectedModel,
  onModelChange 
}: Props) {
  return (
    <div className="flex flex-col gap-3 p-2 min-h-[180px]">
      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
          {lang === 'ru' ? 'Выберите модель' : 'Select Model'}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`
                w-full px-3 py-2.5 rounded-lg text-left transition-all border
                ${selectedModel === model.id 
                  ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border-accent-primary text-white' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-semibold text-sm">{model.name}</div>
                  <div className="text-[10px] text-gray-400">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse-glow"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key / Run Button */}
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
            w-full py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg
            flex items-center justify-center gap-2 mt-2
            ${isGenerating || !isValid
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-accent-primary to-accent-secondary text-black hover:scale-105 hover:shadow-accent-primary/25'}
          `}
        >
          {isGenerating ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            t(lang, 'actions.run')
          )}
        </button>
      )}

      {isGenerating && (
         <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
           <div className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary animate-gradient-x w-full"></div>
         </div>
      )}
    </div>
  );
}