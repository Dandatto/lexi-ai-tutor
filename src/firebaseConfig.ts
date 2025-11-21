// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

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

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
