
import React, { useRef, useState } from 'react';
import { Node, UploadedImage, Language } from '../../types';
import { t } from '../../translations';

interface Props {
  node: Node;
  onChange: (data: any) => void;
  lang: Language;
}

export default function ReferenceNode({ node, onChange, lang }: Props) {
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
        <div className="absolute inset-0 bg-accent-primary/20 border-2 border-dashed border-accent-primary rounded-lg z-10 flex items-center justify-center pointer-events-none">
          <p className="font-bold text-accent-primary">{t(lang, 'actions.drop')}</p>
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
            alt="Reference" 
            className="w-full h-48 object-cover rounded-lg border border-gray-700"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); onChange({ image: null }); }}
            className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="mt-2 text-xs text-gray-400 truncate max-w-[220px]">
            {image.file.name}
          </div>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="h-48 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-accent-primary hover:bg-white/5 transition-all text-gray-500 hover:text-gray-300"
        >
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-xs font-medium">{t(lang, 'actions.upload')}</span>
        </div>
      )}
    </div>
  );
}