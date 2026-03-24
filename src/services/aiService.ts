import { GoogleGenAI } from "@google/genai";
import { DetectionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFrame(base64Image: string, visionMode: string = 'normal', activeCamera: string = 'ALPHA'): Promise<DetectionResult> {
  try {
    const visionContext = visionMode === 'thermal' 
      ? "NOTE: The operator is using THERMAL VISION. Analyze for heat signatures and thermal anomalies. Brighter spots typically indicate human body heat."
      : visionMode === 'night'
      ? "NOTE: The operator is using NIGHT VISION. Analyze for movement and silhouettes in low-light conditions."
      : "The operator is using STANDARD OPTICAL VISION.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `You are an advanced border surveillance AI. ${visionContext} The current camera is ${activeCamera}. Analyze this camera frame for suspicious activity.
              
              CRITICAL RULES:
              1. IGNORE: Animals, birds, and natural vegetation changes.
              2. DETECT: Unauthorized persons, individuals clearly NOT in Indian Army uniform (when torso is visible), individuals attempting to hide, unusual movement patterns, or any activity that looks like a border breach.
              3. OPERATOR RECOGNITION: If you see a person sitting in front of the camera, likely in an office or command center environment, they are the OPERATOR. You MUST still include them in 'detectedObjects' with type 'friendly'. Only set 'isSuspicious' to true if they are clearly not in uniform AND their torso is visible, or if they are acting suspiciously.
              4. UNIFORM VISIBILITY: Do NOT assume a person is not in uniform if only their face or head is visible. You must see at least the shoulders/torso to determine uniform status. If only the face is visible, focus on facial concealment (masks, paint) or behavior.
              5. COORDINATES: For EVERY person detected, provide their 'x' and 'y' coordinates (0-100) representing the center of their body/face in the frame. This is CRITICAL for the HUD to work.
              6. ALERT MESSAGES: Use specific phrases like "PERSON DETECTED", "SUSPICIOUS PERSON NOT IN UNIFORM", "POTENTIAL BORDER BREACH", or "ARMED THREAT" in the description.
              7. WEAPONS: Specifically flag if weapons are carried by non-uniformed personnel.
              8. FACE RECOGNITION: Analyze faces for suspicious behavior or concealment.
              9. THREAT LEVELS:
                 - 'low': Minor anomalies, authorized personnel in unusual spots.
                 - 'medium': Suspicious persons, erratic movement.
                 - 'high': Armed individuals, clear border breach attempts.
                 - 'critical': Active engagement, weapons drawn, multiple intruders.
              10. SENSITIVITY: If you are unsure about a person's authorization, err on the side of caution and flag it as suspicious with a 'medium' or 'high' threat level.
              
              Respond in JSON format with the following structure:
              {
                "isSuspicious": boolean,
                "threatLevel": "low" | "medium" | "high" | "critical",
                "description": "brief explanation of what was found",
                "detectedObjects": [
                  {
                    "label": "string",
                    "x": number (0-100),
                    "y": number (0-100),
                    "type": "friendly" | "suspicious" | "armed"
                  }
                ],
                "visualCues": ["specific", "visual", "indicators"],
                "movementPattern": "steady" | "erratic" | "stealthy" | "aggressive",
                "temperature": number (estimated body temperature in Celsius, e.g., 36.8)
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
      detectedObjects: result.detectedObjects ?? [],
      visualCues: result.visualCues ?? [],
      movementPattern: result.movementPattern ?? 'steady',
      temperature: result.temperature
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
