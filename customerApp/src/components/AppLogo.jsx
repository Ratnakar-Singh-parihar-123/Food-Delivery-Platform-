import React, { useEffect, useMemo, useRef } from 'react';

import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

const BRAND_LETTERS = ['F', 'o', 'o', 'd', 'M', 'i', 't', 'r', 'a'];

const LOGO_IMAGE = require('../assets/logo/foodmitra.png');

export default function AppLogo({
  size = 120,
  animatedStyle,
  showName = true,
  showTagline = true,
  light = false,
  autoPlay = true,
  animationDelay = 50,
  onAnimationComplete,
}) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoTranslateY = useRef(new Animated.Value(-24)).current;

  // Image ko initially visible rakha hai.
  // Isliye pehle white circle aur baad mein image wala issue nahi aayega.
  const imageScale = useRef(new Animated.Value(0.82)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;

  const glowScale = useRef(new Animated.Value(0.85)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const domainOpacity = useRef(new Animated.Value(0)).current;
  const domainTranslateY = useRef(new Animated.Value(10)).current;

  const underlineOpacity = useRef(new Animated.Value(0)).current;
  const underlineScaleX = useRef(new Animated.Value(0.4)).current;

  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(8)).current;

  const letterAnimations = useMemo(
    () =>
      BRAND_LETTERS.map(() => ({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(-24),
        scale: new Animated.Value(0.82),
      })),
    [],
  );

  const primaryColor = light ? '#ffffff' : '#ff5a1f';

  const secondaryColor = light ? 'rgba(255,255,255,0.9)' : '#374151';

  useEffect(() => {
    if (!autoPlay) {
      setFinalAnimationValues();
      return undefined;
    }

    const animation = Animated.sequence([
      Animated.delay(animationDelay),

      Animated.parallel([
        // Logo container and image enter together
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),

          Animated.spring(logoScale, {
            toValue: 1,
            damping: 9,
            stiffness: 190,
            mass: 0.6,
            useNativeDriver: true,
          }),

          Animated.spring(logoTranslateY, {
            toValue: 0,
            damping: 9,
            stiffness: 180,
            mass: 0.6,
            useNativeDriver: true,
          }),

          Animated.spring(imageScale, {
            toValue: 1,
            damping: 8,
            stiffness: 210,
            mass: 0.55,
            useNativeDriver: true,
          }),
        ]),

        // Glow logo ke saath hi chalega
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.28,
            duration: 100,
            useNativeDriver: true,
          }),

          Animated.parallel([
            Animated.timing(glowScale, {
              toValue: 1.25,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),

            Animated.timing(glowOpacity, {
              toValue: 0,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Brand text thoda sa delay lekar start hoga
        Animated.sequence([
          Animated.delay(170),

          Animated.stagger(
            48,
            letterAnimations.map(letter =>
              Animated.parallel([
                Animated.timing(letter.opacity, {
                  toValue: 1,
                  duration: 100,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),

                Animated.spring(letter.translateY, {
                  toValue: 0,
                  damping: 8,
                  stiffness: 220,
                  mass: 0.48,
                  useNativeDriver: true,
                }),

                Animated.spring(letter.scale, {
                  toValue: 1,
                  damping: 8,
                  stiffness: 220,
                  mass: 0.48,
                  useNativeDriver: true,
                }),
              ]),
            ),
          ),
        ]),

        // .in letters ke complete hone ka wait nahi karega
        Animated.sequence([
          Animated.delay(440),

          Animated.parallel([
            Animated.timing(domainOpacity, {
              toValue: 1,
              duration: 150,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),

            Animated.spring(domainTranslateY, {
              toValue: 0,
              damping: 9,
              stiffness: 210,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Underline aur tagline bhi overlap mein aayenge
        Animated.sequence([
          Animated.delay(520),

          Animated.parallel([
            Animated.timing(underlineOpacity, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),

            Animated.spring(underlineScaleX, {
              toValue: 1,
              damping: 10,
              stiffness: 190,
              useNativeDriver: true,
            }),

            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: 180,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),

            Animated.spring(taglineTranslateY, {
              toValue: 0,
              damping: 10,
              stiffness: 180,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),

      // Bahut short finishing bounce
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.025,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          damping: 10,
          stiffness: 230,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onAnimationComplete?.();
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    animationDelay,
    autoPlay,
    domainOpacity,
    domainTranslateY,
    glowOpacity,
    glowScale,
    imageScale,
    letterAnimations,
    logoOpacity,
    logoScale,
    logoTranslateY,
    onAnimationComplete,
    taglineOpacity,
    taglineTranslateY,
    underlineOpacity,
    underlineScaleX,
  ]);

  const setFinalAnimationValues = () => {
    logoOpacity.setValue(1);
    logoScale.setValue(1);
    logoTranslateY.setValue(0);

    imageOpacity.setValue(1);
    imageScale.setValue(1);

    glowOpacity.setValue(0);
    glowScale.setValue(1);

    domainOpacity.setValue(1);
    domainTranslateY.setValue(0);

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

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <View style={styles.logoOuterWrapper}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: size * 1.18,
              height: size * 1.18,
              borderRadius: size,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
            light && styles.lightGlow,
          ]}
        />

        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
            },
            light && styles.lightLogoContainer,
          ]}
        >
          <Animated.View
            style={[
              styles.imageWrapper,
              {
                opacity: imageOpacity,
                transform: [{ scale: imageScale }],
              },
            ]}
          >
            <Image
              source={LOGO_IMAGE}
              style={{
                width: size * 0.92,
                height: size * 0.92,
              }}
              resizeMode="contain"
              fadeDuration={0}
            />
          </Animated.View>
        </Animated.View>
      </View>

      {showName && (
        <View style={styles.brandSection}>
          <View style={styles.brandRow}>
            <View style={styles.lettersWrapper}>
              {BRAND_LETTERS.map((letter, index) => {
                const animation = letterAnimations[index];
                const isHighlighted = index >= 4;

                return (
                  <Animated.Text
                    key={`${letter}-${index}`}
                    style={[
                      styles.brandLetter,
                      {
                        color: isHighlighted
                          ? primaryColor
                          : light
                          ? '#ffffff'
                          : '#1f2937',

                        opacity: animation.opacity,

                        transform: [
                          { translateY: animation.translateY },
                          { scale: animation.scale },
                        ],
                      },
                    ]}
                  >
                    {letter}
                  </Animated.Text>
                );
              })}
            </View>

            <Animated.Text
              style={[
                styles.brandDomain,
                {
                  color: secondaryColor,
                  opacity: domainOpacity,
                  transform: [{ translateY: domainTranslateY }],
                },
              ]}
            >
              .
            </Animated.Text>
          </View>

          <Animated.View
            style={[
              styles.brandUnderline,
              {
                opacity: underlineOpacity,

                backgroundColor: light
                  ? 'rgba(255,255,255,0.7)'
                  : 'rgba(255,90,31,0.4)',

                transform: [{ scaleX: underlineScaleX }],
              },
            ]}
          />

          {showTagline && (
            <Animated.Text
              style={[
                styles.tagline,
                {
                  color: light ? 'rgba(255,255,255,0.86)' : '#6b7280',

                  opacity: taglineOpacity,

                  transform: [{ translateY: taglineTranslateY }],
                },
              ]}
            >
              Desi Flavours, Delivered to Your Doorstep.
            </Animated.Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoOuterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  glow: {
    position: 'absolute',
    backgroundColor: '#ff9a70',
  },

  lightGlow: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',

    // Slight off-white, plain white se premium lagega
    backgroundColor: '#fffdfb',

    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',

    shadowColor: '#9a3412',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 18,

    elevation: 13,
  },

  lightLogoContainer: {
    backgroundColor: '#fffdfb',
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#7c2d12',
  },

  imageWrapper: {
    width: '100%',
    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  brandSection: {
    marginTop: 19,
    alignItems: 'center',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  lettersWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  brandLetter: {
    fontSize: 43,
    lineHeight: 50,
    fontWeight: '900',
    letterSpacing: -1.8,
  },

  brandDomain: {
    marginLeft: 2,
    marginBottom: 5,

    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },

  brandUnderline: {
    width: 104,
    height: 4,

    marginTop: 3,

    borderRadius: 20,
  },

  tagline: {
    marginTop: 8,

    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',

    letterSpacing: 0.65,
  },
});
