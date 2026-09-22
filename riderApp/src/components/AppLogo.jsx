import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const LOGO_IMAGE = require('../assets/logo/foodmitra.png');

export default function AppLogo({
  size = 110,
  animatedStyle,
  showName = true,
  showTagline = true,
  autoPlay = true,
  animationDelay = 50,
  onAnimationComplete,
  brandLetters = ['F', 'o', 'o', 'd', 'M', 'i', 't', 'r', 'a'],
  tagline = 'Partner for every delivery',
  textColor = '#FFFFFF', // ← "Food" part ka color (default white)
  highlightColor = '#FF5722', // ← "Mitra" part ka color (default orange)
  underlineColor = '#FF5722',
}) {
  // ── Animation Refs ──
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoTranslateY = useRef(new Animated.Value(-20)).current;
  const imageScale = useRef(new Animated.Value(0.85)).current;
  const imageRotate = useRef(new Animated.Value(0)).current;

  // Text Animations
  const domainOpacity = useRef(new Animated.Value(0)).current;
  const domainScale = useRef(new Animated.Value(0.8)).current;
  const underlineOpacity = useRef(new Animated.Value(0)).current;
  const underlineScaleX = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(8)).current;

  const letterAnimations = useMemo(
    () =>
      brandLetters.map(() => ({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(-20),
        scale: new Animated.Value(0.7),
      })),
    [brandLetters],
  );

  useEffect(() => {
    if (!autoPlay) {
      setFinalAnimationValues();
      return;
    }

    const entranceAnimation = Animated.sequence([
      Animated.delay(animationDelay),
      Animated.parallel([
        // Logo Container Entrance
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.spring(imageScale, {
          toValue: 1,
          friction: 5,
          tension: 150,
          useNativeDriver: true,
        }),
        Animated.timing(imageRotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),

        // Letters Stagger Entrance
        Animated.sequence([
          Animated.delay(120),
          Animated.stagger(
            35,
            letterAnimations.map(letter =>
              Animated.parallel([
                Animated.timing(letter.opacity, {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
                }),
                Animated.spring(letter.translateY, {
                  toValue: 0,
                  friction: 6,
                  tension: 200,
                  useNativeDriver: true,
                }),
                Animated.spring(letter.scale, {
                  toValue: 1,
                  friction: 6,
                  tension: 200,
                  useNativeDriver: true,
                }),
              ]),
            ),
          ),
        ]),

        // Underline & Tagline (skipping domain badge)
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(underlineOpacity, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }),
            Animated.spring(underlineScaleX, {
              toValue: 1,
              friction: 7,
              tension: 160,
              useNativeDriver: true,
            }),
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.spring(taglineTranslateY, {
              toValue: 0,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]);

    entranceAnimation.start(({ finished }) => {
      if (finished) {
        onAnimationComplete?.();
      }
    });

    return () => {
      entranceAnimation.stop();
    };
  }, []);

  const setFinalAnimationValues = () => {
    logoOpacity.setValue(1);
    logoScale.setValue(1);
    logoTranslateY.setValue(0);
    imageScale.setValue(1);
    imageRotate.setValue(1);
    underlineOpacity.setValue(1);
    underlineScaleX.setValue(1);
    taglineOpacity.setValue(1);
    taglineTranslateY.setValue(0);
    letterAnimations.forEach(letter => {
      letter.opacity.setValue(1);
      letter.translateY.setValue(0);
      letter.scale.setValue(1);
    });
  };

  const rotateInterpolation = imageRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-6deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      {/* ── LOGO IMAGE ── */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              transform: [
                { scale: imageScale },
                { rotate: rotateInterpolation },
              ],
            },
          ]}
        >
          <Image
            source={LOGO_IMAGE}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>

      {/* ── BRAND NAME & TYPOGRAPHY ── */}
      {showName && (
        <View style={styles.brandSection}>
          <View style={styles.brandRow}>
            <View style={styles.lettersWrapper}>
              {brandLetters.map((letter, index) => {
                const animation = letterAnimations[index];
                const isHighlight = index >= 4; // "Mitra" starts at index 4

                return (
                  <Animated.View
                    key={`${letter}-${index}`}
                    style={{
                      opacity: animation.opacity,
                      transform: [
                        { translateY: animation.translateY },
                        { scale: animation.scale },
                      ],
                    }}
                  >
                    <Text
                      style={[
                        styles.brandLetter,
                        {
                          color: isHighlight ? highlightColor : textColor,
                        },
                      ]}
                    >
                      {letter}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* Underline */}
          <Animated.View
            style={[
              styles.brandUnderline,
              {
                opacity: underlineOpacity,
                backgroundColor: underlineColor,
                transform: [{ scaleX: underlineScaleX }],
              },
            ]}
          />

          {showTagline && (
            <Animated.View
              style={{
                opacity: taglineOpacity,
                transform: [{ translateY: taglineTranslateY }],
              }}
            >
              <Text style={[styles.tagline, { color: textColor }]}>
                {tagline}
              </Text>
            </Animated.View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// ── STYLES ──
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  lettersWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLetter: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  brandUnderline: {
    width: 64,
    height: 3.5,
    marginTop: 6,
    borderRadius: 2,
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
