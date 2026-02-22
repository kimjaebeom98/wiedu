import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { PostCategory, BoardPostCreateRequest, CATEGORY_LABELS } from '../../types/board';
import { createBoardPost } from '../../api/board';

type Props = NativeStackScreenProps<RootStackParamList, 'BoardPostCreate'>;

const TITLE_MAX_LENGTH = 100;

export default function BoardPostCreateScreen({ navigation, route }: Props) {
  const { studyId, isLeader = false } = route.params;

  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('CHAT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: PostCategory[] = isLeader
    ? ['NOTICE', 'CHAT', 'QNA']
    : ['CHAT', 'QNA'];

  const isFormValid = () => {
    return title.trim().length > 0 && content.trim().length > 0;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const requestData: BoardPostCreateRequest = {
        category: selectedCategory,
        title: title.trim(),
        content: content.trim(),
      };

      await createBoardPost(studyId, requestData);

      Alert.alert('성공', '게시글이 작성되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert(
        '오류',
        error.response?.data?.message || '게시글 작성에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={isSubmitting}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시글 작성</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (!isFormValid() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  (!isFormValid() || isSubmitting) && styles.submitButtonTextDisabled,
                ]}
              >
                등록
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Category Selector */}
          <View style={styles.categoryContainer}>
            <Text style={styles.label}>카테고리</Text>
            <View style={styles.categoryChips}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력하세요"
              placeholderTextColor="#52525B"
              value={title}
              onChangeText={(text) => {
                if (text.length <= TITLE_MAX_LENGTH) {
                  setTitle(text);
                }
              }}
              maxLength={TITLE_MAX_LENGTH}
              editable={!isSubmitting}
            />
            <Text style={styles.charCount}>
              {title.length}/{TITLE_MAX_LENGTH}
            </Text>
          </View>

          {/* Content Textarea */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요"
              placeholderTextColor="#52525B"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
            />
            <Text style={styles.charCount}>{content.length}자</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#3F3F46',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: '#71717A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#27272A',
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 24,
  },
  titleInput: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contentInput: {
    backgroundColor: '#27272A',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 200,
    marginBottom: 8,
  },
  charCount: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'right',
  },
});
