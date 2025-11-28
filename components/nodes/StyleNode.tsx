
import React from 'react';
import { Node, Language } from '../../types';
import { t } from '../../translations';
import { FORM_FIELDS } from '../../constants';

interface Props {
  node: Node;
  onChange: (data: any) => void;
  lang: Language;
}

export default function StyleNode({ node, onChange, lang }: Props) {
  const moodField = FORM_FIELDS.find(f => f.id === 'mood');
  const sizeField = FORM_FIELDS.find(f => f.id === 'dimensions');
  const typeField = FORM_FIELDS.find(f => f.id === 'designType');

  const { designType, mood, dimensions, colorPreference } = node.data;

  return (
    <div className="flex flex-col gap-3">
       <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.designType')}</label>
        <select 
          value={designType || ''}
          onChange={(e) => onChange({ designType: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none"
        >
          <option value="">Select</option>
          {typeField?.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.mood')}</label>
        <select 
          value={mood || ''}
          onChange={(e) => onChange({ mood: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none"
        >
          <option value="">Select</option>
          {moodField?.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.dimensions')}</label>
        <select 
          value={dimensions || ''}
          onChange={(e) => onChange({ dimensions: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none"
        >
          <option value="">Select</option>
          {sizeField?.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.colors')}</label>
        <input 
          type="text"
          value={colorPreference || ''}
          onChange={(e) => onChange({ colorPreference: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none"
          placeholder="..."
        />
      </div>
    </div>
  );
}
