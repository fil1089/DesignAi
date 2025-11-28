
export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select';
  label: string;
  placeholder: string;
  required: boolean;
  maxLength?: number;
  options?: FormFieldOption[];
}

export interface UploadedImage {
  file: File;
  base64: string;
  preview: string;
  mimeType: string;
}

export interface GenerationResult {
  image?: {
    data: string;
    mimeType: string;
  };
  text?: string;
  styleDescription?: string;
}

export interface StyleAnalysis {
  colorPalette?: { primary: string[]; accent: string[]; background: string };
  typography?: { style: string };
  styleDescription: string;
}

// Node Graph Types
export interface Position {
  x: number;
  y: number;
}

export type NodeType = 'reference' | 'asset' | 'prompt' | 'style' | 'generator' | 'preview';

export interface NodeData {
  title: string;
  // Dynamic data storage
  image?: UploadedImage | null;
  headline?: string;
  subheadline?: string;
  productDescription?: string;
  designType?: string;
  mood?: string;
  dimensions?: string;
  colorPreference?: string;
  result?: GenerationResult | null;
  error?: string | null;
  [key: string]: any;
}

export interface Node {
  id: string;
  type: NodeType;
  position: Position;
  data: NodeData;
  width?: number;
  height?: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  fromHandle?: string;
  toHandle?: string;
}

export type Language = 'en' | 'ru';

export interface FormData {
  designType: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  productDescription: string;
  targetAudience: string;
  mood: string;
  colorPreference: string;
  dimensions: string;
  additionalInstructions: string;
  [key: string]: string;
}
