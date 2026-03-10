import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { CustomAlert, AlertButton } from '../../components/common';
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
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    icon?: 'alert-circle' | 'check-circle' | 'x-circle' | 'info' | 'send';
    buttons?: AlertButton[];
  }>({ title: '' });

  const showAlert = (config: typeof alertConfig) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  // 보증금이 없거나 환불정책이 없으면 자동 동의 처리
  const hasDepositPolicy = !!depositRefundPolicy;
  const canSubmit = introduction.trim() && motivation.trim() && agreeRules && (hasDepositPolicy ? agreeDeposit : true);

  const handleSubmit = async () => {
    if (!canSubmit) {
      showAlert({ title: '알림', message: '필수 항목을 모두 입력하고 동의해주세요.', icon: 'alert-circle' });
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
      showAlert({ title: '오류', message: errorMessage, icon: 'x-circle' });
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
            {/* 보증금 환불정책이 있을 때만 표시 */}
            {hasDepositPolicy && (
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
                <TouchableOpacity onPress={() => setShowPolicyModal(true)}>
                  <Text style={styles.detailLink}>자세히보기</Text>
                </TouchableOpacity>
              </View>
            )}
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
        <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>스터디 규칙</Text>
              <TouchableOpacity onPress={() => setShowRulesModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleCard}>
                  <View style={styles.ruleNumber}>
                    <Text style={styles.ruleNumberText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.ruleCardText}>{rule.content}</Text>
                </View>
              ))}
              <View style={styles.ruleNotice}>
                <Feather name="alert-circle" size={16} color="#F59E0B" />
                <Text style={styles.ruleNoticeText}>
                  규칙 미준수 시 스터디장의 판단에 따라 제명될 수 있습니다
                </Text>
              </View>
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
        <View style={[styles.modalOverlay, { paddingBottom: insets.bottom }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>보증금 환불 정책</Text>
              <TouchableOpacity onPress={() => setShowPolicyModal(false)}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.policyCard}>
                <View style={styles.policyIcon}>
                  <Feather name="dollar-sign" size={20} color="#22C55E" />
                </View>
                <Text style={styles.policyText}>{depositRefundPolicy || '환불 정책이 설정되지 않았습니다.'}</Text>
              </View>
              <View style={styles.policyNotice}>
                <Feather name="info" size={16} color="#8B5CF6" />
                <Text style={styles.policyNoticeText}>
                  환불 조건은 스터디장이 정한 기준에 따릅니다
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
