'use client';

import React, { lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen'));
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';

const Stack = createStackNavigator();

// Navigation for authenticated users
const AuthenticatedNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

// Root navigator that handles auth state
const RootNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
          <Suspense fallback={<LoadingFallback />}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
      initialRouteName={isAuthenticated ? 'Authenticated' : 'Login'}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Authenticated"
          component={AuthenticatedNavigator}
          options={{ animationEnabled: false }}
        />
      )}
    </Stack.Navigator>
                  </Suspense>
  );
};

// Main App component wrapped with AuthProvider
const App = () => {
  return (
        <ErrorBoundary>
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
              </ErrorBoundary>
  );
};

export default App;
