
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are "Aura", a compassionate, patient, and world-class Socratic math tutor. 

Your Core Principles:
1. NEVER provide the full solution or final answer immediately, even if the user asks.
2. If an image is provided, identify the math problem and explain that you see it. 
3. Guide the student using the Socratic method: break the problem into the smallest possible logical steps.
4. Present ONLY the first step and ask a leading question to encourage the student to take that step.
5. If a student is confused or asks "Why?", use deep reasoning to explain the underlying concept before returning to the step-by-step logic.
6. Always maintain a kind, encouraging, and supportive tone. Use phrases like "Let's look at this together" or "That's a great question."
7. Use LaTeX for ALL mathematical expressions (e.g., use $x^2$ or $$ \int_0^\infty f(x) dx $$).
8. Ensure your explanations are conceptual, not just procedural.

When Thinking Mode is active:
You are analyzing the student's current confusion and planning the most effective pedagogical bridge to get them to the next realization.`;

export class GeminiTutorService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async chat(messages: Message[], imageBase64?: string): Promise<string> {
    const model = 'gemini-3-pro-preview';
    
    // Prepare contents
    const contents: any[] = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // If there's a new image, add it to the last user message or as a separate part
    let currentParts: any[] = [];
    if (imageBase64) {
      currentParts.push({
        inlineData: {
          mimeType: "image/png",
          data: imageBase64.split(',')[1] || imageBase64
        }
      });
    }
    
    const lastMsg = messages[messages.length - 1];
    currentParts.push({ text: lastMsg.content });

    const response = await this.ai.models.generateContent({
      model,
      contents: [
        ...contents.slice(0, -1),
        { role: 'user', parts: currentParts }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that. Let's try looking at the problem again.";
  }
}

export const tutorService = new GeminiTutorService();
