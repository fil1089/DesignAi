
import { GoogleGenAI, Type } from '@google/genai';
import { NodeData, StyleAnalysis, UploadedImage } from '../types';

class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeReferenceStyle(base64Image: string, mimeType: string): Promise<StyleAnalysis> {
    const ai = this.getClient();
    const model = 'gemini-2.5-flash';
    
    const prompt = `Analyze this design reference image. Return a JSON object with:
    1. 'styleDescription': A concise but descriptive summary of the visual style, atmosphere, and composition.
    2. 'colorPalette': Object with 'primary' (array of strings), 'accent' (array of strings), 'background' (string).
    3. 'typography': Object with 'style' (string describing fonts).
    
    Output JSON only.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              styleDescription: { type: Type.STRING },
              colorPalette: {
                type: Type.OBJECT,
                properties: {
                  primary: { type: Type.ARRAY, items: { type: Type.STRING } },
                  accent: { type: Type.ARRAY, items: { type: Type.STRING } },
                  background: { type: Type.STRING }
                }
              },
              typography: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as StyleAnalysis;
      }
      throw new Error("No analysis returned");
    } catch (error) {
      console.error("Style analysis failed:", error);
      return { styleDescription: "Modern professional style" };
    }
  }

  async generateDesign(
    data: NodeData, // Combined data from prompt/style nodes
    referenceImage: UploadedImage | null,
    assetImages: UploadedImage[],
    styleAnalysis: StyleAnalysis | null
  ) {
    const ai = this.getClient();
    
    // Construct Prompt
    let prompt = `Create a high-quality ${data.designType || 'image'}.`;
    
    prompt += `\n\nCONTENT REQUIREMENTS:
    - Headline text: "${data.headline || ''}"
    ${data.subheadline ? `- Subheadline: "${data.subheadline}"` : ''}
    - Subject/Product Description: ${data.productDescription || 'As shown in the asset images'}`;

    prompt += `\n\nSTYLE & ATMOSPHERE:
    - Mood: ${data.mood || 'Professional'}
    ${data.colorPreference ? `- Color Preferences: ${data.colorPreference}` : ''}`;

    if (styleAnalysis) {
      prompt += `\n- Style Reference Analysis: ${styleAnalysis.styleDescription}`;
    }

    if (assetImages.length > 0) {
      prompt += `\n\nASSETS:
      - Use the provided product/object images (marked as assets) as the main subject.
      - Integrate them naturally into the design.`;
    }

    prompt += `\n\nIMPORTANT:
    - The image must look like a finished professional design.
    - Ensure text layout is coherent.
    - Maintain the visual identity of the reference image provided (if any).`;

    // Prepare Parts
    const parts: any[] = [{ text: prompt }];

    // Add Reference Image
    if (referenceImage) {
      parts.push({ 
        inlineData: { 
          mimeType: referenceImage.mimeType, 
          data: referenceImage.base64 
        } 
      });
    }

    // Add Asset Images
    assetImages.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64
        }
      });
    });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts },
        config: {
          imageConfig: {
             aspectRatio: (data.dimensions as any) || "1:1",
          }
        }
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) throw new Error("No candidates returned");

      const contentParts = candidates[0].content.parts;
      
      let imagePart = null;
      let textPart = "";

      for (const part of contentParts) {
        if (part.inlineData) {
          imagePart = part.inlineData;
        } else if (part.text) {
          textPart += part.text;
        }
      }

      if (!imagePart) {
        throw new Error("No image generated.");
      }

      return {
        image: {
          data: imagePart.data,
          mimeType: imagePart.mimeType
        },
        text: textPart
      };

    } catch (e) {
      console.error("Design generation failed:", e);
      throw e;
    }
  }
}

export const geminiService = new GeminiService();
