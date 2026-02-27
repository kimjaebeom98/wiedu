import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { applyToStudy } from '../../api/study';
import { styles } from './styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type StudyApplyRouteProp = RouteProp<RootStackParamList, 'StudyApply'>;

export default function StudyApplyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StudyApplyRouteProp>();
  const insets = useSafeAreaInsets();
  const { studyId, studyTitle, leaderName, currentMembers, maxMembers, rules, depositRefundPolicy } = route.params;

  const [introduction, setIntroduction] = useState('');
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [question, setQuestion] = useState('');
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeDeposit, setAgreeDeposit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const canSubmit = introduction.trim() && motivation.trim() && agreeRules && agreeDeposit;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('알림', '필수 항목을 모두 입력하고 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      // Combine all form fields into message
      const message = `[자기소개]\n${introduction}\n\n[지원 동기]\n${motivation}${experience ? `\n\n[관련 경험]\n${experience}` : ''}${question ? `\n\n[질문]\n${question}` : ''}`;

      await applyToStudy(studyId, message);
      navigation.replace('ApplyComplete', { studyId, studyTitle });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || '가입 신청에 실패했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가입 신청</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Study Info */}
        <View style={styles.studyInfo}>
          <View style={styles.studyThumb}>
            <Feather name="book-open" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.studyText}>
            <Text style={styles.studyTitle} numberOfLines={1}>{studyTitle}</Text>
            <Text style={styles.studyMeta}>{leaderName} · 모집중 {currentMembers}/{maxMembers}명</Text>
          </View>
        </View>

        {/* Form Content */}
        <View style={styles.formContent}>
          {/* 자기소개 */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>자기소개</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="간단한 자기소개를 해주세요&#10;(직업, 관심사 등)"
              placeholderTextColor="#71717A"
              multiline
              textAlignVertical="top"
              value={introduction}
              onChangeText={setIntroduction}
            />
          </View>

          {/* 지원 동기 */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>지원 동기</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="이 스터디에 참여하고 싶은 이유는?"
              placeholderTextColor="#71717A"
              multiline
              textAlignVertical="top"
              value={motivation}
              onChangeText={setMotivation}
            />
          </View>

          {/* 관련 경험 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>관련 경험 (선택)</Text>
            <TextInput
              style={[styles.textInput, styles.textInputSmall]}
              placeholder="관련 분야의 경험이 있다면 작성해주세요"
              placeholderTextColor="#71717A"
              multiline
              textAlignVertical="top"
              value={experience}
              onChangeText={setExperience}
            />
          </View>

          {/* 스터디장에게 질문 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>스터디장에게 질문 (선택)</Text>
            <TextInput
              style={[styles.textInput, styles.textInputSmall]}
              placeholder="궁금한 점이 있다면 질문해주세요"
              placeholderTextColor="#71717A"
              multiline
              textAlignVertical="top"
              value={question}
              onChangeText={setQuestion}
            />
          </View>

          {/* Agreement Section */}
          <View style={styles.agreeSection}>
            <View style={styles.agreeRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeRules(!agreeRules)}
              >
                <View style={[styles.checkbox, agreeRules && styles.checkboxChecked]}>
                  {agreeRules && <Feather name="check" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.agreeText, agreeRules && styles.agreeTextChecked]}>
                  스터디 규칙에 동의합니다
                </Text>
              </TouchableOpacity>
              {rules.length > 0 && (
                <TouchableOpacity onPress={() => setShowRulesModal(true)}>
                  <Text style={styles.detailLink}>자세히보기</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.agreeRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeDeposit(!agreeDeposit)}
              >
                <View style={[styles.checkbox, agreeDeposit && styles.checkboxChecked]}>
                  {agreeDeposit && <Feather name="check" size={14} color="#FFFFFF" />}
                </View>
                <Text style={[styles.agreeText, agreeDeposit && styles.agreeTextChecked]}>
                  보증금 환불 정책에 동의합니다
                </Text>
              </TouchableOpacity>
              {depositRefundPolicy && (
                <TouchableOpacity onPress={() => setShowPolicyModal(true)}>
                  <Text style={styles.detailLink}>자세히보기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Spacer for bottom bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(20, insets.bottom) }]}>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !canSubmit}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="send" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>가입 신청하기</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Rules Modal */}
      <Modal
        visible={showRulesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRulesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>스터디 규칙</Text>
              <TouchableOpacity onPress={() => setShowRulesModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {rules.map((rule, idx) => (
                <Text key={idx} style={styles.ruleText}>• {rule.content}</Text>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Policy Modal */}
      <Modal
        visible={showPolicyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPolicyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>보증금 환불 정책</Text>
              <TouchableOpacity onPress={() => setShowPolicyModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.policyText}>{depositRefundPolicy || '환불 정책이 설정되지 않았습니다.'}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
