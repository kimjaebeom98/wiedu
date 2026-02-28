import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { fetchCategories, createStudy } from '../../api/study';
import { Category, StudyCreateData, CurriculumItem } from '../../types/study';
import { TOTAL_STEPS, STEP_INFO, INITIAL_DATA } from './constants';
import { styles } from './styles';

import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Description from './steps/Step2Description';
import Step3Schedule from './steps/Step3Schedule';
import Step4Recruitment from './steps/Step4Recruitment';
import Step5Curriculum from './steps/Step5Curriculum';
import Step6Preview from './steps/Step6Preview';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
        meetingLocation: data.meetingLocation || undefined,
        meetingLatitude: data.meetingLatitude ?? undefined,
        meetingLongitude: data.meetingLongitude ?? undefined,
        maxMembers: data.maxMembers,
        deposit: data.deposit || undefined,
        depositRefundPolicy: data.depositRefundPolicy.trim() || undefined,
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
