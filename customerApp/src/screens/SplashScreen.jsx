import React, { useCallback, useEffect, useRef } from 'react';

import { Animated, Easing, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerProfile } from '../api/customerApi';

import AppLogo from '../components/AppLogo';

const SPLASH_HOLD_TIME = 750;

export default function SplashScreen({ navigation }) {
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const backgroundScale = useRef(new Animated.Value(1)).current;

  const circleOneScale = useRef(new Animated.Value(0.7)).current;

  const circleTwoScale = useRef(new Animated.Value(0.8)).current;

  const hasStartedNavigation = useRef(false);
  const holdTimerRef = useRef(null);

  useEffect(() => {
    const backgroundAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(backgroundScale, {
            toValue: 1.06,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(circleOneScale, {
            toValue: 1.18,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(circleTwoScale, {
            toValue: 1.1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(backgroundScale, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(circleOneScale, {
            toValue: 0.7,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(circleTwoScale, {
            toValue: 0.8,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    backgroundAnimation.start();

    return () => {
      backgroundAnimation.stop();

      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, [backgroundScale, circleOneScale, circleTwoScale]);

  // const goToLogin = useCallback(() => {
  //   Animated.timing(screenOpacity, {
  //     toValue: 0,
  //     duration: 500,
  //     easing: Easing.inOut(Easing.ease),
  //     useNativeDriver: true,
  //   }).start(({ finished }) => {
  //     if (!finished) {
  //       return;
  //     }

  //     navigation.replace('PhoneLogin');
  //   });
  // }, [navigation, screenOpacity]);

  const checkLogin = useCallback(() => {
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(async ({ finished }) => {
      if (!finished) return;

      try {
        const token = await AsyncStorage.getItem('customerToken');

        if (!token) {
          navigation.replace('PhoneLogin');
          return;
        }

        const response = await getCustomerProfile();
        console.log('PROFILE RESPONSE =>', JSON.stringify(response, null, 2));

        const customer = response?.data?.customer;

        const profileCompleted =
          customer?.firstName !== 'Customer' &&
          customer?.email &&
          !customer.email.includes('@temp.com');

        if (profileCompleted) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('CustomerProfile');
        }
      } catch (err) {
        navigation.replace('PhoneLogin');
      }
    });
  }, [navigation, screenOpacity]);
  const handleAnimationComplete = useCallback(() => {
    if (hasStartedNavigation.current) {
      return;
    }

    hasStartedNavigation.current = true;

    holdTimerRef.current = setTimeout(() => {
      checkLogin();
    }, SPLASH_HOLD_TIME);
  }, [checkLogin]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenOpacity,

          transform: [
            {
              scale: backgroundScale,
            },
          ],
        },
      ]}
    >
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.backgroundCircleOne,
          {
            transform: [
              {
                scale: circleOneScale,
              },
            ],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.backgroundCircleTwo,
          {
            transform: [
              {
                scale: circleTwoScale,
              },
            ],
          },
        ]}
      />

      <View pointerEvents="none" style={styles.topHighlight} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <AppLogo
            size={134}
            light
            showName
            showTagline
            autoPlay
            animationDelay={30}
            onAnimationComplete={handleAnimationComplete}
          />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#ff5a1f',

    overflow: 'hidden',
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

  backgroundCircleOne: {
    position: 'absolute',

    width: 320,
    height: 320,

    top: -120,
    right: -110,

    borderRadius: 160,

    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  backgroundCircleTwo: {
    position: 'absolute',

    width: 270,
    height: 270,

    bottom: -110,
    left: -90,

    borderRadius: 135,

    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  topHighlight: {
    position: 'absolute',

    width: 230,
    height: 230,

    top: 110,
    left: -130,

    borderRadius: 115,

    backgroundColor: 'rgba(255,190,120,0.13)',
  },
});
