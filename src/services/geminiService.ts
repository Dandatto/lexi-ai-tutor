geminiService.ts// Gemini Service - Cloud Functions Proxy Pattern
// This service now uses Firebase Cloud Functions to call Gemini API securely
// API Key is never exposed to frontend

import { functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import { ChatWithLexiRequest, ChatWithLexiResponse } from '../types';

/**
 * Generate response from Lexi using secure Cloud Function
 * Frontend sends message via httpsCallable -> Backend validates ID Token
 * -> Backend calls Gemini API with protected API Key
 * @param message - User's message
 * @param chatHistory - Array of previous messages
 * @returns Response from Lexi
 */
export const generateResponse = async (
  message: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> => {
  try {
    const chatWithLexi = httpsCallable<ChatWithLexiRequest, ChatWithLexiResponse>(
      functions,
      'chatWithLexi'
    );

    const response = await chatWithLexi({
      message,
      chatHistory,
      userId: '', // Will be populated by Cloud Function from request.auth
    });

    return response.data.response;
  } catch (error: any) {
    // Handle authentication errors
    if (error.code === 'functions/unauthenticated') {
      throw new Error('User not authenticated. Please sign in first.');
    }
    if (error.code === 'functions/permission-denied') {
      throw new Error('Permission denied to call Gemini API.');
    }
    if (error.code === 'functions/unavailable') {
      throw new Error('Service temporarily unavailable. Please try again.');
    }
    throw error;
  }
};

/**
 * Generate response with scoring for learning analytics
 * @param message - User's message  
 * @param chatHistory - Array of previous messages
 * @param unitId - Current unit being studied
 * @returns Response with embedded score
 */
export const generateResponseWithScore = async (
  message: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  unitId: string
): Promise<{ response: string; score: number }> => {
  try {
    const response = await generateResponse(message, chatHistory);

    // Parse score from response (if embedded)
    // This would be handled by the Cloud Function
    const score = extractScoreFromResponse(response);

    return {
      response: removeScoreFromResponse(response),
      score,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Helper: Extract score from response
 */
function extractScoreFromResponse(response: string): number {
  const scoreMatch = response.match(/\[SCORE:(\d+(?:\.\d+)?)\]/);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 0;
}

/**
 * Helper: Remove score markup from response
 */
function removeScoreFromResponse(response: string): string {
  return response.replace(/\[SCORE:\d+(?:\.\d+)?\]/g, '').trim();
}

// Note: All Gemini API calls go through secure backend via Cloud Functions
// Frontend never has access to API_KEY
