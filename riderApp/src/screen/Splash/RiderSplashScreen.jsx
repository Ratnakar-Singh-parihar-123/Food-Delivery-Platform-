// src/screen/splash/RiderSplashScreen.js
import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppLogo from '../../components/AppLogo'; // adjust path as needed

export default function RiderSplashScreen() {
  const navigation = useNavigation();

  const handleAnimationComplete = () => {
    setTimeout(() => {
      navigation.replace('RiderWelcome');
    }, 200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef9f5" />
      <AppLogo
        size={140}
        autoPlay={true}
        onAnimationComplete={handleAnimationComplete}
        showTagline={true}
        light={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
