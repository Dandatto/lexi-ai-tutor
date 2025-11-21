// Firestore Service - CRUD Operations
import { db } from '../firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

// User Data Interfaces
export interface UserStats {
  totalLessons: number;
  correctAnswers: number;
  totalAnswers: number;
  streak: number;
  lastActivityDate: string;
}

export interface UserPersona {
  name: string;
  level: string;
  focusAreas: string[];
  learningStyle: string;
  goals: string[];
}

export interface UserSession {
  startTime: string;
  endTime?: string;
  duration?: number;
  lessonsCompleted: number;
  sessionType: string;
}

export interface UserNotebook {
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  persona?: UserPersona;
  stats?: UserStats;
  sessions?: UserSession[];
  notebook?: UserNotebook[];
}

// User Profile Operations
export const createUserProfile = async (userId: string, userData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDocData = {
      uid: userId,
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(userRef, userDocData);
    return { success: true, data: userDocData };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() as UserData };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(userRef, updateData);
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

// User Statistics Operations
export const updateUserStats = async (userId: string, stats: Partial<UserStats>) => {
  try {
    const userRef = doc(db, 'users', userId, 'stats', 'current');
    const statsData = {
      ...stats,
      updatedAt: Timestamp.now(),
    };
    await setDoc(userRef, statsData, { merge: true });
    return { success: true, data: statsData };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return { success: false, error };
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const statsRef = doc(db, 'users', userId, 'stats', 'current');
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      return { success: true, data: statsSnap.data() as UserStats };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { success: false, error };
  }
};

// User Persona Operations
export const setUserPersona = async (userId: string, persona: Partial<UserPersona>) => {
  try {
    const personaRef = doc(db, 'users', userId, 'persona', 'profile');
    const personaData = {
      ...persona,
      updatedAt: Timestamp.now(),
    };
    await setDoc(personaRef, personaData, { merge: true });
    return { success: true, data: personaData };
  } catch (error) {
    console.error('Error setting user persona:', error);
    return { success: false, error };
  }
};

export const getUserPersona = async (userId: string) => {
  try {
    const personaRef = doc(db, 'users', userId, 'persona', 'profile');
    const personaSnap = await getDoc(personaRef);
    if (personaSnap.exists()) {
      return { success: true, data: personaSnap.data() as UserPersona };
    }
    return { success: true, data: null };
  } catch (error) {
    console.error('Error getting user persona:', error);
    return { success: false, error };
  }
};

// User Sessions Operations
export const addUserSession = async (userId: string, session: Partial<UserSession>) => {
  try {
    const sessionRef = collection(db, 'users', userId, 'sessions');
    const sessionData = {
      ...session,
      createdAt: Timestamp.now(),
    };
    const newSessionRef = doc(sessionRef);
    await setDoc(newSessionRef, sessionData);
    return { success: true, data: { id: newSessionRef.id, ...sessionData } };
  } catch (error) {
    console.error('Error adding session:', error);
    return { success: false, error };
  }
};

export const getUserSessions = async (userId: string) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const sessionsSnap = await getDocs(sessionsRef);
    const sessions = sessionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: sessions };
  } catch (error) {
    console.error('Error getting sessions:', error);
    return { success: false, error };
  }
};

// User Notebook Operations
export const addNotebookEntry = async (userId: string, entry: Partial<UserNotebook>) => {
  try {
    const notebookRef = collection(db, 'users', userId, 'notebook');
    const entryData = {
      ...entry,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const newEntryRef = doc(notebookRef);
    await setDoc(newEntryRef, entryData);
    return { success: true, data: { id: newEntryRef.id, ...entryData } };
  } catch (error) {
    console.error('Error adding notebook entry:', error);
    return { success: false, error };
  }
};

export const updateNotebookEntry = async (
  userId: string,
  entryId: string,
  updates: Partial<UserNotebook>
) => {
  try {
    const entryRef = doc(db, 'users', userId, 'notebook', entryId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(entryRef, updateData);
    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error updating notebook entry:', error);
    return { success: false, error };
  }
};

export const deleteNotebookEntry = async (userId: string, entryId: string) => {
  try {
    const entryRef = doc(db, 'users', userId, 'notebook', entryId);
    await deleteDoc(entryRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting notebook entry:', error);
    return { success: false, error };
  }
};

export const getUserNotebook = async (userId: string) => {
  try {
    const notebookRef = collection(db, 'users', userId, 'notebook');
    const notebookSnap = await getDocs(notebookRef);
    const entries = notebookSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: entries };
  } catch (error) {
    console.error('Error getting notebook:', error);
    return { success: false, error };
  }
};

// Real-time Listeners
export const listenToUserProfile = (
  userId: string,
  callback: (data: UserData | null) => void
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserData);
      } else {
        callback(null);
      }
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error listening to user profile:', error);
    return () => {};
  }
};

export const listenToUserNotebook = (
  userId: string,
  callback: (data: any[]) => void
) => {
  try {
    const notebookRef = collection(db, 'users', userId, 'notebook');
    const unsubscribe = onSnapshot(notebookRef, (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(entries);
    });
    return unsubscribe;
  } catch (error) {
    console.error('Error listening to notebook:', error);
    return () => {};
  }
};

// Batch Operations
export const deleteUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return { success: false, error };
  }
};
