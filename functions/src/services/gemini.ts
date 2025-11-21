import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// TypeScript Interfaces
export interface GeminiRequest {
  message: string;
  userId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  includeScoring?: boolean;
}

export interface GeminiResponse {
  response: string;
  score?: {
    overall: number;
    grammar: number;
    vocabulary: number;
    fluency: number;
  };
  timestamp: number;
}

// Generate response from Gemini API
export async function generateGeminiResponse(
  request: GeminiRequest
): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const chat = model.startChat();

    // Add conversation history if provided
    if (request.conversationHistory && request.conversationHistory.length > 0) {
      for (const msg of request.conversationHistory) {
        await chat.sendMessage(msg.content);
      }
    }

    // Generate response
    const result = await chat.sendMessage(request.message);
    const text = result.response.text();

    return {
      response: text,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw new Error('Failed to generate response from Gemini API');
  }
}

// Generate response with scoring
export async function generateGeminiResponseWithScore(
  request: GeminiRequest
): Promise<GeminiResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const scoringPrompt = `Based on the user's response, provide a JSON score object with the following structure:
{
  "overall": <number 0-100>,
  "grammar": <number 0-100>,
  "vocabulary": <number 0-100>,
  "fluency": <number 0-100>
}

User response: ${request.message}`;

    const result = await model.generateContent(scoringPrompt);
    const responseText = result.response.text();

    // Parse score from response
    let score = {
      overall: 50,
      grammar: 50,
      vocabulary: 50,
      fluency: 50,
    };

    try {
      const jsonMatch = responseText.match(/\{[^}]+\}/);
      if (jsonMatch) {
        score = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse score from response, using defaults');
    }

    return {
      response: responseText,
      score,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error generating scored response:', error);
    throw new Error('Failed to generate scored response');
  }
}
