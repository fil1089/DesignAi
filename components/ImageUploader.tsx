import React, { useRef, useState } from 'react';
import { UploadedImage } from '../types';

interface Props {
  onImageUpload: (image: UploadedImage | null) => void;
  uploadedImage: UploadedImage | null;
}

export default function ImageUploader({ onImageUpload, uploadedImage }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const result = e.target.result as string;
        // Extract base64
        const base64 = result.split(',')[1];
        onImageUpload({
          file,
          base64,
          preview: result,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageUpload(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-display font-semibold mb-2 flex items-center gap-2 text-white">
        <span>📷</span> Reference Image
      </h2>
      <p className="text-gray-400 text-sm mb-4">Upload a design you like. The AI will copy its style.</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          min-h-[300px] flex flex-col items-center justify-center overflow-hidden group
          ${uploadedImage ? 'border-accent-secondary bg-surface' : 'border-gray-700 bg-card hover:bg-surface hover:border-accent-primary'}
          ${isDragging ? 'border-accent-primary bg-accent-primary/10' : ''}
        `}
      >
        <input 
          type="file" 
          ref={inputRef} 
          onChange={handleChange} 
          className="hidden" 
          accept="image/*"
        />

        {uploadedImage ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <img 
              src={uploadedImage.preview} 
              alt="Reference" 
              className="max-h-[350px] max-w-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-lg">
              <div className="text-center">
                 <button 
                  onClick={handleRemove}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transform hover:scale-110 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <p className="mt-2 text-sm font-medium">Click to remove</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-xs text-gray-300 truncate">
               {uploadedImage.file.name} ({(uploadedImage.file.size / 1024).toFixed(0)} KB)
            </div>
          </div>
        ) : (
          <div className="space-y-4 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary p-[2px] animate-pulse">
               <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               </div>
            </div>
            <div>
              <p className="text-lg font-medium text-white">Drop image here</p>
              <p className="text-sm text-gray-400">or click to browse</p>
            </div>
            <div className="text-xs text-gray-500 bg-white/5 rounded-full px-3 py-1 inline-block">
              PNG, JPG, WEBP
            </div>
          </div>
        )}
      </div>
    </div>
  );
}