

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ─── Rider Screens ──────────────────────────────────────────
import RiderSplashScreen from './src/screen/Splash/RiderSplashScreen';
import RiderAuthLoadingScreen from './src/screen/auth/RiderAuthLoadingScreen';
import RiderWelcomeScreen from './src/screen/Splash/RiderWelcomeScreen';
import RiderPhoneLoginScreen from './src/screen/auth/RiderPhoneLoginScreen';
import RiderOtpVerificationScreen from './src/screen/auth/RiderOtpVerificationScreen';
import RiderCreateProfileScreen from './src/screen/Profile/RiderCreateProfileScreen';
import RiderUploadDocumentsScreen from './src/screen/Documents/RiderUploadDocumentsScreen';
import RiderPendingApprovalScreen from './src/screen/Approve/RiderPendingApprovalScreen';
import RiderRejectedScreen from './src/screen/Approve/RiderRejectedScreen';

// ─── Orders ──────────────────────────────────────────────────
import RiderOrdersScreen from './src/screen/Orders/RiderOrdersScreen';
import RiderOrderDetailsScreen from './src/screen/Orders/RiderOrderDetailsScreen';
import RiderTrackMapScreen from './src/screen/Orders/RiderTrackMapScreen';

// ─── Profile ─────────────────────────────────────────────────
import RiderProfileScreen from './src/screen/Profile/RiderProfileScreen';
import RiderEditProfileScreen from './src/screen/Profile/RiderEditProfileScreen';
import RiderChangePasswordScreen from './src/screen/Profile/RiderChangePasswordScreen';
import RiderDocumentsScreen from './src/screen/Profile/RiderDocumentsScreen';
import RiderBankDetailsScreen from './src/screen/Profile/RiderBankDetailsScreen';

// ─── Earnings ────────────────────────────────────────────────
import RiderEarningsScreen from './src/screen/Earnings/RiderEarningsScreen';

// ─── Settings ────────────────────────────────────────────────
import RiderSettingsScreen from './src/screen/Settings/RiderSettingsScreen';

// ─── Bottom Tab Navigator ───────────────────────────────────
import RiderTabs from './src/navigation/RiderTabs';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0f172a' : '#f8fafc'}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="RiderSplash"  // ✅ Splash first, then auth check
        >
          <Stack.Screen name="RiderSplash" component={RiderSplashScreen} />
          <Stack.Screen name="RiderAuthLoading" component={RiderAuthLoadingScreen} />
          <Stack.Screen name="RiderWelcome" component={RiderWelcomeScreen} />
          <Stack.Screen name="RiderPhoneLogin" component={RiderPhoneLoginScreen} />
          <Stack.Screen name="RiderOtpVerification" component={RiderOtpVerificationScreen} />
          <Stack.Screen name="RiderCreateProfile" component={RiderCreateProfileScreen} />
          <Stack.Screen name="RiderUploadDocuments" component={RiderUploadDocumentsScreen} />
          <Stack.Screen name="RiderPendingApproval" component={RiderPendingApprovalScreen} />
          <Stack.Screen name="RiderRejected" component={RiderRejectedScreen} />

          {/* Orders */}
          <Stack.Screen name="RiderOrders" component={RiderOrdersScreen} />
          <Stack.Screen name="RiderOrderDetails" component={RiderOrderDetailsScreen} />
          <Stack.Screen name="RiderTrackMap" component={RiderTrackMapScreen} />

          {/* Profile */}
          <Stack.Screen name="RiderProfile" component={RiderProfileScreen} />
          <Stack.Screen name="RiderEditProfile" component={RiderEditProfileScreen} />
          <Stack.Screen name="RiderChangePassword" component={RiderChangePasswordScreen} />
          <Stack.Screen name="RiderDocuments" component={RiderDocumentsScreen} />
          <Stack.Screen name="RiderBankDetails" component={RiderBankDetailsScreen} />

          {/* Earnings */}
          <Stack.Screen name="RiderEarnings" component={RiderEarningsScreen} />

          {/* Settings */}
          <Stack.Screen name="RiderSettings" component={RiderSettingsScreen} />

          {/* Main Tab Navigator */}
          <Stack.Screen name="RiderTabs" component={RiderTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;