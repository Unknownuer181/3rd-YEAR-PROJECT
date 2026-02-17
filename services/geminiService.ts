import { GoogleGenAI, Type } from "@google/genai";
import { Packet, GeminiAnalysisResult } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzePacket = async (packet: Packet): Promise<GeminiAnalysisResult> => {
  if (!apiKey) {
    return {
      riskScore: 0,
      analysis: "API Key missing. Cannot perform AI audit.",
      recommendation: "Please configure your environment variables.",
    };
  }

  const prompt = `
    You are an advanced AI cybersecurity analyst integrated into a blockchain firewall.
    Analyze the following network packet metadata for potential threats.
    
    Packet Details:
    - Source IP: ${packet.sourceIP}
    - Destination IP: ${packet.destIP}
    - Protocol: ${packet.protocol}
    - Port: ${packet.port}
    - Size: ${packet.size} bytes
    - Status: ${packet.status}
    - Payload Hash: ${packet.payloadHash}

    Determine the risk level (0-100), identify the potential threat type (e.g., DDoS, SQL Injection, Port Scanning, Benign), provide a brief technical analysis, and a recommended action.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            threatType: { type: Type.STRING },
          },
          required: ["riskScore", "analysis", "recommendation", "threatType"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as GeminiAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      riskScore: 50,
      analysis: "AI Analysis unavailable due to an error.",
      recommendation: "Manual inspection required.",
      threatType: "Unknown",
    };
  }
};
