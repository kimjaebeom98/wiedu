import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { clearTokens } from '../storage/token';

interface HomeScreenProps {
  navigation: any;
  route: any;
}

// Category data
const CATEGORIES = [
  { id: 1, name: 'IT/개발', icon: '💻', color: '#8B5CF6' },
  { id: 2, name: '외국어', icon: '🌏', color: '#EC4899' },
  { id: 3, name: '자격증', icon: '📜', color: '#14B8A6' },
  { id: 4, name: '재테크', icon: '📈', color: '#F59E0B' },
  { id: 5, name: '운동', icon: '💪', color: '#EF4444' },
  { id: 6, name: '취미', icon: '🎨', color: '#3B82F6' },
  { id: 7, name: '독서', icon: '📚', color: '#22C55E' },
  { id: 8, name: '더보기', icon: '•••', color: '#71717A' },
];

// Member data
const MEMBERS = [
  { id: 1, name: '민수', badge: '🏆', badgeColor: '#F59E0B' },
  { id: 2, name: '지영', badge: '♥', badgeColor: '#EC4899' },
  { id: 3, name: '현우', badge: '⭐', badgeColor: '#3B82F6' },
  { id: 4, name: '서연', badge: '⚡', badgeColor: '#22C55E' },
];

// Study data
const STUDIES = [
  {
    id: 1,
    title: '주니어 개발자 코드리뷰 스터디',
    category: 'IT/개발',
    categoryColor: '#8B5CF6',
    schedule: '매주 토요일 오후 2시 · 강남역',
    members: '8/12명',
    status: '활발한 활동',
    statusColor: '#22C55E',
  },
  {
    id: 2,
    title: '영어 스피킹 프리토킹 모임',
    category: '외국어',
    categoryColor: '#22C55E',
    schedule: '매주 일요일 오전 11시 · 홍대입구',
    members: '5/8명',
    status: '신규 모집',
    statusColor: '#8B5CF6',
  },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const handleLogout = async () => {
    await clearTokens();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Row - Location & Search */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.locationBtn}>
            <Text style={styles.locationText}>강남구</Text>
            <Text style={styles.locationIcon}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchText}>어떤 스터디를 찾고 계세요?</Text>
          </TouchableOpacity>
        </View>

        {/* Category Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryRow}>
            {CATEGORIES.slice(0, 4).map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.categoryRow}>
            {CATEGORIES.slice(4, 8).map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>근처 활동중인 멤버</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.membersRow}>
            {MEMBERS.map((member) => (
              <TouchableOpacity key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <View
                    style={[
                      styles.memberBadge,
                      { backgroundColor: member.badgeColor },
                    ]}
                  >
                    <Text style={styles.memberBadgeIcon}>{member.badge}</Text>
                  </View>
                </View>
                <Text style={styles.memberName}>{member.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Studies Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>인기 스터디</Text>
            <TouchableOpacity>
              <Text style={styles.sectionMore}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {STUDIES.map((study) => (
            <TouchableOpacity key={study.id} style={styles.studyCard}>
              <View style={styles.studyTop}>
                <View style={styles.studyInfo}>
                  <View
                    style={[
                      styles.studyTag,
                      { backgroundColor: study.categoryColor },
                    ]}
                  >
                    <Text style={styles.studyTagText}>{study.category}</Text>
                  </View>
                  <Text style={styles.studyTitle}>{study.title}</Text>
                  <Text style={styles.studySchedule}>{study.schedule}</Text>
                </View>
                <View style={styles.studyMembers}>
                  <View style={styles.memberDot} />
                  <View style={[styles.memberDot, { marginLeft: -8 }]} />
                  <View style={[styles.memberDot, { marginLeft: -8 }]} />
                </View>
              </View>
              <View style={styles.studyBottom}>
                <View style={styles.studyMeta}>
                  <Text style={styles.studyMetaIcon}>👥</Text>
                  <Text style={styles.studyMetaText}>{study.members}</Text>
                </View>
                <View style={styles.studyMeta}>
                  <Text style={[styles.studyMetaIcon, { color: study.statusColor }]}>
                    {study.status === '활발한 활동' ? '🔥' : '✨'}
                  </Text>
                  <Text style={[styles.studyMetaText, { color: study.statusColor }]}>
                    {study.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Logout Button (temporary) */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🧭</Text>
          <Text style={styles.navText}>탐색</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navAddBtn}>
          <Text style={styles.navAddIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navText}>채팅</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>마이</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationIcon: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchText: {
    fontSize: 14,
    color: '#71717A',
  },
  categorySection: {
    marginTop: 24,
    gap: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    flex: 1,
    backgroundColor: '#27272A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  categoryCircle: {
    width: 44,
    height: 44,
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E4E4E7',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionMore: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  membersRow: {
    flexDirection: 'row',
    gap: 20,
  },
  memberItem: {
    alignItems: 'center',
    gap: 8,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    backgroundColor: '#3F3F46',
    borderRadius: 26,
    position: 'relative',
  },
  memberBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberBadgeIcon: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  studyCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  studyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studyInfo: {
    flex: 1,
    gap: 6,
  },
  studyTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  studyTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  studySchedule: {
    fontSize: 13,
    color: '#71717A',
  },
  studyMembers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDot: {
    width: 28,
    height: 28,
    backgroundColor: '#52525B',
    borderRadius: 14,
  },
  studyBottom: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  studyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  studyMetaIcon: {
    fontSize: 14,
  },
  studyMetaText: {
    fontSize: 13,
    color: '#71717A',
  },
  logoutBtn: {
    marginTop: 20,
    marginBottom: 100,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#18181B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  navItem: {
    width: 64,
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 24,
  },
  navIconActive: {
    fontSize: 24,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#71717A',
  },
  navTextActive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  navAddBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -10,
  },
  navAddIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
