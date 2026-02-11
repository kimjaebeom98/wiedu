import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values
  const animProgress = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Phase 1 & 2: Smooth entry and merge (0 -> 1 over 1.8s)
      Animated.timing(animProgress, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // smooth ease-in-out
        useNativeDriver: true,
      }),

      // Small pause at center
      Animated.delay(300),

      // Phase 3: Transform to wiedu logo
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      // Phase 4: Tagline fade in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      // Wait before transition
      Animated.delay(700),
    ]).start(() => {
      onFinish();
    });
  }, []);

  // Interpolate positions for smooth continuous movement
  // Start from off-screen, smoothly move to center
  const leftGroupX = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-width * 0.5, -40, 0],
  });

  const rightGroupX = animProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [width * 0.5, 40, 0],
  });

  // Fade out animation elements when logo appears
  const animOpacity = animProgress.interpolate({
    inputRange: [0, 0.9, 1],
    outputRange: [1, 1, 0],
  });

  // Logo fades in as animation elements fade out
  const finalLogoOpacity = Animated.multiply(
    logoOpacity,
    animProgress.interpolate({
      inputRange: [0, 0.95, 1],
      outputRange: [0, 0, 1],
    })
  );

  return (
    <LinearGradient
      colors={['#18181B', '#1f1f23', '#18181B']}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={styles.container}
    >
      {/* Background glows - radial gradient effect (matching design.pen) */}
      <View style={styles.glow1}>
        <Svg width={350} height={350}>
          <Defs>
            <RadialGradient id="glow1Grad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <Stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.08" />
              <Stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={175} cy={175} rx={175} ry={175} fill="url(#glow1Grad)" />
        </Svg>
      </View>
      <View style={styles.glow2}>
        <Svg width={280} height={280}>
          <Defs>
            <RadialGradient id="glow2Grad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#A78BFA" stopOpacity="0.2" />
              <Stop offset="70%" stopColor="#A78BFA" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={140} cy={140} rx={140} ry={140} fill="url(#glow2Grad)" />
        </Svg>
      </View>
      <View style={styles.glow3}>
        <Svg width={200} height={200}>
          <Defs>
            <RadialGradient id="glow3Grad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
              <Stop offset="70%" stopColor="#6366F1" stopOpacity="0.05" />
              <Stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Ellipse cx={100} cy={100} rx={100} ry={100} fill="url(#glow3Grad)" />
        </Svg>
      </View>

      {/* Animation: "with" + ● from left, ● + "you" from right */}
      <Animated.View
        style={[
          styles.animationContainer,
          { opacity: animOpacity },
        ]}
      >
        {/* Left group: "with" + circle */}
        <Animated.View
          style={[
            styles.leftGroup,
            { transform: [{ translateX: leftGroupX }] },
          ]}
        >
          <Text style={styles.animText}>with</Text>
          <View style={styles.circle} />
        </Animated.View>

        {/* Right group: circle + "you" */}
        <Animated.View
          style={[
            styles.rightGroup,
            { transform: [{ translateX: rightGroupX }] },
          ]}
        >
          <View style={styles.circle} />
          <Text style={styles.animText}>you</Text>
        </Animated.View>
      </Animated.View>

      {/* Final "wiedu" logo (matches design.pen) */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity },
        ]}
      >
        {/* Overlapping circles logo mark */}
        <View style={styles.circlesFrame}>
          <View style={styles.circleYou} />
          <View style={styles.circleUs} />
        </View>

        {/* Logo text */}
        <View style={styles.logoTextFrame}>
          <Text style={styles.logoWi}>wi</Text>
          <Text style={styles.logoEdu}>edu</Text>
        </View>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            { opacity: taglineOpacity },
          ]}
        >
          함께 성장하는 스터디 플랫폼
        </Animated.Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Glow effects (radial gradient - matching design.pen positions)
  glow1: {
    position: 'absolute',
    left: 20,
    top: 220,
    width: 350,
    height: 350,
  },
  glow2: {
    position: 'absolute',
    left: 100,
    top: 450,
    width: 280,
    height: 280,
  },
  glow3: {
    position: 'absolute',
    left: -50,
    top: 550,
    width: 200,
    height: 200,
  },
  // Animation container
  animationContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  animText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
  },
  // Final logo container (matches design.pen structure)
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    gap: 16,
  },
  circlesFrame: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleYou: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A78BFA',
    marginRight: -16, // overlap (gap: -16 in design.pen)
  },
  circleUs: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
  },
  logoTextFrame: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWi: {
    fontSize: 44,
    fontWeight: '700',
    color: '#A78BFA',
  },
  logoEdu: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#71717A',
  },
});
