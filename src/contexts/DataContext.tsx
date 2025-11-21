'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  listenToUserProfile,
  listenToUserNotebook,
  getUserStats,
  UserData,
} from '../services/firestoreService';

interface DataContextType {
  userProfile: UserData | null;
  userStats: any | null;
  notebook: any[] | null;
  loading: boolean;
  error: string | null;
  isSync: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [notebook, setNotebook] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSync, setIsSync] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setLoading(false);
      setUserProfile(null);
      setUserStats(null);
      setNotebook(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSync(true);

      const unsubscribeProfile = listenToUserProfile(user.uid, (profile) => {
        setUserProfile(profile);
      });

      const unsubscribeNotebook = listenToUserNotebook(user.uid, (entries) => {
        setNotebook(entries);
      });

      const loadStats = async () => {
        try {
          const statsResult = await getUserStats(user.uid);
          if (statsResult.success) {
            setUserStats(statsResult.data);
          }
        } catch (err) {
          console.error('Error loading stats:', err);
          setError('Failed to load statistics');
        } finally {
          setLoading(false);
        }
      };

      loadStats();

      return () => {
        unsubscribeProfile();
        unsubscribeNotebook();
      };
    } catch (err) {
      console.error('Error setting up data listeners:', err);
      setError('Failed to sync data');
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  const refreshData = async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsSync(false);
      const statsResult = await getUserStats(user.uid);
      if (statsResult.success) {
        setUserStats(statsResult.data);
      }
      setIsSync(true);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
      setIsSync(true);
    }
  };

  return (
    <DataContext.Provider
      value={{
        userProfile,
        userStats,
        notebook,
        loading,
        error,
        isSync,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
