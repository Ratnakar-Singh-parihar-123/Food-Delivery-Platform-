import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ─── Rider Screens ──────────────────────────────────────────
import RiderAuthLoadingScreen from '../screen/auth/RiderAuthLoadingScreen';
import RiderSplashScreen from '../screen/Splash/RiderSplashScreen';
import RiderWelcomeScreen from '../screen/Splash/RiderWelcomeScreen';
import RiderPhoneLoginScreen from '../screen/auth/RiderPhoneLoginScreen';
import RiderOtpVerificationScreen from '../screen/auth/RiderOtpVerificationScreen';
import RiderCreateProfileScreen from '../screen/Profile/RiderCreateProfileScreen';
import RiderUploadDocumentsScreen from '../screen/Documents/RiderUploadDocumentsScreen';
import RiderPendingApprovalScreen from '../screen/Approve/RiderPendingApprovalScreen';
import RiderRejectedScreen from '../screen/Approve/RiderRejectedScreen';
import RiderTabs from '../navigation/RiderTabs';
import RiderBankDetailsScreen from '../screen/Profile/RiderBankDetailsScreen';
import OrderDetails from '../screen/Orders/RiderOrderDetailsScreen';
import RiderTrackMap from '../screen/map/RiderTrackMap';
console.log('RiderTabs:', RiderTabs);
// ─── Bottom Tab Navigator ───────────────────────────────────

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
          initialRouteName="RiderAuthLoading"
        >
          <Stack.Screen
            name="RiderAuthLoading"
            component={RiderAuthLoadingScreen}
          />
          <Stack.Screen name="RiderSplash" component={RiderSplashScreen} />
          <Stack.Screen name="RiderWelcome" component={RiderWelcomeScreen} />
          <Stack.Screen
            name="RiderPhoneLogin"
            component={RiderPhoneLoginScreen}
          />
          <Stack.Screen
            name="RiderOtpVerification"
            component={RiderOtpVerificationScreen}
          />
          <Stack.Screen
            name="RiderCreateProfile"
            component={RiderCreateProfileScreen}
          />
          <Stack.Screen
            name="RiderUploadDocuments"
            component={RiderUploadDocumentsScreen}
          />
          <Stack.Screen
            name="RiderPendingApproval"
            component={RiderPendingApprovalScreen}
          />
          <Stack.Screen name="RiderRejected" component={RiderRejectedScreen} />
          <Stack.Screen
            name="RiderBankDetails"
            component={RiderBankDetailsScreen}
          />
          <Stack.Screen name="RiderOrderDetails" component={OrderDetails} />
          <Stack.Screen name="RiderTrackMap" component={RiderTrackMap} />
          <Stack.Screen name="RiderTabs" component={RiderTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
