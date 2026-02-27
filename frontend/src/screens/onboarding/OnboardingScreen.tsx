import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { submitAllOnboardingData } from '../../api/onboarding';
import { OnboardingScreenProps, OnboardingData } from './types';
import { TOTAL_STEPS, STEP_INFO } from './constants';
import { styles } from './styles';
import Step1Terms from './steps/Step1Terms';
import Step2Experience from './steps/Step2Experience';
import Step3Interests from './steps/Step3Interests';
import Step4StudyStyle from './steps/Step4StudyStyle';
import Step5Region from './steps/Step5Region';
import Step6Profile from './steps/Step6Profile';

export default function OnboardingScreen({ navigation, route }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState<OnboardingData>({
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
    experience: '',
    interests: [],
    studyStyles: [],
    region: '',
    nickname: '',
  });

  const updateData = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
    setError('');
  }, []);

  const toggleArrayItem = useCallback((key: 'interests' | 'studyStyles', item: string) => {
    setData(prev => {
      const arr = prev[key];
      const next = arr.includes(item)
        ? arr.filter(i => i !== item)
        : [...arr, item];
      return { ...prev, [key]: next };
    });
    setError('');
  }, []);

  // ─── Validation ──────────────────────────────────────────────────────

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1: return data.termsAgreed && data.privacyAgreed;
      case 2: return data.experience !== '';
      case 3: return data.interests.length > 0;
      case 4: return data.studyStyles.length > 0;
      case 5: return true; // Optional
      case 6: return data.nickname.trim().length >= 2 && data.nickname.trim().length <= 20;
      case 7: return true;
      default: return false;
    }
  }, [currentStep, data]);

  const isSkippable = useCallback((): boolean => {
    return [2, 3, 4, 5].includes(currentStep);
  }, [currentStep]);

  // ─── Navigation ──────────────────────────────────────────────────────

  const handleComplete = async () => {
    setLoading(true);
    try {
      await submitAllOnboardingData(data);
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.message || '온보딩 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();
    setError('');

    if (currentStep === 1 && (!data.termsAgreed || !data.privacyAgreed)) {
      setError('필수 약관에 동의해주세요.');
      return;
    }
    if (currentStep === 6) {
      const trimmed = data.nickname.trim();
      if (trimmed.length < 2) { setError('닉네임은 2자 이상이어야 합니다.'); return; }
      if (trimmed.length > 20) { setError('닉네임은 20자 이하여야 합니다.'); return; }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleComplete();
    }
  }, [currentStep, data]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) { setCurrentStep(prev => prev - 1); setError(''); }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < TOTAL_STEPS) { setCurrentStep(prev => prev + 1); setError(''); }
    else { handleComplete(); }
  }, [currentStep]);

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  // ─── Step 7: Complete screen ─────────────────────────────────────────

  if (currentStep === 7) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <View style={styles.completeContainer}>
          <View style={styles.completeIconCircle}>
            <Feather name="check-circle" size={60} color="#22C55E" />
          </View>
          <Text style={styles.completeTitle}>가입 완료!</Text>
          <Text style={styles.completeSubtitle}>wiedu와 함께 성장하는 여정을 시작해요</Text>
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.completeBtnText}>시작하기</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Steps 1-6 ───────────────────────────────────────────────────────

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={currentStep > 1 ? handleBack : () => navigation.goBack()} style={styles.backBtn}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{STEP_INFO[currentStep].title}</Text>
              <Text style={styles.subtitle}>{STEP_INFO[currentStep].subtitle}</Text>
            </View>

            {/* Step content */}
            <ScrollView style={styles.stepContent} contentContainerStyle={styles.stepContentInner} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {currentStep === 1 && <Step1Terms data={data} updateData={updateData} />}
              {currentStep === 2 && <Step2Experience data={data} updateData={updateData} />}
              {currentStep === 3 && <Step3Interests data={data} toggleArrayItem={toggleArrayItem} />}
              {currentStep === 4 && <Step4StudyStyle data={data} toggleArrayItem={toggleArrayItem} />}
              {currentStep === 5 && <Step5Region data={data} updateData={updateData} />}
              {currentStep === 6 && <Step6Profile data={data} updateData={updateData} />}

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Bottom buttons */}
            <View style={[styles.buttons, { paddingBottom: Math.max(20, insets.bottom) }]}>
              <TouchableOpacity
                style={[styles.nextBtn, !canProceed() && !isSkippable() && styles.nextBtnDisabled, loading && styles.nextBtnDisabled]}
                onPress={handleNext}
                disabled={(!canProceed() && !isSkippable()) || loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#FFF" size="small" /> : (
                  <Text style={styles.nextBtnText}>{currentStep === 1 ? '동의하고 계속하기' : '다음'}</Text>
                )}
              </TouchableOpacity>
              {isSkippable() && (
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} disabled={loading}>
                  <Text style={styles.skipBtnText}>건너뛰기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}
