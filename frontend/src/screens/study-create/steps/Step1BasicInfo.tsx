import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Step1Props } from '../types';
import { styles } from '../styles';

export default function Step1BasicInfo({
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
