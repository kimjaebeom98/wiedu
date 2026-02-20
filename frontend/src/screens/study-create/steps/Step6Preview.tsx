import React from 'react';
import { View, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Step6Props } from '../types';
import { styles } from '../styles';
import {
  DAY_OPTIONS,
  STUDY_METHOD_OPTIONS,
  getWeeksFromDurationType,
} from '../constants';

function PreviewInfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.previewInfoItem}>
      <Feather name={icon as any} size={14} color="#8B5CF6" />
      <Text style={styles.previewInfoLabel}>{label}</Text>
      <Text style={styles.previewInfoValue}>{value}</Text>
    </View>
  );
}

export default function Step6Preview({ data, categories }: Step6Props) {
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
