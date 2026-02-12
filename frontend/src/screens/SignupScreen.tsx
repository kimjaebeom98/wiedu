import React, { useState, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SignupScreenProps {
  navigation: any;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = async () => {
    Keyboard.dismiss();

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!passwordConfirm.trim()) {
      setError('비밀번호 확인을 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Call API to send verification email
      // await sendVerificationEmail(email);

      navigation.navigate('EmailVerify', { email, password });
    } catch (err: any) {
      setError(err.message || '인증 메일 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('EmailLogin');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.titleRow}>
                <Text style={styles.titleWi}>wi</Text>
                <Text style={styles.title}>edu에</Text>
              </View>
              <Text style={styles.title}>가입하기</Text>
              <Text style={styles.subtitle}>함께 성장하는 여정을 시작하세요</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>이메일</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={20} color="#71717A" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="이메일을 입력해주세요"
                    placeholderTextColor="#71717A"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={20} color="#71717A" style={styles.inputIcon} />
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="비밀번호를 입력해주세요"
                    placeholderTextColor="#71717A"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordConfirmRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#71717A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Confirm Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호 확인</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={20} color="#71717A" style={styles.inputIcon} />
                  <TextInput
                    ref={passwordConfirmRef}
                    style={styles.input}
                    placeholder="비밀번호를 다시 입력해주세요"
                    placeholderTextColor="#71717A"
                    value={passwordConfirm}
                    onChangeText={(text) => {
                      setPasswordConfirm(text);
                      setError('');
                    }}
                    secureTextEntry={!showPasswordConfirm}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    style={styles.eyeBtn}
                  >
                    <Feather
                      name={showPasswordConfirm ? 'eye' : 'eye-off'}
                      size={20}
                      color="#71717A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.nextBtnText}>다음</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginLink}>로그인</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 42,
  },
  titleWi: {
    fontSize: 32,
    fontWeight: '800',
    color: '#A78BFA',
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
    marginTop: 8,
  },
  formSection: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  eyeBtn: {
    padding: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  nextBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  loginText: {
    fontSize: 14,
    color: '#71717A',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
