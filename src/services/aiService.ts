import { GoogleGenAI } from "@google/genai";
import { DetectionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFrame(base64Image: string): Promise<DetectionResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `You are an advanced border surveillance AI. Analyze this camera frame for suspicious activity.
              
              CRITICAL RULES:
              1. IGNORE: Personnel in proper Indian Army uniforms (friendly forces).
              2. IGNORE: Animals, birds, and natural vegetation changes.
              3. DETECT: Unauthorized persons, individuals NOT in Indian Army uniform, individuals attempting to hide, unusual movement patterns, or any activity that looks like a border breach.
              4. WEAPONS: Specifically flag if weapons are carried by non-uniformed personnel.
              5. FACE RECOGNITION: Analyze faces for suspicious behavior or concealment.
              
              Respond in JSON format with the following structure:
              {
                "isSuspicious": boolean,
                "threatLevel": "low" | "medium" | "high" | "critical",
                "description": "brief explanation of what was found",
                "detectedObjects": ["list", "of", "relevant", "objects"]
              }`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] // Remove data:image/jpeg;base64,
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      isSuspicious: result.isSuspicious ?? false,
      threatLevel: result.threatLevel ?? 'low',
      description: result.description ?? "No suspicious activity detected.",
      detectedObjects: result.detectedObjects ?? []
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      isSuspicious: false,
      threatLevel: 'low',
      description: "Error analyzing frame.",
      detectedObjects: []
    };
  }
}
