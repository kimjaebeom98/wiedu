import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendVerificationCode, signup, login } from '../api/auth';
import { saveTokens } from '../storage/token';

interface EmailVerifyScreenProps {
  navigation: any;
  route: any;
}

/**
 * [임시] Railway SMTP 차단으로 인해 이메일 인증 자동 완료 처리
 * 백엔드에서 sendVerificationCode 호출 시 자동으로 인증 완료됨
 * TODO: Resend API 도입 후 원래 인증 코드 입력 UI로 복원
 */
export default function EmailVerifyScreen({ navigation, route }: EmailVerifyScreenProps) {
  const insets = useSafeAreaInsets();
  const { email, password } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 화면 마운트 시 자동으로 인증 완료 처리 후 회원가입 진행
  useEffect(() => {
    const autoVerifyAndSignup = async () => {
      if (!email || !password) {
        setError('이메일 또는 비밀번호 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 백엔드에서 자동 인증 처리됨
        await sendVerificationCode(email);

        // 회원가입 진행
        await signup(email, password);

        // 자동 로그인
        const tokens = await login(email, password);

        // 토큰 저장
        await saveTokens(tokens.accessToken, tokens.refreshToken);

        // 온보딩으로 이동
        navigation.replace('Onboarding', { email });
      } catch (err: any) {
        setError(err.message || '회원가입에 실패했습니다.');
        setLoading(false);
      }
    };

    autoVerifyAndSignup();
  }, [email, password, navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Background glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: Math.max(40, insets.bottom) }]}>
        {loading ? (
          // 로딩 상태: 회원가입 진행 중
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>회원가입 진행 중...</Text>
            <Text style={styles.loadingSubtext}>{email}</Text>
          </View>
        ) : error ? (
          // 에러 상태
          <View style={styles.errorContainer}>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <View style={styles.backBtnContainer}>
              <View style={styles.backBtn} onTouchEnd={handleBack}>
                <Text style={styles.backBtnText}>돌아가기</Text>
              </View>
            </View>
          </View>
        ) : null}
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
    bottom: 150,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 24,
  },
  loadingSubtext: {
    fontSize: 15,
    color: '#71717A',
    marginTop: 8,
  },
  errorContainer: {
    width: '100%',
    alignItems: 'center',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  backBtnContainer: {
    width: '100%',
  },
  backBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
