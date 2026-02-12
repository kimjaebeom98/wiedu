import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface EmailVerifyScreenProps {
  navigation: any;
  route: any;
}

export default function EmailVerifyScreen({ navigation, route }: EmailVerifyScreenProps) {
  const { email, password } = route.params || {};
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length <= 1) {
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);
      setError('');

      // Auto-focus next input
      if (numericText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (numericText.length === 6) {
      // Handle paste of full code
      const newCode = numericText.split('');
      setCode(newCode);
      setError('');
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('인증코드 6자리를 모두 입력해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Call API to verify code
      // await verifyEmailCode(email, fullCode);

      // TODO: Call API to complete registration
      // await register(email, password);

      // Navigate to onboarding after signup
      navigation.replace('Onboarding', { email });
    } catch (err: any) {
      setError(err.message || '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend && timeLeft > 0) return;

    setLoading(true);
    try {
      // TODO: Call API to resend verification email
      // await sendVerificationEmail(email);

      setTimeLeft(5 * 60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || '인증코드 재전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />

        {/* Background glows */}
        <View style={styles.glow1} />
        <View style={styles.glow2} />

        <View style={styles.content}>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>이메일로 전송된{'\n'}인증코드를 입력해주세요</Text>
            <Text style={styles.subtitle}>{email}으로 전송했어요</Text>
            <View style={styles.devNoticeBox}>
              <Text style={styles.devNoticeText}>⚠️ 개발예정: 이메일 인증 기능은 준비 중입니다</Text>
            </View>
          </View>

          {/* Code Input Section */}
          <View style={styles.codeSection}>
            <View style={styles.codeRow}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Timer Row */}
            <View style={styles.timerRow}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerDivider}>|</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend || loading}
              >
                <Text style={[
                  styles.resendText,
                  canResend && styles.resendTextActive,
                ]}>
                  인증코드 재전송
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Verify Button */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>인증 확인</Text>
              )}
            </TouchableOpacity>

            {/* Skip Button (개발예정) */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => navigation.replace('Onboarding', { email })}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.skipBtnText}>건너뛰기 (개발 중)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#27272A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#27272A',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  codeInputFilled: {
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  timerDivider: {
    fontSize: 14,
    color: '#3F3F46',
  },
  resendText: {
    fontSize: 14,
    color: '#71717A',
  },
  resendTextActive: {
    color: '#8B5CF6',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
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
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  verifyBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  verifyBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devNoticeBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  devNoticeText: {
    color: '#EAB308',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  skipBtn: {
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  skipBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#71717A',
  },
});
