import React, { useState } from 'react';
import { GenerationResult, StyleAnalysis } from '../types';

interface Props {
  result: GenerationResult | null;
  styleAnalysis: StyleAnalysis | null;
  isGenerating: boolean;
  error: string | null;
  onRegenerate: () => void;
}

export default function ResultDisplay({ result, styleAnalysis, isGenerating, error, onRegenerate }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const downloadImage = () => {
    if (!result?.image) return;
    const link = document.createElement('a');
    link.href = `data:${result.image.mimeType};base64,${result.image.data}`;
    link.download = `design-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card rounded-3xl border border-gray-800 p-6 md:p-8 min-h-[500px] flex flex-col h-full sticky top-24">
      <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-white">
        <span>✨</span> Result
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {isGenerating ? (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 border-4 border-accent-primary/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-accent-secondary border-r-accent-tertiary border-b-accent-primary border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">🎨</div>
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary animate-pulse">
                Creating Magic...
              </h3>
              <p className="text-gray-400 mt-2">Analyzing style and generating pixel-perfect design</p>
            </div>
          </div>
        ) : error ? (
           <div className="text-center max-w-sm mx-auto p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-red-400 font-semibold mb-2">Generation Failed</h3>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button onClick={onRegenerate} className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
              Try Again
            </button>
           </div>
        ) : result?.image ? (
          <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
             <div className="relative group rounded-xl overflow-hidden shadow-2xl bg-black">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                <img 
                  src={`data:${result.image.mimeType};base64,${result.image.data}`} 
                  alt="Generated Design" 
                  className="w-full h-auto object-contain max-h-[600px] mx-auto"
                />
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={downloadImage}
                className="bg-accent-secondary hover:bg-accent-secondary/80 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-lg shadow-accent-secondary/25"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                 Download
               </button>
               <button 
                onClick={onRegenerate}
                className="bg-surface hover:bg-white/5 border border-gray-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                 Regenerate
               </button>
             </div>

             {styleAnalysis && (
               <div className="border-t border-gray-800 pt-4">
                 <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-gray-500 hover:text-white flex items-center gap-1 w-full justify-between"
                 >
                   <span>Generation Details</span>
                   <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </button>
                 {showDetails && (
                   <div className="mt-3 text-xs text-gray-400 space-y-2 bg-black/20 p-3 rounded-lg">
                     <p><span className="text-gray-300 font-semibold">Style Analysis:</span> {styleAnalysis.styleDescription}</p>
                     {result.text && <p><span className="text-gray-300 font-semibold">AI Notes:</span> {result.text}</p>}
                   </div>
                 )}
               </div>
             )}
          </div>
        ) : (
          <div className="text-center opacity-40 max-w-xs">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">Ready to create</p>
            <p className="text-sm">Upload a reference and fill the brief to start generation</p>
          </div>
        )}
      </div>
    </div>
  );
}