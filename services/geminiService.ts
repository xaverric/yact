import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, MealType, MealSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    food_name: { type: Type.STRING, description: "Název jídla v Češtině, krátký a výstižný" },
    quantity_description: { type: Type.STRING, description: "Popis množství (např. '200g', '1 kus', 'celá porce')" },
    calories: { type: Type.INTEGER, description: "Celkové kalorie (kcal)" },
    protein_g: { type: Type.NUMBER, description: "Bílkoviny v gramech" },
    carbs_g: { type: Type.NUMBER, description: "Sacharidy v gramech" },
    fat_g: { type: Type.NUMBER, description: "Tuky v gramech" },
    confidence_score: { type: Type.NUMBER, description: "Jistota modelu (0.0 až 1.0)" }
  },
  required: ["food_name", "calories", "protein_g", "carbs_g", "fat_g", "confidence_score"],
};

export const analyzeFoodText = async (text: string): Promise<AIAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyzuj následující text popisující jídlo a odhadni nutriční hodnoty co nejpřesněji.
      Text: "${text}"
      
      Pokud text nedává smysl jako jídlo, vrať JSON s null hodnotami nebo nízkým confidence_score.
      Vrať odhad pro celkové množství zmíněné v textu.
      Název jídla (food_name) uveď v Češtině.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    return JSON.parse(response.text || "null") as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini text analysis failed:", error);
    return null;
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<AIAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identifikuj jídlo na obrázku a odhadni jeho nutriční hodnoty (kalorie, proteiny, sacharidy, tuky) pro celou porci, kterou vidíš. Odpověz v češtině formou JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    return JSON.parse(response.text || "null") as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini image analysis failed:", error);
    return null;
  }
};

export const suggestMealPlan = async (remainingCalories: number, type: MealType): Promise<MealSuggestion[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Mám ještě ${remainingCalories} kcal do svého denního limitu. 
            Navrhni mi přesně 3 varianty pro: ${type}.
            Jídla musí být nutričně vyvážená a vejít se do limitu (pokud je limit velmi malý, navrhni něco lehkého).
            Odpověz v JSON formátu.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Název jídla" },
                            description: { type: Type.STRING, description: "Krátký popis ingrediencí (max 10 slov)" },
                            calories: { type: Type.INTEGER },
                            protein: { type: Type.NUMBER },
                            carbs: { type: Type.NUMBER },
                            fat: { type: Type.NUMBER },
                            reason: { type: Type.STRING, description: "Krátká věta, proč je to dobrá volba (např. 'Vysoký obsah bílkovin')" }
                        },
                        required: ["name", "description", "calories", "protein", "carbs", "fat", "reason"]
                    }
                }
            }
        });
        
        return JSON.parse(response.text || "[]") as MealSuggestion[];
    } catch (e) {
        console.error("Meal suggestion failed", e);
        return [];
    }
}