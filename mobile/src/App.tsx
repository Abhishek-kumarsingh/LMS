import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Platform,
  AppState,
  AppStateStatus,
  Alert,
  Linking,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from './store';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthNavigator } from './navigation/AuthNavigator';
import { LoadingScreen } from './components/common/LoadingScreen';
import { OfflineNotice } from './components/common/OfflineNotice';
import { UpdatePrompt } from './components/common/UpdatePrompt';
import { PushNotificationManager } from './services/PushNotificationManager';
import { OfflineManager } from './services/OfflineManager';
import { BiometricManager } from './services/BiometricManager';
import { AnalyticsManager } from './services/AnalyticsManager';
import { CrashReportingManager } from './services/CrashReportingManager';
import { useAppSelector, useAppDispatch } from './hooks/redux';
import { setNetworkStatus, setAppState } from './store/slices/appSlice';
import { checkAuthStatus } from './store/slices/authSlice';
import { syncOfflineData } from './store/slices/offlineSlice';
import { theme } from './theme';
import { navigationRef } from './navigation/NavigationService';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAppSelector(state => state.auth);
  const { isOnline } = useAppSelector(state => state.app);
  const [isInitialized, setIsInitialized] = useState(false);
  const [appState, setAppStateValue] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    initializeApp();
    setupAppStateListener();
    setupNetworkListener();
    
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    if (isOnline && isAuthenticated) {
      // Sync offline data when coming back online
      dispatch(syncOfflineData());
    }
  }, [isOnline, isAuthenticated, dispatch]);

  const initializeApp = async () => {
    try {
      // Initialize core services
      await Promise.all([
        PushNotificationManager.initialize(),
        OfflineManager.initialize(),
        BiometricManager.initialize(),
        AnalyticsManager.initialize(),
        CrashReportingManager.initialize(),
      ]);

      // Check authentication status
      await dispatch(checkAuthStatus()).unwrap();

      // Track app launch
      AnalyticsManager.trackEvent('app_launched', {
        platform: Platform.OS,
        version: '1.0.0',
      });

      setIsInitialized(true);
      SplashScreen.hide();
    } catch (error) {
      console.error('App initialization failed:', error);
      CrashReportingManager.recordError(error as Error);
      setIsInitialized(true);
      SplashScreen.hide();
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        handleAppForeground();
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        handleAppBackground();
      }
      
      setAppStateValue(nextAppState);
      dispatch(setAppState(nextAppState));
    };

    AppState.addEventListener('change', handleAppStateChange);
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      dispatch(setNetworkStatus(isConnected ?? false));
      
      if (isConnected) {
        AnalyticsManager.trackEvent('network_connected');
      } else {
        AnalyticsManager.trackEvent('network_disconnected');
      }
    });

    return unsubscribe;
  };

  const handleAppForeground = async () => {
    try {
      // Check for app updates
      // await UpdateManager.checkForUpdates();
      
      // Refresh authentication if needed
      if (isAuthenticated) {
        dispatch(checkAuthStatus());
      }
      
      // Sync offline data if online
      if (isOnline) {
        dispatch(syncOfflineData());
      }
      
      AnalyticsManager.trackEvent('app_foreground');
    } catch (error) {
      console.error('Error handling app foreground:', error);
    }
  };

  const handleAppBackground = () => {
    try {
      // Save any pending data
      OfflineManager.savePendingData();
      
      AnalyticsManager.trackEvent('app_background');
    } catch (error) {
      console.error('Error handling app background:', error);
    }
  };

  if (!isInitialized || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
        translucent={false}
      />
      
      {!isOnline && <OfflineNotice />}
      
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      
      <UpdatePrompt />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <PaperProvider theme={theme}>
              <AppContent />
            </PaperProvider>
          </PersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
