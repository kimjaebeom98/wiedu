import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';

interface OnboardingScreenProps {
  navigation: any;
  route: any;
}

export default function OnboardingScreen({ navigation, route }: OnboardingScreenProps) {
  const { userId } = route.params || {};
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    Keyboard.dismiss();

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
      setError('닉네임은 2~20자 사이여야 합니다.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // TODO: Call API to update user profile
      // await updateUserProfile(userId, { nickname });

      // For now, just navigate to Home
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.message || '프로필 설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />

        {/* Background glows */}
        <View style={styles.glow1} />
        <View style={styles.glow2} />

        <View style={styles.content}>
          {/* Progress indicator */}
          <View style={styles.progressRow}>
            <View style={styles.progressDotActive} />
            <View style={styles.progressDot} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>프로필을 설정해주세요</Text>
            <Text style={styles.subtitle}>
              다른 멤버들에게 보여질 닉네임을 정해주세요
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Avatar placeholder */}
            <TouchableOpacity style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>📷</Text>
              </View>
              <Text style={styles.avatarText}>프로필 사진 추가</Text>
            </TouchableOpacity>

            {/* Nickname input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>닉네임</Text>
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력해주세요"
                placeholderTextColor="#52525B"
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                maxLength={20}
              />
              <Text style={styles.inputHint}>{nickname.length}/20</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.completeBtn, loading && styles.completeBtnDisabled]}
              onPress={handleComplete}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.completeBtnText}>완료</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={styles.skipBtnText}>나중에 할게요</Text>
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
    left: -100,
    top: 100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  glow2: {
    position: 'absolute',
    right: -100,
    bottom: 200,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3F3F46',
  },
  progressDotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3F3F46',
    borderStyle: 'dashed',
  },
  avatarIcon: {
    fontSize: 32,
  },
  avatarText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  inputHint: {
    fontSize: 12,
    color: '#52525B',
    textAlign: 'right',
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttons: {
    paddingBottom: 40,
  },
  completeBtn: {
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  completeBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    color: '#71717A',
  },
});
