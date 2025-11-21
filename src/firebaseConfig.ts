// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';
const firebaseConfig = {
  apiKey: 'AIzaSyD-itbwQGLwTu03eyWFSLNZ-6oGh0ozQc',
  authDomain: 'lexi-ai-tutor.firebaseapp.com',
  projectId: 'lexi-ai-tutor',
  storageBucket: 'lexi-ai-tutor.firebasestorage.app',
  messagingSenderId: '971979068070',
  appId: '1:971979068070:web:fd1fe22f01533479921a67',
  measurementId: 'G-9DM73V3D6E',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
export const analytics = getAnalytics(app);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;

// Analytics event tracking functions
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
}

export function trackUserLogin(userId: string) {
  trackEvent('login', { userId });
}

export function trackViewDashboard(userId: string) {
  trackEvent('view_dashboard', { userId });
}

export function trackStartLesson(userId: string, lessonId: string) {
  trackEvent('start_lesson', { userId, lessonId });
}
