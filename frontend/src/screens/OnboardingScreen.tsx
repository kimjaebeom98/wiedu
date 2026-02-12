import React, { useState, useCallback } from 'react';
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 7;

// ─── Data Constants (design.pen 기준) ─────────────────────────────────────────

const INTEREST_OPTIONS = [
  { key: 'IT_DEV', label: 'IT/개발' },
  { key: 'LANGUAGE', label: '외국어' },
  { key: 'DESIGN', label: '디자인' },
  { key: 'BUSINESS', label: '비즈니스' },
  { key: 'CERTIFICATION', label: '자격증' },
  { key: 'CAREER', label: '취업/이직' },
  { key: 'FINANCE', label: '재테크' },
  { key: 'OTHER', label: '기타' },
] as const;

// design.pen: "처음이에요" / "몇 번 해봤어요" / "꾸준히 하고 있어요"
const EXPERIENCE_OPTIONS = [
  { key: 'BEGINNER', label: '처음이에요' },
  { key: 'INTERMEDIATE', label: '몇 번 해봤어요' },
  { key: 'EXPERIENCED', label: '꾸준히 하고 있어요' },
] as const;

// design.pen: 4개 옵션 with Lucide icons
const STUDY_STYLE_OPTIONS = [
  { key: 'ONLINE', label: '온라인 스터디', icon: 'monitor' },
  { key: 'OFFLINE', label: '오프라인 스터디', icon: 'map-pin' },
  { key: 'PROJECT', label: '프로젝트형 스터디', icon: 'folder' },
  { key: 'MENTORING', label: '멘토링/레슨', icon: 'award' },
] as const;

const REGION_OPTIONS = [
  '강남구', '서초구', '마포구', '성동구', '종로구',
  '용산구', '송파구', '영등포구', '관악구', '강동구',
  '노원구', '은평구', '동대문구', '광진구', '중구',
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  navigation: any;
  route: any;
}

interface OnboardingData {
  // Step 1: Terms
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  // Step 2: Experience
  experience: string;
  // Step 3: Interests
  interests: string[];
  // Step 4: Study style
  studyStyles: string[];
  // Step 5: Region
  region: string;
  // Step 6: Profile
  nickname: string;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingScreen({ navigation, route }: OnboardingScreenProps) {
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
      case 1: // Terms
        return data.termsAgreed && data.privacyAgreed;
      case 2: // Experience
        return data.experience !== '';
      case 3: // Interests
        return data.interests.length > 0;
      case 4: // Study style
        return data.studyStyles.length > 0;
      case 5: // Region
        return true; // Optional
      case 6: // Profile
        return data.nickname.trim().length >= 2 && data.nickname.trim().length <= 20;
      case 7: // Complete
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  const isSkippable = useCallback((): boolean => {
    // design.pen에서 건너뛰기 버튼이 있는 화면: 경험, 관심, 스터디방식, 지역
    return [2, 3, 4, 5].includes(currentStep);
  }, [currentStep]);

  // ─── Navigation ──────────────────────────────────────────────────────

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();
    setError('');

    // Step-specific validation messages
    if (currentStep === 1 && (!data.termsAgreed || !data.privacyAgreed)) {
      setError('필수 약관에 동의해주세요.');
      return;
    }
    if (currentStep === 6) {
      const trimmed = data.nickname.trim();
      if (trimmed.length < 2) {
        setError('닉네임은 2자 이상이어야 합니다.');
        return;
      }
      if (trimmed.length > 20) {
        setError('닉네임은 20자 이하여야 합니다.');
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step: submit and navigate
      await handleComplete();
    }
  }, [currentStep, data]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // TODO: Call onboarding API with collected data
      // await submitOnboarding(data);
      navigation.replace('Home');
    } catch (err: any) {
      setError(err.message || '온보딩 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step Info (design.pen 기준) ───────────────────────────────────────

  const stepInfo: Record<number, { title: string; subtitle: string }> = {
    1: { title: '서비스 이용약관에\n동의해주세요', subtitle: 'wiedu 서비스 이용을 위해 필요해요' },
    2: { title: '스터디 경험이\n어떻게 되시나요?', subtitle: '맞춤 스터디 추천을 위해 알려주세요' },
    3: { title: '어떤 분야에\n관심이 있으세요?', subtitle: '여러 개 선택 가능해요' },
    4: { title: '어떤 방식의 스터디를\n선호하시나요?', subtitle: '복수 선택 가능해요' },
    5: { title: '주로 어디서\n스터디 하시나요?', subtitle: '근처 스터디를 추천해 드릴게요' },
    6: { title: '프로필을 설정해주세요', subtitle: '다른 스터디원들에게 보여질 정보예요' },
    7: { title: '', subtitle: '' }, // Complete screen has its own layout
  };

  // Progress: 7단계 균등 분할 (1/7 = ~14.3% 씩 증가)
  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  // ─── Render ──────────────────────────────────────────────────────────

  // Step 7: Complete screen (special layout)
  if (currentStep === 7) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />
        <View style={styles.completeContainer}>
          {/* Icon */}
          <View style={styles.completeIconCircle}>
            <Feather name="check-circle" size={60} color="#22C55E" />
          </View>

          {/* Text */}
          <Text style={styles.completeTitle}>가입 완료!</Text>
          <Text style={styles.completeSubtitle}>wiedu와 함께 성장하는 여정을 시작해요</Text>

          {/* Button */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.completeBtnText}>시작하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#18181B" />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* Header: back button + progress bar */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={currentStep > 1 ? handleBack : () => navigation.goBack()}
                style={styles.backBtn}
              >
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{stepInfo[currentStep].title}</Text>
              <Text style={styles.subtitle}>{stepInfo[currentStep].subtitle}</Text>
            </View>

            {/* Step content (scrollable) */}
            <ScrollView
              style={styles.stepContent}
              contentContainerStyle={styles.stepContentInner}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {currentStep === 1 && (
                <Step1Terms data={data} updateData={updateData} />
              )}
              {currentStep === 2 && (
                <Step2Experience data={data} updateData={updateData} />
              )}
              {currentStep === 3 && (
                <Step3Interests data={data} toggleArrayItem={toggleArrayItem} />
              )}
              {currentStep === 4 && (
                <Step4StudyStyle data={data} toggleArrayItem={toggleArrayItem} />
              )}
              {currentStep === 5 && (
                <Step5Region data={data} updateData={updateData} />
              )}
              {currentStep === 6 && (
                <Step6Profile data={data} updateData={updateData} />
              )}

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  !canProceed() && !isSkippable() && styles.nextBtnDisabled,
                  loading && styles.nextBtnDisabled,
                ]}
                onPress={handleNext}
                disabled={(!canProceed() && !isSkippable()) || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.nextBtnText}>
                    {currentStep === 1 ? '동의하고 계속하기' : '다음'}
                  </Text>
                )}
              </TouchableOpacity>

              {isSkippable() && (
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={handleSkip}
                  disabled={loading}
                >
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

// ─── Step Props ──────────────────────────────────────────────────────────────

interface StepProps {
  data: OnboardingData;
  updateData: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}

interface StepArrayProps {
  data: OnboardingData;
  toggleArrayItem: (key: 'interests' | 'studyStyles', item: string) => void;
}

// ─── Step 1: Terms Agreement (design.pen: Onboarding 1) ──────────────────────

function Step1Terms({ data, updateData }: StepProps) {
  const allRequired = data.termsAgreed && data.privacyAgreed;
  const allAgreed = allRequired && data.marketingAgreed;

  const handleToggleAll = () => {
    const newVal = !allAgreed;
    updateData('termsAgreed', newVal);
    updateData('privacyAgreed', newVal);
    updateData('marketingAgreed', newVal);
  };

  return (
    <View>
      {/* Toggle all */}
      <TouchableOpacity style={styles.termsAllRow} onPress={handleToggleAll}>
        <View style={[styles.checkbox, allAgreed && styles.checkboxChecked]}>
          {allAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.termsAllText}>전체 동의</Text>
      </TouchableOpacity>

      {/* Service terms (required) */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => updateData('termsAgreed', !data.termsAgreed)}
      >
        <View style={[styles.checkbox, data.termsAgreed && styles.checkboxChecked]}>
          {data.termsAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={styles.termsLabelRow}>
          <Text style={styles.termsRequiredBadge}>[필수]</Text>
          <Text style={styles.termsText}>서비스 이용약관 동의</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#52525B" />
      </TouchableOpacity>

      {/* Privacy (required) */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => updateData('privacyAgreed', !data.privacyAgreed)}
      >
        <View style={[styles.checkbox, data.privacyAgreed && styles.checkboxChecked]}>
          {data.privacyAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={styles.termsLabelRow}>
          <Text style={styles.termsRequiredBadge}>[필수]</Text>
          <Text style={styles.termsText}>개인정보 처리방침 동의</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#52525B" />
      </TouchableOpacity>

      {/* Marketing (optional) */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => updateData('marketingAgreed', !data.marketingAgreed)}
      >
        <View style={[styles.checkbox, data.marketingAgreed && styles.checkboxChecked]}>
          {data.marketingAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={styles.termsLabelRow}>
          <Text style={styles.termsOptionalBadge}>[선택]</Text>
          <Text style={styles.termsText}>마케팅 수신 동의</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#52525B" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 2: Experience (design.pen: Onboarding 2) ───────────────────────────

function Step2Experience({ data, updateData }: StepProps) {
  return (
    <View style={styles.experienceList}>
      {EXPERIENCE_OPTIONS.map((item) => {
        const selected = data.experience === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.optionCard, selected && styles.optionCardSelected]}
            onPress={() => updateData('experience', item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Step 3: Interests (design.pen: Onboarding 3) ────────────────────────────

function Step3Interests({ data, toggleArrayItem }: StepArrayProps) {
  // design.pen: 칩 형태로 3-3-2 배열
  return (
    <View style={styles.chipContainer}>
      {INTEREST_OPTIONS.map((item) => {
        const selected = data.interests.includes(item.key);
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => toggleArrayItem('interests', item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Step 4: Study Style (design.pen: Onboarding 4) ──────────────────────────

function Step4StudyStyle({ data, toggleArrayItem }: StepArrayProps) {
  return (
    <View style={styles.studyStyleList}>
      {STUDY_STYLE_OPTIONS.map((item) => {
        const selected = data.studyStyles.includes(item.key);
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.studyStyleCard, selected && styles.studyStyleCardSelected]}
            onPress={() => toggleArrayItem('studyStyles', item.key)}
            activeOpacity={0.7}
          >
            <Feather name={item.icon as any} size={20} color="#8B5CF6" />
            <Text style={[styles.studyStyleText, selected && styles.studyStyleTextSelected]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Step 5: Region (design.pen: Onboarding 5) ───────────────────────────────

function Step5Region({ data, updateData }: StepProps) {
  const [searchText, setSearchText] = useState('');

  const filteredRegions = searchText
    ? REGION_OPTIONS.filter(r => r.includes(searchText))
    : REGION_OPTIONS.slice(0, 6); // 기본적으로 6개만 표시

  return (
    <View>
      {/* Search input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#71717A" />
        <TextInput
          style={styles.searchInput}
          placeholder="지역 검색"
          placeholderTextColor="#71717A"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* GPS Button */}
      <TouchableOpacity style={styles.gpsBtn}>
        <Feather name="navigation" size={20} color="#8B5CF6" />
        <Text style={styles.gpsBtnText}>현재 위치로 설정</Text>
      </TouchableOpacity>

      {/* Region list */}
      <View style={styles.regionList}>
        {filteredRegions.map((region) => {
          const selected = data.region === region;
          return (
            <TouchableOpacity
              key={region}
              style={[styles.regionItem, selected && styles.regionItemSelected]}
              onPress={() => updateData('region', selected ? '' : region)}
              activeOpacity={0.7}
            >
              <Feather
                name="map-pin"
                size={18}
                color={selected ? "#8B5CF6" : "#71717A"}
              />
              <Text style={[styles.regionItemText, selected && styles.regionItemTextSelected]}>
                {region}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Step 6: Profile (design.pen: Onboarding 6) ──────────────────────────────

function Step6Profile({ data, updateData }: StepProps) {
  return (
    <View style={styles.profileContainer}>
      {/* Avatar placeholder */}
      <TouchableOpacity style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Feather name="camera" size={32} color="#71717A" />
        </View>
        <Text style={styles.avatarText}>프로필 사진 추가</Text>
      </TouchableOpacity>

      {/* Nickname */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>닉네임 (필수)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="닉네임을 입력해주세요"
            placeholderTextColor="#52525B"
            value={data.nickname}
            onChangeText={(text) => updateData('nickname', text)}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Styles (design.pen 기준) ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  // Header (design.pen 기준)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },

  // Title Section
  titleSection: {
    marginBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
  },

  // Step content
  stepContent: {
    flex: 1,
  },
  stepContentInner: {
    paddingBottom: 20,
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Buttons
  buttons: {
    gap: 12,
  },
  nextBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 15,
    color: '#71717A',
  },

  // ─── Step 1: Terms ───────────────────────────────────────────────────
  termsAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    height: 56,
  },
  termsAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  termsLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termsRequiredBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  termsOptionalBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  termsText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3F3F46',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },

  // ─── Step 2: Experience (design.pen 기준) ──────────────────────────────
  experienceList: {
    gap: 12,
  },
  optionCard: {
    height: 56,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 3: Interests (design.pen: chip 형태) ─────────────────────────
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#27272A',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  chipTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 4: Study Style (design.pen 기준) ─────────────────────────────
  studyStyleList: {
    gap: 12,
  },
  studyStyleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  studyStyleCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  studyStyleText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  studyStyleTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 5: Region (design.pen 기준) ──────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  gpsBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  regionList: {
    gap: 8,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  regionItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  regionItemText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  regionItemTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 6: Profile (design.pen 기준) ─────────────────────────────────
  profileContainer: {
    alignItems: 'center',
    gap: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  inputContainer: {
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  inputWrapper: {
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    justifyContent: 'center',
  },
  input: {
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ─── Step 7: Complete (design.pen 기준) ────────────────────────────────
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 24,
  },
  completeIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
  },
  completeBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  completeBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
