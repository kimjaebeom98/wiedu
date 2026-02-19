import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Step5Props } from '../types';
import { styles } from '../styles';

export default function Step5Curriculum({
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
