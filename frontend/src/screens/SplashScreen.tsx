import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo: wie❤️u */}
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>wie</Text>
          <View style={styles.heartCircle}>
            <Feather name="heart" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>u</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>함께 성장하는 스터디 플랫폼</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow1: {
    position: 'absolute',
    left: -50,
    top: 280,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  glow2: {
    position: 'absolute',
    left: 200,
    top: 500,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(244, 114, 182, 0.09)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heartCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  heartIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  tagline: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#71717A',
  },
});
