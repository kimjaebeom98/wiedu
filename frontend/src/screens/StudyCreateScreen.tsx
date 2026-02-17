import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Image,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../navigation/types';
import { fetchCategories, createStudy } from '../api/study';
import {
  Category,
  StudyCreateData,
  StudyMethod,
  DurationType,
  CurriculumItem,
  RuleItem,
} from '../types/study';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 6;

// ─── Data Constants ───────────────────────────────────────────────────────────

const DAY_OPTIONS = [
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
  { key: 'SAT', label: '토' },
  { key: 'SUN', label: '일' },
] as const;

const STUDY_METHOD_OPTIONS: { key: StudyMethod; label: string; icon: string }[] = [
  { key: 'ONLINE', label: '온라인', icon: 'monitor' },
  { key: 'OFFLINE', label: '오프라인', icon: 'map-pin' },
  { key: 'HYBRID', label: '온/오프라인 병행', icon: 'refresh-cw' },
];

// Duration weeks mapping - exact 1:1 mapping for clear UX
const WEEKS_TO_DURATION: Record<number, DurationType> = {
  1: 'ONE_WEEK',
  2: 'TWO_WEEKS',
  3: 'THREE_WEEKS',
  4: 'FOUR_WEEKS',
  5: 'FIVE_WEEKS',
  6: 'SIX_WEEKS',
  7: 'SIX_WEEKS',      // 7주는 6주로 저장
  8: 'EIGHT_WEEKS',
  9: 'EIGHT_WEEKS',    // 9주는 8주로 저장
  10: 'TEN_WEEKS',
  11: 'TEN_WEEKS',     // 11주는 10주로 저장
  12: 'TWELVE_WEEKS',
  13: 'TWELVE_WEEKS',
  14: 'TWELVE_WEEKS',
  15: 'TWELVE_WEEKS',
  16: 'SIXTEEN_WEEKS',
  17: 'SIXTEEN_WEEKS',
  18: 'SIXTEEN_WEEKS',
  19: 'SIXTEEN_WEEKS',
  20: 'TWENTY_WEEKS',
  21: 'TWENTY_WEEKS',
  22: 'TWENTY_WEEKS',
  23: 'TWENTY_WEEKS',
  24: 'TWENTY_FOUR_WEEKS',
};

const getDurationTypeFromWeeks = (weeks: number): DurationType | null => {
  if (weeks >= 25) return 'LONG_TERM';
  return WEEKS_TO_DURATION[weeks] || 'FOUR_WEEKS';
};

const getWeeksFromDurationType = (type: DurationType | null): number => {
  switch (type) {
    case 'ONE_WEEK': return 1;
    case 'TWO_WEEKS': return 2;
    case 'THREE_WEEKS': return 3;
    case 'FOUR_WEEKS': return 4;
    case 'FIVE_WEEKS': return 5;
    case 'SIX_WEEKS': return 6;
    case 'EIGHT_WEEKS': return 8;
    case 'TEN_WEEKS': return 10;
    case 'TWELVE_WEEKS': return 12;
    case 'SIXTEEN_WEEKS': return 16;
    case 'TWENTY_WEEKS': return 20;
    case 'TWENTY_FOUR_WEEKS': return 24;
    case 'LONG_TERM': return 25;
    default: return 4;
  }
};

const PLATFORM_OPTIONS = ['Zoom', 'Google Meet', 'Discord', 'Teams', '카카오톡'];

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const INITIAL_DATA: StudyCreateData = {
  title: '',
  categoryId: null,
  subcategoryId: null,
  coverImageUrl: '',
  tags: [],
  description: '',
  targetAudience: '',
  goals: '',
  studyMethod: null,
  daysOfWeek: [],
  time: '',
  durationType: null,
  platform: '',
  maxMembers: 6,
  participationFee: 0,
  deposit: 0,
  requirements: '',
  curriculums: [],
  rules: [],
};

// ─── Step Info ────────────────────────────────────────────────────────────────

const STEP_INFO: Record<number, { title: string; subtitle: string }> = {
  1: { title: '스터디 기본 정보를\n입력해주세요', subtitle: '스터디를 소개할 핵심 정보예요' },
  2: { title: '상세 설명을\n작성해주세요', subtitle: '참여자들이 스터디를 이해하는 데 도움돼요' },
  3: { title: '일정과 방식을\n설정해주세요', subtitle: '언제, 어떻게 진행할지 알려주세요' },
  4: { title: '모집 조건을\n설정해주세요', subtitle: '인원, 비용, 자격 요건을 설정해요' },
  5: { title: '커리큘럼과 규칙을\n작성해주세요', subtitle: '선택 사항이지만 신뢰를 높여줘요' },
  6: { title: '스터디를\n미리 확인해주세요', subtitle: '등록 전 최종 내용을 확인하세요' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudyCreateScreen() {
  const navigation = useNavigation<NavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<StudyCreateData>(INITIAL_DATA);
  const [tagInput, setTagInput] = useState('');

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch {
        // Non-fatal; user can still fill in the form
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // ─── Updaters ─────────────────────────────────────────────────────────

  const updateData = useCallback(<K extends keyof StudyCreateData>(
    key: K,
    value: StudyCreateData[K],
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
    setError('');
  }, []);

  const toggleDay = useCallback((day: string) => {
    setData(prev => {
      const next = prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day];
      return { ...prev, daysOfWeek: next };
    });
  }, []);

  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (!tag || data.tags.includes(tag) || data.tags.length >= 5) return;
    setData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput('');
  }, [tagInput, data.tags]);

  const removeTag = useCallback((tag: string) => {
    setData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }, []);

  // ─── Scroll Helper ──────────────────────────────────────────────────────

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // ─── Curriculum ───────────────────────────────────────────────────────

  const addCurriculum = useCallback(() => {
    setData(prev => ({
      ...prev,
      curriculums: [
        ...prev.curriculums,
        { weekNumber: prev.curriculums.length + 1, title: '', content: '' },
      ],
    }));
    scrollToEnd();
  }, [scrollToEnd]);

  const updateCurriculum = useCallback(
    (index: number, field: keyof CurriculumItem, value: string | number) => {
      setData(prev => {
        const next = [...prev.curriculums];
        next[index] = { ...next[index], [field]: value };
        return { ...prev, curriculums: next };
      });
    },
    [],
  );

  const removeCurriculum = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      curriculums: prev.curriculums
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, weekNumber: i + 1 })),
    }));
  }, []);

  // ─── Rules ────────────────────────────────────────────────────────────

  const addRule = useCallback(() => {
    setData(prev => ({
      ...prev,
      rules: [
        ...prev.rules,
        { ruleOrder: prev.rules.length + 1, content: '' },
      ],
    }));
    scrollToEnd();
  }, [scrollToEnd]);

  const updateRule = useCallback((index: number, value: string) => {
    setData(prev => {
      const next = [...prev.rules];
      next[index] = { ...next[index], content: value };
      return { ...prev, rules: next };
    });
  }, []);

  const removeRule = useCallback((index: number) => {
    setData(prev => ({
      ...prev,
      rules: prev.rules
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, ruleOrder: i + 1 })),
    }));
  }, []);

  // ─── Validation ───────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return data.title.trim().length >= 2 && data.categoryId !== null;
      case 2:
        return data.description.trim().length >= 10;
      case 3:
        return data.studyMethod !== null;
      case 4:
        return data.maxMembers >= 2;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  // ─── Navigation ───────────────────────────────────────────────────────

  const handleNext = useCallback(async () => {
    Keyboard.dismiss();
    setError('');

    if (currentStep === 1) {
      if (data.title.trim().length < 2) {
        setError('스터디 제목은 2자 이상 입력해주세요.');
        return;
      }
      if (data.categoryId === null) {
        setError('카테고리를 선택해주세요.');
        return;
      }
    }
    if (currentStep === 2 && data.description.trim().length < 10) {
      setError('스터디 설명은 10자 이상 입력해주세요.');
      return;
    }
    if (currentStep === 3 && data.studyMethod === null) {
      setError('진행 방식을 선택해주세요.');
      return;
    }
    if (currentStep === 4 && data.maxMembers < 2) {
      setError('최소 2명 이상으로 설정해주세요.');
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handlePublish();
    }
  }, [currentStep, data]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setError('');
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  const handlePublish = async () => {
    if (data.categoryId === null || data.studyMethod === null) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const response = await createStudy({
        title: data.title.trim(),
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId ?? undefined,
        coverImageUrl: data.coverImageUrl || undefined,
        tags: data.tags.length > 0 ? data.tags : undefined,
        description: data.description.trim(),
        targetAudience: data.targetAudience.trim() || undefined,
        goals: data.goals.trim() || undefined,
        studyMethod: data.studyMethod,
        daysOfWeek: data.daysOfWeek.length > 0 ? data.daysOfWeek : undefined,
        time: data.time || undefined,
        durationType: data.durationType ?? undefined,
        platform: data.platform || undefined,
        maxMembers: data.maxMembers,
        participationFee: data.participationFee || undefined,
        deposit: data.deposit || undefined,
        requirements: data.requirements.trim() || undefined,
        curriculums: data.curriculums.filter(c => c.title.trim()).length > 0
          ? data.curriculums.filter(c => c.title.trim())
          : undefined,
        rules: data.rules.filter(r => r.content.trim()).length > 0
          ? data.rules.filter(r => r.content.trim())
          : undefined,
      });
      navigation.replace('Home');
    } catch (err: any) {
      setError(err?.response?.data?.message || '스터디 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Progress ─────────────────────────────────────────────────────────

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>

              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                  <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.stepLabel}>{currentStep}/{TOTAL_STEPS}</Text>
              </View>

              {/* Title */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>{STEP_INFO[currentStep].title}</Text>
                <Text style={styles.subtitle}>{STEP_INFO[currentStep].subtitle}</Text>
              </View>

              {/* Step Content */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.stepContent}
                contentContainerStyle={styles.stepContentInner}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {currentStep === 1 && (
                  <Step1BasicInfo
                    data={data}
                    updateData={updateData}
                    categories={categories}
                    categoriesLoading={categoriesLoading}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    addTag={addTag}
                    removeTag={removeTag}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Description data={data} updateData={updateData} />
                )}
                {currentStep === 3 && (
                  <Step3Schedule
                    data={data}
                    updateData={updateData}
                    toggleDay={toggleDay}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Recruitment data={data} updateData={updateData} />
                )}
                {currentStep === 5 && (
                  <Step5Curriculum
                    data={data}
                    addCurriculum={addCurriculum}
                    updateCurriculum={updateCurriculum}
                    removeCurriculum={removeCurriculum}
                    addRule={addRule}
                    updateRule={updateRule}
                    removeRule={removeRule}
                  />
                )}
                {currentStep === 6 && (
                  <Step6Preview data={data} categories={categories} />
                )}

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
              </ScrollView>

              {/* Bottom Buttons */}
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[
                    styles.nextBtn,
                    currentStep === TOTAL_STEPS && styles.publishBtn,
                    (!canProceed() || loading) && currentStep !== TOTAL_STEPS && styles.nextBtnDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={loading || (!canProceed() && currentStep !== TOTAL_STEPS)}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.nextBtnText}>
                      {currentStep === TOTAL_STEPS ? '등록하기' : '다음'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
  );
}

// ─── Step 1: 기본정보 ─────────────────────────────────────────────────────────

interface Step1Props {
  data: StudyCreateData;
  updateData: <K extends keyof StudyCreateData>(key: K, value: StudyCreateData[K]) => void;
  categories: Category[];
  categoriesLoading: boolean;
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
}

function Step1BasicInfo({
  data,
  updateData,
  categories,
  categoriesLoading,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
}: Step1Props) {
  const selectedCategory = categories.find(c => c.id === data.categoryId);

  return (
    <View style={styles.stepInner}>
      {/* Title */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>스터디 제목 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.textInput}
          placeholder="예: 토익 900점 달성 스터디"
          placeholderTextColor="#52525B"
          value={data.title}
          onChangeText={v => updateData('title', v)}
          maxLength={50}
          returnKeyType="done"
        />
        <Text style={styles.charCount}>{data.title.length}/50</Text>
      </View>

      {/* Category */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>카테고리 <Text style={styles.required}>*</Text></Text>
        {categoriesLoading ? (
          <ActivityIndicator color="#8B5CF6" style={{ marginTop: 8 }} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryRow}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, data.categoryId === cat.id && styles.categoryChipSelected]}
                  onPress={() => {
                    updateData('categoryId', cat.id);
                    updateData('subcategoryId', null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryChipText, data.categoryId === cat.id && styles.categoryChipTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Subcategory */}
      {selectedCategory && selectedCategory.subcategories.length > 0 && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>세부 카테고리</Text>
          <View style={styles.chipContainer}>
            {selectedCategory.subcategories.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={[styles.chip, data.subcategoryId === sub.id && styles.chipSelected]}
                onPress={() => updateData('subcategoryId', data.subcategoryId === sub.id ? null : sub.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, data.subcategoryId === sub.id && styles.chipTextSelected]}>
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Cover Image Upload */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>커버 이미지</Text>
        <TouchableOpacity
          style={styles.imageUploadBtn}
          onPress={async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
              Alert.alert('권한 필요', '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              updateData('coverImageUrl', result.assets[0].uri);
            }
          }}
          activeOpacity={0.7}
        >
          {data.coverImageUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: data.coverImageUrl }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => updateData('coverImageUrl', '')}
              >
                <Feather name="x" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageUploadPlaceholder}>
              <Feather name="image" size={32} color="#52525B" />
              <Text style={styles.imageUploadText}>탭하여 이미지 선택</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tags */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>태그 <Text style={styles.fieldHint}>(최대 5개)</Text></Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={styles.tagInput}
            placeholder="태그 입력 후 추가"
            placeholderTextColor="#52525B"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
            returnKeyType="done"
            maxLength={20}
          />
          <TouchableOpacity
            style={[styles.tagAddBtn, data.tags.length >= 5 && styles.tagAddBtnDisabled]}
            onPress={addTag}
            disabled={data.tags.length >= 5}
          >
            <Feather name="plus" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
        {data.tags.length > 0 && (
          <View style={styles.tagList}>
            {data.tags.map(tag => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>#{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                  <Feather name="x" size={13} color="#A78BFA" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Step 2: 상세설명 ─────────────────────────────────────────────────────────

interface Step2Props {
  data: StudyCreateData;
  updateData: <K extends keyof StudyCreateData>(key: K, value: StudyCreateData[K]) => void;
}

function Step2Description({ data, updateData }: Step2Props) {
  const descriptionLength = data.description.trim().length;
  const minLength = 10;
  const isValid = descriptionLength >= minLength;

  return (
    <View style={styles.stepInner}>
      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>스터디 소개 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="스터디를 소개해주세요. 어떤 스터디인지 자세히 설명할수록 좋아요."
          placeholderTextColor="#52525B"
          value={data.description}
          onChangeText={v => updateData('description', v)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <View style={styles.charCountRow}>
          <Text style={[styles.minCharHint, isValid && styles.minCharHintValid]}>
            {isValid ? '✓ 최소 글자 수 충족' : `최소 ${minLength}자 이상 입력해주세요 (현재 ${descriptionLength}자)`}
          </Text>
          <Text style={styles.charCount}>{data.description.length}/1000</Text>
        </View>
      </View>

      {/* Target Audience */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>모집 대상</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaSmall]}
          placeholder="예: 토익 600점 이상, 매주 참여 가능한 분"
          placeholderTextColor="#52525B"
          value={data.targetAudience}
          onChangeText={v => updateData('targetAudience', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>

      {/* Goals */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>스터디 목표</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaSmall]}
          placeholder="예: 3개월 내 토익 900점 달성"
          placeholderTextColor="#52525B"
          value={data.goals}
          onChangeText={v => updateData('goals', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>
    </View>
  );
}

// ─── Step 3: 일정방식 ─────────────────────────────────────────────────────────

interface Step3Props {
  data: StudyCreateData;
  updateData: <K extends keyof StudyCreateData>(key: K, value: StudyCreateData[K]) => void;
  toggleDay: (day: string) => void;
}

function Step3Schedule({ data, updateData, toggleDay }: Step3Props) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    // Parse existing time or default to 8 PM
    const defaultDate = new Date();
    defaultDate.setHours(20, 0, 0, 0);
    return defaultDate;
  });

  // Local slider state for immediate visual feedback
  const storedWeeks = getWeeksFromDurationType(data.durationType);
  const [sliderValue, setSliderValue] = useState(storedWeeks);

  // Sync local state when parent data changes
  useEffect(() => {
    setSliderValue(storedWeeks);
  }, [storedWeeks]);

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedTime(date);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? '오후' : '오전';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const timeString = `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
      updateData('time', timeString);
    }
  };

  const getDurationLabel = (weeks: number): string => {
    if (weeks >= 25) return '장기 (24주+)';
    return `${weeks}주`;
  };

  return (
    <View style={styles.stepInner}>
      {/* Study Method */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>진행 방식 <Text style={styles.required}>*</Text></Text>
        <View style={styles.methodList}>
          {STUDY_METHOD_OPTIONS.map(opt => {
            const selected = data.studyMethod === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.methodCard, selected && styles.methodCardSelected]}
                onPress={() => updateData('studyMethod', opt.key)}
                activeOpacity={0.7}
              >
                <Feather name={opt.icon as any} size={18} color={selected ? '#FFF' : '#8B5CF6'} />
                <Text style={[styles.methodText, selected && styles.methodTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Days of Week */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>요일</Text>
        <View style={styles.dayRow}>
          {DAY_OPTIONS.map(day => {
            const selected = data.daysOfWeek.includes(day.key);
            return (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayBtn, selected && styles.dayBtnSelected]}
                onPress={() => toggleDay(day.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayBtnText, selected && styles.dayBtnTextSelected]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Time with TimePicker */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>시간</Text>
        <TouchableOpacity
          style={styles.timePickerBtn}
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.7}
        >
          <Feather name="clock" size={18} color="#8B5CF6" />
          <Text style={[styles.timePickerText, !data.time && styles.timePickerPlaceholder]}>
            {data.time || '시간을 선택해주세요'}
          </Text>
          <Feather name="chevron-down" size={18} color="#71717A" />
        </TouchableOpacity>

        {/* iOS: show inline picker, Android: show modal */}
        {showTimePicker && Platform.OS === 'ios' && (
          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.timePickerDone}>완료</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
              minuteInterval={5}
              locale="ko-KR"
              textColor="#FFFFFF"
            />
          </View>
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            minuteInterval={5}
          />
        )}
      </View>

      {/* Duration Slider */}
      <View style={styles.fieldGroup}>
        <View style={styles.durationHeader}>
          <Text style={styles.fieldLabel}>기간</Text>
          <Text style={styles.durationValue}>{getDurationLabel(sliderValue)}</Text>
        </View>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderMinLabel}>1주</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={25}
            step={1}
            value={sliderValue}
            onValueChange={(value) => {
              setSliderValue(Math.round(value));
            }}
            onSlidingComplete={(value) => {
              const roundedValue = Math.round(value);
              setSliderValue(roundedValue);
              const durationType = getDurationTypeFromWeeks(roundedValue);
              updateData('durationType', durationType);
            }}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#3F3F46"
            thumbTintColor="#8B5CF6"
          />
          <Text style={styles.sliderMaxLabel}>장기</Text>
        </View>
        <View style={styles.sliderTicks}>
          <Text style={styles.sliderTick}>4주</Text>
          <Text style={styles.sliderTick}>8주</Text>
          <Text style={styles.sliderTick}>12주</Text>
          <Text style={styles.sliderTick}>24주+</Text>
        </View>
      </View>

      {/* Platform (for ONLINE / HYBRID) */}
      {(data.studyMethod === 'ONLINE' || data.studyMethod === 'HYBRID') && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>플랫폼</Text>
          <View style={styles.chipContainer}>
            {PLATFORM_OPTIONS.map(p => {
              const selected = data.platform === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => updateData('platform', selected ? '' : p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={[styles.textInput, { marginTop: 10 }]}
            placeholder="직접 입력"
            placeholderTextColor="#52525B"
            value={PLATFORM_OPTIONS.includes(data.platform) ? '' : data.platform}
            onChangeText={v => updateData('platform', v)}
            returnKeyType="done"
          />
        </View>
      )}
    </View>
  );
}

// ─── Step 4: 모집설정 ─────────────────────────────────────────────────────────

interface Step4Props {
  data: StudyCreateData;
  updateData: <K extends keyof StudyCreateData>(key: K, value: StudyCreateData[K]) => void;
}

function Step4Recruitment({ data, updateData }: Step4Props) {
  return (
    <View style={styles.stepInner}>
      {/* Max Members */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>최대 인원 <Text style={styles.required}>*</Text></Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => updateData('maxMembers', Math.max(2, data.maxMembers - 1))}
          >
            <Feather name="minus" size={20} color="#8B5CF6" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{data.maxMembers}명</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => updateData('maxMembers', Math.min(50, data.maxMembers + 1))}
          >
            <Feather name="plus" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Participation Fee */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>참가비</Text>
        <View style={styles.feeInputRow}>
          <TextInput
            style={[styles.textInput, styles.feeInput]}
            placeholder="0"
            placeholderTextColor="#52525B"
            value={String(data.participationFee)}
            onChangeText={v => {
              const num = v.replace(/[^0-9]/g, '');
              updateData('participationFee', num === '' ? 0 : Number(num));
            }}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.feeUnit}>원</Text>
        </View>
        <Text style={styles.fieldHintText}>무료 스터디는 0원으로 설정하세요</Text>
      </View>

      {/* Deposit */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>보증금</Text>
        <View style={styles.feeInputRow}>
          <TextInput
            style={[styles.textInput, styles.feeInput]}
            placeholder="0"
            placeholderTextColor="#52525B"
            value={String(data.deposit)}
            onChangeText={v => {
              const num = v.replace(/[^0-9]/g, '');
              updateData('deposit', num === '' ? 0 : Number(num));
            }}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.feeUnit}>원</Text>
        </View>
        <Text style={styles.fieldHintText}>출석/과제 완수 시 환급되는 보증금이에요</Text>
      </View>

      {/* Requirements */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>지원 자격 요건</Text>
        <TextInput
          style={[styles.textInput, styles.textAreaSmall]}
          placeholder="예: 매주 참석 가능한 분, 과제 제출 가능한 분"
          placeholderTextColor="#52525B"
          value={data.requirements}
          onChangeText={v => updateData('requirements', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={300}
        />
      </View>
    </View>
  );
}

// ─── Step 5: 커리큘럼 ─────────────────────────────────────────────────────────

interface Step5Props {
  data: StudyCreateData;
  addCurriculum: () => void;
  updateCurriculum: (index: number, field: keyof CurriculumItem, value: string | number) => void;
  removeCurriculum: (index: number) => void;
  addRule: () => void;
  updateRule: (index: number, value: string) => void;
  removeRule: (index: number) => void;
}

function Step5Curriculum({
  data,
  addCurriculum,
  updateCurriculum,
  removeCurriculum,
  addRule,
  updateRule,
  removeRule,
}: Step5Props) {
  return (
    <View style={styles.stepInner}>
      {/* Curriculum */}
      <View style={styles.fieldGroup}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.fieldLabel}>주차별 커리큘럼</Text>
          <TouchableOpacity style={styles.addRowBtn} onPress={addCurriculum}>
            <Feather name="plus" size={16} color="#8B5CF6" />
            <Text style={styles.addRowBtnText}>주차 추가</Text>
          </TouchableOpacity>
        </View>

        {data.curriculums.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={28} color="#3F3F46" />
            <Text style={styles.emptyStateText}>커리큘럼을 추가해보세요</Text>
          </View>
        ) : (
          data.curriculums.map((item, i) => (
            <View key={i} style={styles.curriculumCard}>
              <View style={styles.curriculumCardHeader}>
                <View style={styles.weekBadge}>
                  <Text style={styles.weekBadgeText}>{item.weekNumber}주차</Text>
                </View>
                <TouchableOpacity onPress={() => removeCurriculum(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="trash-2" size={15} color="#71717A" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.curriculumTitleInput}
                placeholder="주제 입력"
                placeholderTextColor="#52525B"
                value={item.title}
                onChangeText={v => updateCurriculum(i, 'title', v)}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.curriculumTitleInput, styles.curriculumContentInput]}
                placeholder="내용 입력 (선택)"
                placeholderTextColor="#52525B"
                value={item.content}
                onChangeText={v => updateCurriculum(i, 'content', v)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          ))
        )}
      </View>

      {/* Rules */}
      <View style={styles.fieldGroup}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.fieldLabel}>스터디 규칙</Text>
          <TouchableOpacity style={styles.addRowBtn} onPress={addRule}>
            <Feather name="plus" size={16} color="#8B5CF6" />
            <Text style={styles.addRowBtnText}>규칙 추가</Text>
          </TouchableOpacity>
        </View>

        {data.rules.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="list" size={28} color="#3F3F46" />
            <Text style={styles.emptyStateText}>규칙을 추가해보세요</Text>
          </View>
        ) : (
          data.rules.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <View style={styles.ruleOrderBadge}>
                <Text style={styles.ruleOrderText}>{rule.ruleOrder}</Text>
              </View>
              <TextInput
                style={styles.ruleInput}
                placeholder={`규칙 ${rule.ruleOrder}번`}
                placeholderTextColor="#52525B"
                value={rule.content}
                onChangeText={v => updateRule(i, v)}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => removeRule(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color="#71717A" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

// ─── Step 6: 미리보기 ─────────────────────────────────────────────────────────

interface Step6Props {
  data: StudyCreateData;
  categories: Category[];
}

function Step6Preview({ data, categories }: Step6Props) {
  const category = categories.find(c => c.id === data.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === data.subcategoryId);

  const methodLabel = STUDY_METHOD_OPTIONS.find(m => m.key === data.studyMethod)?.label ?? '-';
  const durationWeeks = getWeeksFromDurationType(data.durationType);
  const durationLabel = durationWeeks >= 25 ? '장기 (24주+)' : `${durationWeeks}주`;
  const selectedDays = DAY_OPTIONS.filter(d => data.daysOfWeek.includes(d.key)).map(d => d.label).join(', ');

  const formatFee = (amount: number) =>
    amount === 0 ? '무료' : `${amount.toLocaleString()}원`;

  return (
    <View style={styles.stepInner}>
      {/* Cover Image */}
      {data.coverImageUrl ? (
        <View style={styles.previewCoverContainer}>
          <Image source={{ uri: data.coverImageUrl }} style={styles.previewCoverImage} />
        </View>
      ) : null}

      {/* Title Card */}
      <View style={styles.previewCard}>
        <View style={styles.previewCategoryRow}>
          {category && (
            <View style={styles.previewCategoryBadge}>
              <Text style={styles.previewCategoryText}>{category.name}</Text>
              {subcategory && <Text style={styles.previewSubcategoryText}> · {subcategory.name}</Text>}
            </View>
          )}
        </View>
        <Text style={styles.previewTitle}>{data.title || '제목 없음'}</Text>
        {data.tags.length > 0 && (
          <View style={styles.previewTagRow}>
            {data.tags.map(tag => (
              <View key={tag} style={styles.previewTag}>
                <Text style={styles.previewTagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Description */}
      {data.description ? (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>스터디 소개</Text>
          <Text style={styles.previewBody}>{data.description}</Text>
        </View>
      ) : null}

      {/* Info Grid */}
      <View style={styles.previewGrid}>
        <PreviewInfoItem icon="monitor" label="진행 방식" value={methodLabel} />
        <PreviewInfoItem icon="clock" label="시간" value={data.time || '-'} />
        <PreviewInfoItem icon="calendar" label="요일" value={selectedDays || '-'} />
        <PreviewInfoItem icon="bar-chart-2" label="기간" value={durationLabel} />
        <PreviewInfoItem icon="users" label="최대 인원" value={`${data.maxMembers}명`} />
        <PreviewInfoItem icon="credit-card" label="참가비" value={formatFee(data.participationFee)} />
        {data.deposit > 0 && (
          <PreviewInfoItem icon="shield" label="보증금" value={formatFee(data.deposit)} />
        )}
        {data.platform && (
          <PreviewInfoItem icon="video" label="플랫폼" value={data.platform} />
        )}
      </View>

      {/* Target & Goals */}
      {(data.targetAudience || data.goals) && (
        <View style={styles.previewSection}>
          {data.targetAudience ? (
            <>
              <Text style={styles.previewSectionTitle}>모집 대상</Text>
              <Text style={styles.previewBody}>{data.targetAudience}</Text>
            </>
          ) : null}
          {data.goals ? (
            <>
              <Text style={[styles.previewSectionTitle, { marginTop: 12 }]}>스터디 목표</Text>
              <Text style={styles.previewBody}>{data.goals}</Text>
            </>
          ) : null}
        </View>
      )}

      {/* Curriculum */}
      {data.curriculums.filter(c => c.title.trim()).length > 0 && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>커리큘럼</Text>
          {data.curriculums.filter(c => c.title.trim()).map(item => (
            <View key={item.weekNumber} style={styles.previewCurriculumRow}>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>{item.weekNumber}주차</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewCurriculumTitle}>{item.title}</Text>
                {item.content ? (
                  <Text style={styles.previewCurriculumContent}>{item.content}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Rules */}
      {data.rules.filter(r => r.content.trim()).length > 0 && (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>스터디 규칙</Text>
          {data.rules.filter(r => r.content.trim()).map(rule => (
            <View key={rule.ruleOrder} style={styles.previewRuleRow}>
              <View style={styles.ruleOrderBadge}>
                <Text style={styles.ruleOrderText}>{rule.ruleOrder}</Text>
              </View>
              <Text style={styles.previewBody}>{rule.content}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Requirements */}
      {data.requirements ? (
        <View style={styles.previewSection}>
          <Text style={styles.previewSectionTitle}>지원 자격</Text>
          <Text style={styles.previewBody}>{data.requirements}</Text>
        </View>
      ) : null}
    </View>
  );
}

function PreviewInfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.previewInfoItem}>
      <Feather name={icon as any} size={14} color="#8B5CF6" />
      <Text style={styles.previewInfoLabel}>{label}</Text>
      <Text style={styles.previewInfoValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
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
  stepLabel: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
    minWidth: 28,
    textAlign: 'right',
  },

  // Title Section
  titleSection: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717A',
  },

  // Step scroll
  stepContent: {
    flex: 1,
  },
  stepContentInner: {
    paddingBottom: 16,
  },
  stepInner: {
    gap: 20,
  },

  // Field
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  required: {
    color: '#8B5CF6',
  },
  fieldHint: {
    fontWeight: '400',
    color: '#52525B',
  },
  fieldHintText: {
    fontSize: 12,
    color: '#52525B',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#52525B',
    textAlign: 'right',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  minCharHint: {
    fontSize: 12,
    color: '#EF4444',
  },
  minCharHintValid: {
    color: '#22C55E',
  },

  // Text Inputs
  textInput: {
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    paddingBottom: 14,
  },
  textAreaSmall: {
    height: 88,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // Category
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#27272A',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryChipSelected: {
    backgroundColor: '#8B5CF6',
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#D4D4D8',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Image Upload
  imageUploadBtn: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#27272A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageUploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#3F3F46',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#52525B',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#27272A',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 14,
    color: '#D4D4D8',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Tags
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  tagAddBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagAddBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tagBadgeText: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '500',
  },

  // Study Method
  methodList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 18,
    gap: 12,
  },
  methodCardSelected: {
    backgroundColor: '#8B5CF6',
  },
  methodText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  methodTextSelected: {
    fontWeight: '600',
  },

  // Days
  dayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#27272A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBtnSelected: {
    backgroundColor: '#8B5CF6',
  },
  dayBtnText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  dayBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Time Picker
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  timePickerText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  timePickerPlaceholder: {
    color: '#52525B',
  },
  timePickerContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  timePickerDone: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Duration Slider
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#71717A',
    minWidth: 28,
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#71717A',
    minWidth: 28,
    textAlign: 'right',
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    marginTop: 4,
  },
  sliderTick: {
    fontSize: 11,
    color: '#52525B',
  },

  // Counter
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 8,
  },
  counterBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  counterValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Fee
  feeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feeInput: {
    flex: 1,
  },
  feeUnit: {
    fontSize: 15,
    color: '#A1A1AA',
    fontWeight: '500',
    minWidth: 20,
  },

  // Curriculum
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 8,
  },
  addRowBtnText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: '#27272A',
    borderRadius: 12,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#52525B',
  },
  curriculumCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  curriculumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
  },
  curriculumTitleInput: {
    height: 44,
    backgroundColor: '#1E1E22',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  curriculumContentInput: {
    height: 60,
    paddingTop: 10,
    paddingBottom: 10,
  },

  // Rules
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  ruleOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleOrderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A78BFA',
  },
  ruleInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Preview
  previewCoverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  previewCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  previewCategoryIcon: {
    fontSize: 13,
  },
  previewCategoryText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  previewSubcategoryText: {
    fontSize: 12,
    color: '#71717A',
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  previewTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  previewTagText: {
    fontSize: 12,
    color: '#A78BFA',
  },
  previewSection: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewBody: {
    fontSize: 14,
    color: '#D4D4D8',
    lineHeight: 21,
  },
  previewGrid: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  previewInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  previewInfoLabel: {
    flex: 1,
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
  },
  previewInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  previewCurriculumRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  previewCurriculumTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  previewCurriculumContent: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
  previewRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },

  // Buttons
  buttons: {
    paddingTop: 12,
  },
  nextBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBtn: {
    backgroundColor: '#22C55E',
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
