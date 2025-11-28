
import React from 'react';
import { Node, Language } from '../../types';
import { t } from '../../translations';

interface Props {
  node: Node;
  lang: Language;
}

export default function PreviewNode({ node, lang }: Props) {
  const { result, error } = node.data;

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
    <div className="flex flex-col gap-2 min-h-[200px] justify-center">
      {error ? (
        <div className="text-red-400 text-xs p-2 bg-red-900/20 rounded border border-red-900/50 text-center">
          {error}
        </div>
      ) : result?.image ? (
        <div className="relative group">
          <img 
            src={`data:${result.image.mimeType};base64,${result.image.data}`} 
            alt="Generated" 
            className="w-full h-auto rounded-lg shadow-lg border border-gray-700"
          />
          <button 
             onClick={downloadImage}
             className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {t(lang, 'actions.save')}
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-600">
           <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center">
             <span className="text-2xl">🖼️</span>
           </div>
           <p className="text-xs">{t(lang, 'status.waiting')}</p>
        </div>
      )}
    </div>
  );
}
