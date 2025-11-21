import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';
import { generateGeminiResponse, generateGeminiResponseWithScore } from './services/gemini';

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Enable CORS for all routes
const corsHandler = cors({ origin: true });

// Interface for request body
interface ChatRequest {
  message: string;
  includeScoring?: boolean;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    score?: { overall: number; grammar: number; vocabulary: number; fluency: number };
    timestamp: number;
  };
  error?: string;
}

// Cloud Function: Chat with Lexi AI
export const chatWithLexi = functions.https.onRequest(
  async (req: functions.https.Request, res: functions.Response<ChatResponse>) => {
    corsHandler(req, res, async () => {
      try {
        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.status(401).json({ success: false, error: 'Unauthorized' });
          return;
        }

        const token = authHeader.substring(7);
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userId = decodedToken.uid;

        // Validate request body
        const body = req.body as ChatRequest;
        if (!body.message) {
          res.status(400).json({ success: false, error: 'Message is required' });
          return;
        }

        // Generate response
        let geminResponse;
        if (body.includeScoring) {
          geminResponse = await generateGeminiResponseWithScore({
            message: body.message,
            userId,
            conversationHistory: body.conversationHistory,
            includeScoring: true,
          });
        } else {
          geminResponse = await generateGeminiResponse({
            message: body.message,
            userId,
            conversationHistory: body.conversationHistory,
          });
        }

        // Save to Firestore (optional: for logging)
        await db.collection('users').doc(userId).collection('sessions').add({
          message: body.message,
          response: geminResponse.response,
          score: geminResponse.score || null,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({
          success: true,
          data: geminResponse,
        });
      } catch (error) {
        console.error('Error in chatWithLexi:', error);
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    });
  }
);

// Cloud Function: Health check
export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});
