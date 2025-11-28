
import React, { useRef, useState } from 'react';
import { Node, UploadedImage, Language } from '../../types';
import { t } from '../../translations';

interface Props {
  node: Node;
  onChange: (data: any) => void;
  lang: Language;
}

export default function AssetNode({ node, onChange, lang }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const image = node.data.image;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange({
          image: {
            file,
            base64: (e.target.result as string).split(',')[1],
            preview: e.target.result as string,
            mimeType: file.type
          } as UploadedImage
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div 
      className="flex flex-col gap-2 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-accent-tertiary/20 border-2 border-dashed border-accent-tertiary rounded-lg z-10 flex items-center justify-center pointer-events-none">
          <p className="font-bold text-accent-tertiary">{t(lang, 'actions.drop')}</p>
        </div>
      )}

      <input 
        type="file" 
        ref={inputRef} 
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} 
        className="hidden" 
        accept="image/*"
      />
      
      {image ? (
        <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
          <img 
            src={image.preview} 
            alt="Asset" 
            className="w-full h-32 object-contain bg-black/20 rounded-lg border border-gray-700"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); onChange({ image: null }); }}
            className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="mt-1 text-xs text-center text-gray-400 truncate w-full px-2">
            {image.file.name}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="h-32 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent-tertiary hover:bg-white/5 transition-all text-gray-500 hover:text-gray-300"
        >
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <span className="text-xs font-medium">{t(lang, 'actions.upload')}</span>
        </div>
      )}
    </div>
  );
}