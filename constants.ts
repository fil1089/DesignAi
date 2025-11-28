import { FormField } from './types';

export const FORM_FIELDS: FormField[] = [
  {
    id: "designType",
    type: "select",
    label: "Тип дизайна / Design Type",
    placeholder: "Select type",
    required: true,
    options: [
      { value: "banner", label: "Ad Banner" },
      { value: "product_card", label: "Product Card" },
      { value: "social_post", label: "Social Media Post" },
      { value: "story", label: "Story (IG/TikTok)" },
      { value: "email_header", label: "Email Header" },
      { value: "promo", label: "Promo Material" }
    ]
  },
  {
    id: "headline",
    type: "text",
    label: "Заголовок / Headline",
    placeholder: "Main headline text",
    required: true,
    maxLength: 60
  },
  {
    id: "subheadline",
    type: "text",
    label: "Подзаголовок / Subheadline",
    placeholder: "Optional subtitle",
    required: false,
    maxLength: 100
  },
  {
    id: "ctaText",
    type: "text",
    label: "Кнопка (CTA) / Button Text",
    placeholder: "e.g., Buy Now, Learn More",
    required: false,
    maxLength: 25
  },
  {
    id: "productDescription",
    type: "textarea",
    label: "Описание продукта / Product Description",
    placeholder: "Describe what needs to be shown...",
    required: true,
    maxLength: 500
  },
  {
    id: "targetAudience",
    type: "text",
    label: "Целевая аудитория / Target Audience",
    placeholder: "e.g., Gamers, Moms, Tech enthusiasts",
    required: false,
    maxLength: 100
  },
  {
    id: "mood",
    type: "select",
    label: "Настроение / Mood",
    placeholder: "Select mood",
    required: true,
    options: [
      { value: "professional", label: "Professional" },
      { value: "playful", label: "Playful" },
      { value: "luxury", label: "Luxury" },
      { value: "minimalist", label: "Minimalist" },
      { value: "bold", label: "Bold/Neon" },
      { value: "warm", label: "Warm/Cozy" },
      { value: "tech", label: "High-Tech" },
      { value: "natural", label: "Natural/Eco" }
    ]
  },
  {
    id: "colorPreference",
    type: "text",
    label: "Цвета / Colors",
    placeholder: "e.g., Blue and White, Dark Mode",
    required: false,
    maxLength: 100
  },
  {
    id: "dimensions",
    type: "select",
    label: "Размер / Size",
    placeholder: "Select size",
    required: true,
    options: [
      { value: "1:1", label: "Square (1:1)" },
      { value: "16:9", label: "Landscape (16:9)" },
      { value: "9:16", label: "Portrait/Story (9:16)" },
      { value: "4:3", label: "Standard (4:3)" },
      { value: "3:4", label: "Portrait (3:4)" }
    ]
  },
  {
    id: "additionalInstructions",
    type: "textarea",
    label: "Дополнительно / Instructions",
    placeholder: "Any extra constraints or wishes...",
    required: false,
    maxLength: 300
  }
];

export const INITIAL_FORM_DATA = {
  designType: '',
  headline: '',
  subheadline: '',
  ctaText: '',
  productDescription: '',
  targetAudience: '',
  mood: '',
  colorPreference: '',
  dimensions: '',
  additionalInstructions: ''
};