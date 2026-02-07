import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const handleEmailLogin = () => {
    navigation.navigate('EmailLogin');
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`${provider} login pressed`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Background glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.headline}>스터디 고민 끝,</Text>
          <View style={styles.headlineRow}>
            <Text style={styles.headline}>wie</Text>
            <View style={styles.heartCircle}>
              <Feather name="heart" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.headline}>u에 오신 것을</Text>
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
              onPress={() => handleSocialLogin('kakao')}
              activeOpacity={0.8}
            >
              <Text style={styles.kakaoIcon}>K</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.naverBtn}
              onPress={() => handleSocialLogin('naver')}
              activeOpacity={0.8}
            >
              <Text style={styles.naverIcon}>N</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => handleSocialLogin('google')}
              activeOpacity={0.8}
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
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  heartIcon: {
    fontSize: 16,
    color: '#FFFFFF',
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
