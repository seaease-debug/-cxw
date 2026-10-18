
import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization using process.env.API_KEY as a hard requirement
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeAssetScrapDecision(asset: Asset, maintenanceHistory: string[]) {
    const prompt = `
      You are an expert school asset manager. 
      Analyze the following asset and provide a recommendation on whether it should be repaired, scrapped, or continued to be used.
      
      Asset Details:
      - Name: ${asset.name}
      - Type: ${asset.type}
      - Purchase Date: ${asset.purchaseDate}
      - Purchase Price: ${asset.purchasePrice}
      - Current Status: ${asset.currentStatus}
      - Days until 8-year scrap standard: ${asset.remainingDays}
      
      Recent Maintenance History:
      ${maintenanceHistory.join('\n')}
      
      Respond in JSON format with fields: "recommendation" (string), "reasoning" (string), "action" (string - REPAIR, SCRAP, KEEP).
    `;

    try {
      // Use ai.models.generateContent to query GenAI with both the model name and prompt.
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ['recommendation', 'reasoning', 'action']
          }
        }
      });
      // Correctly access the .text property (not a method) from GenerateContentResponse.
      const jsonStr = response.text || '';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return null;
    }
  }

  async generateAssetTagDescription(asset: Asset) {
     const prompt = `Write a short, professional description for an asset tag of a ${asset.name} (${asset.specification}) used in a school environment. Keep it under 50 characters.`;
     const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
     });
     // Correctly access the .text property (not a method) from GenerateContentResponse.
     return response.text;
  }
}

export const geminiService = new GeminiService();
