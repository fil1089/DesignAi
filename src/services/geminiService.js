import { GoogleGenAI } from '@google/genai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('API ключ не указан');
    }
    this.genAI = new GoogleGenAI({ apiKey });
    // Используем gemini-2.0-flash-exp для генерации изображений
    this.model = this.genAI.models;
  }

  async analyzeReferenceStyle(imageBase64, mimeType) {
    if (!this.model) {
      throw new Error('Сервис не инициализирован. Укажите API ключ.');
    }

    const prompt = `Ты эксперт по визуальному дизайну. Детально проанализируй это референсное изображение и опиши:

1. **Цветовая палитра**: основные и акцентные цвета, их сочетания
2. **Типографика**: стиль шрифтов, размеры, расположение текста
3. **Композиция**: расположение элементов, баланс, фокус
4. **Визуальные элементы**: формы, паттерны, иконки, декоративные элементы
5. **Общая атмосфера**: настроение, стиль (минимализм, максимализм, ретро, современный и т.д.)
6. **Техники**: градиенты, тени, эффекты, текстуры

Ответ дай в формате JSON:
{
  "colorPalette": {
    "primary": ["цвет1", "цвет2"],
    "accent": ["цвет1"],
    "background": "описание фона"
  },
  "typography": {
    "style": "описание",
    "placement": "описание"
  },
  "composition": "описание",
  "visualElements": ["элемент1", "элемент2"],
  "atmosphere": "описание",
  "techniques": ["техника1", "техника2"],
  "styleDescription": "Краткое общее описание стиля для использования в промпте генерации"
}`;

    try {
      const response = await this.model.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      });

      const text = response.text;
      
      // Извлекаем JSON из ответа
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return { styleDescription: text };
    } catch (error) {
      console.error('Ошибка анализа стиля:', error);
      throw new Error(`Не удалось проанализировать референс: ${error.message}`);
    }
  }

  buildPrompt(formData, styleAnalysis, promptConfig) {
    const designTypeLabels = {
      banner: 'рекламный баннер',
      product_card: 'карточку товара',
      social_post: 'пост для социальных сетей',
      story: 'Stories для Instagram/VK',
      email_header: 'заголовок email-рассылки',
      promo: 'промо-материал'
    };

    const styleDesc = styleAnalysis?.styleDescription || 'современный и привлекательный стиль';
    
    let prompt = `Создай ${designTypeLabels[formData.designType] || 'дизайн'} со следующими характеристиками:

**СТИЛЬ РЕФЕРЕНСА (обязательно сохранить):**
${styleDesc}

**КОНТЕНТ:**
- Главный заголовок: "${formData.headline}"
- Основное содержание: ${formData.productDescription}
**НАСТРОЕНИЕ:** ${formData.mood}
**РАЗМЕР:** ${formData.dimensions}`;

    return prompt;
  }

  // New method for Node Graph UI with multiple images support
  async generateFromGraph(images, promptText) {
    if (!this.model) {
      throw new Error('Service not initialized. Please provide API Key.');
    }

    // Construct the request parts
    const parts = [
      { text: `Create a professional design based on the following instructions and reference images.\n\nINSTRUCTIONS:\n${promptText}` }
    ];

    // Add all images to the prompt
    images.forEach((img, index) => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64
        }
      });
      parts.push({ text: `\n[Reference Image ${index + 1}]` });
    });

    parts.push({ text: "\n\nAnalyze the style of the provided images and create a cohesive design that follows the text instructions. Output a high-quality image." });

    try {
      const response = await this.model.generateContent({
        model: 'gemini-3-pro-image-preview', // Using image model
        contents: { parts }
      });
      
      const contentParts = response.candidates?.[0]?.content?.parts || [];
      
      let generatedImage = null;
      let textResponse = '';

      for (const part of contentParts) {
        if (part.inlineData) {
          generatedImage = {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
          };
        } else if (part.text) {
          textResponse += part.text;
        }
      }

      if (!generatedImage && !textResponse) {
        throw new Error('No content generated');
      }

      return {
        image: generatedImage,
        text: textResponse
      };
    } catch (error) {
      console.error('Generation error:', error);
      throw new Error(`Failed to generate design: ${error.message}`);
    }
  }

  async generateDesign(referenceImageBase64, referenceMimeType, formData, styleAnalysis = null) {
    if (!this.model) {
      throw new Error('Сервис не инициализирован. Укажите API ключ.');
    }

    if (!styleAnalysis) {
      styleAnalysis = await this.analyzeReferenceStyle(referenceImageBase64, referenceMimeType);
    }

    const prompt = this.buildPrompt(formData, styleAnalysis);

    try {
      const response = await this.model.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: referenceMimeType,
                data: referenceImageBase64
              }
            }
          ]
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      
      let generatedImage = null;
      let textResponse = '';

      for (const part of parts) {
        if (part.inlineData) {
          generatedImage = {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
          };
        } else if (part.text) {
          textResponse += part.text;
        }
      }

      return {
        image: generatedImage,
        text: textResponse,
        styleAnalysis,
        prompt
      };
    } catch (error) {
      console.error('Ошибка генерации:', error);
      throw new Error(`Не удалось сгенерировать дизайн: ${error.message}`);
    }
  }

  async enhancePrompt(userDescription) {
    if (!this.model) {
      throw new Error('Сервис не инициализирован');
    }
    const prompt = `Refine this design description for AI image generation: "${userDescription}". Return only the refined prompt.`;
    try {
      const response = await this.model.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      return userDescription;
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
