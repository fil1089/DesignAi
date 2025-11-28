import { Language } from './types';

export const translations = {
  en: {
    addNode: "Add Node",
    history: "Generation History",
    historyPlaceholder: "Generated images will appear here.",
    nodes: {
      reference: "Style Reference",
      asset: "Asset / Object",
      prompt: "Brief / Text",
      style: "Settings",
      generator: "Model",
      preview: "Result",
    },
    actions: {
      upload: "Upload Image",
      drop: "Drop image here",
      remove: "Remove",
      run: "Run Model",
      download: "Download",
      regenerate: "Regenerate",
      connectApi: "Connect API Key",
      save: "Save"
    },
    labels: {
      headline: "Headline",
      subheadline: "Subheadline",
      description: "Description",
      designType: "Design Type",
      mood: "Mood",
      dimensions: "Size",
      colors: "Colors",
    },
    status: {
      waiting: "Waiting for inputs...",
      generating: "Generating...",
      ready: "Ready to create"
    }
  },
  ru: {
    addNode: "Добавить ноду",
    history: "История генераций",
    historyPlaceholder: "Сгенерированные изображения появятся здесь.",
    nodes: {
      reference: "Референс стиля",
      asset: "Объект / Товар",
      prompt: "ТЗ / Текст",
      style: "Настройки",
      generator: "Модель",
      preview: "Результат",
    },
    actions: {
      upload: "Загрузить фото",
      drop: "Перетащите фото",
      remove: "Удалить",
      run: "Запустить",
      download: "Скачать",
      regenerate: "Пересоздать",
      connectApi: "Подключить API",
      save: "Сохранить"
    },
    labels: {
      headline: "Заголовок",
      subheadline: "Подзаголовок",
      description: "Описание",
      designType: "Тип дизайна",
      mood: "Настроение",
      dimensions: "Размер",
      colors: "Цвета",
    },
    status: {
      waiting: "Ожидание данных...",
      generating: "Генерация...",
      ready: "Готов к работе"
    }
  }
};

export const t = (lang: Language, path: string): string => {
  const keys = path.split('.');
  let current: any = translations[lang];
  for (const key of keys) {
    if (current[key] === undefined) return path;
    current = current[key];
  }
  return current;
};