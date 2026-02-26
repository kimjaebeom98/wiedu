import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { startKakaoLogin } from '../services/kakaoAuth';
import { saveTokens } from '../storage/token';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = () => {
    navigation.navigate('EmailLogin');
  };

  const handleKakaoLogin = async () => {
    setLoading(true);

    try {
      console.log('[Login] Starting Kakao login...');
      const result = await startKakaoLogin();
      console.log('[Login] Kakao login result:', JSON.stringify(result, null, 2));

      if (result.success && result.accessToken && result.refreshToken) {
        // 토큰 저장
        await saveTokens(result.accessToken, result.refreshToken);
        console.log('[Login] Tokens saved, onboardingCompleted:', result.onboardingCompleted);

        // 온보딩 완료 여부에 따라 분기
        if (result.onboardingCompleted) {
          console.log('[Login] Onboarding completed, navigating to Home');
          navigation.replace('Home');
        } else {
          console.log('[Login] Onboarding not completed, navigating to Onboarding');
          navigation.replace('Onboarding');
        }
      } else if (result.cancelled) {
        // 사용자가 취소함 - 아무것도 하지 않음
        console.log('[Login] User cancelled');
      } else {
        // 에러 발생
        console.error('[Login] Kakao login error:', result.error);
        Alert.alert('로그인 실패', result.error || '카카오 로그인에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[Login] Unexpected error:', error);
      Alert.alert('로그인 실패', error.message || '카카오 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement other social logins
    Alert.alert('준비 중', `${provider} 로그인은 준비 중입니다.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>로그인 중...</Text>
        </View>
      )}

      {/* Background glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.headline}>스터디 고민 끝,</Text>
          <View style={styles.headlineRow}>
            <Text style={styles.headlineWi}>wi</Text>
            <Text style={styles.headline}>edu에 오신 것을</Text>
          </View>
          <Text style={styles.headline}>환영합니다!</Text>
          <Text style={styles.tagline}>3초 가입으로 바로 시작해보세요</Text>
        </View>

        {/* Social Login Section */}
        <View style={styles.socialSection}>
          {/* Email Login Button */}
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={handleEmailLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Feather name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.emailText}>이메일로 시작하기</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.kakaoBtn}
              onPress={handleKakaoLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.kakaoIcon}>K</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.naverBtn}
              onPress={() => handleSocialLogin('네이버')}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.naverIcon}>N</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => handleSocialLogin('구글')}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            로그인하시면 아래 내용에 동의하는 것으로 간주됩니다.
          </Text>
          <Text style={styles.footerLinks}>개인정보처리방침 | 이용약관</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  glow1: {
    position: 'absolute',
    left: -120,
    top: 50,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  glow2: {
    position: 'absolute',
    right: -100,
    bottom: height * 0.3,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
  },
  content: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    width: '100%',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headlineWi: {
    fontSize: 32,
    fontWeight: '800',
    color: '#A78BFA',
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagline: {
    marginTop: 16,
    fontSize: 15,
    color: '#71717A',
  },
  socialSection: {
    width: '100%',
  },
  emailBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3F3F46',
  },
  dividerText: {
    fontSize: 13,
    color: '#71717A',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  kakaoBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kakaoIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  naverBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#03C75A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  naverIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#71717A',
  },
  footerLinks: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717A',
  },
});
