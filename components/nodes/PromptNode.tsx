
import React from 'react';
import { Node, Language } from '../../types';
import { t } from '../../translations';

interface Props {
  node: Node;
  onChange: (data: any) => void;
  lang: Language;
}

export default function PromptNode({ node, onChange, lang }: Props) {
  const { headline, productDescription, subheadline } = node.data;

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.headline')}</label>
        <input 
          type="text"
          value={headline || ''}
          onChange={(e) => onChange({ headline: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none"
          placeholder="Big Sale!"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.description')}</label>
        <textarea 
          value={productDescription || ''}
          onChange={(e) => onChange({ productDescription: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none resize-y min-h-[80px]"
          placeholder="..."
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">{t(lang, 'labels.subheadline')}</label>
        <input 
          type="text"
          value={subheadline || ''}
          onChange={(e) => onChange({ subheadline: e.target.value })}
          className="w-full bg-surface border border-gray-700 rounded p-2 text-sm text-white focus:border-accent-primary focus:outline-none"
          placeholder="..."
        />
      </div>
    </div>
  );
}
