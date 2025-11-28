import React, { useState } from 'react';
import { FORM_FIELDS } from '../constants';
import { FormData } from '../types';

interface Props {
  formData: FormData;
  onChange: (data: FormData) => void;
  onEnhance: (text: string) => Promise<void>;
  isEnhancing: boolean;
}

export default function BriefForm({ formData, onChange, onEnhance, isEnhancing }: Props) {
  const [activeSection, setActiveSection] = useState<'main' | 'style' | 'extra'>('main');

  const handleChange = (id: string, value: string) => {
    onChange({ ...formData, [id]: value });
  };

  const renderField = (field: typeof FORM_FIELDS[0]) => {
    const value = formData[field.id] || '';
    
    return (
      <div key={field.id} className="space-y-2 group">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-accent-tertiary">*</span>}
          </label>
          {field.id === 'productDescription' && (
            <button
              onClick={() => onEnhance(value)}
              disabled={isEnhancing || !value}
              className="text-xs flex items-center gap-1 text-accent-secondary hover:text-white disabled:opacity-50 transition-colors"
            >
              {isEnhancing ? (
                 <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
              AI Enhance
            </button>
          )}
        </div>

        {field.type === 'textarea' ? (
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              rows={4}
              className="w-full bg-surface border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all resize-none"
            />
            {field.maxLength && (
              <span className="absolute bottom-2 right-2 text-xs text-gray-600">
                {value.length}/{field.maxLength}
              </span>
            )}
          </div>
        ) : field.type === 'select' ? (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        ) : (
           <div className="relative">
             <input
              type="text"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className="w-full bg-surface border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
            />
          </div>
        )}
      </div>
    );
  };

  const sections = {
    main: ['designType', 'headline', 'subheadline', 'ctaText', 'productDescription'],
    style: ['mood', 'colorPreference', 'dimensions'],
    extra: ['targetAudience', 'additionalInstructions']
  };

  return (
    <div className="bg-card rounded-3xl border border-gray-800 p-6 md:p-8">
      <h2 className="text-xl font-display font-semibold mb-2 flex items-center gap-2 text-white">
        <span>📝</span> Design Brief
      </h2>
      <p className="text-gray-400 text-sm mb-6">Specify what you want in your design.</p>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-surface p-1 rounded-xl overflow-x-auto">
        {(['main', 'style', 'extra'] as const).map(section => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
              activeSection === section 
              ? 'bg-accent-secondary text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {section === 'main' && '⚡ Core Info'}
            {section === 'style' && '🎨 Style'}
            {section === 'extra' && '⚙️ Details'}
          </button>
        ))}
      </div>

      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        {FORM_FIELDS.filter(f => sections[activeSection].includes(f.id)).map(renderField)}
      </div>
    </div>
  );
}