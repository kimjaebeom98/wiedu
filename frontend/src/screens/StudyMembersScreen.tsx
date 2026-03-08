import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { getStudyDetail } from '../api/study';
import { MemberInfo } from '../types/study';

type StudyMembersRouteProp = RouteProp<RootStackParamList, 'StudyMembers'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StudyMembersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<StudyMembersRouteProp>();
  const { studyId, studyTitle } = route.params;

  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const study = await getStudyDetail(studyId);
      setMembers(study.members || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const renderMember = ({ item }: { item: MemberInfo }) => {
    const isLeader = item.role === 'LEADER';

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberAvatarWrapper}>
          <View style={styles.memberAvatar}>
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
                style={styles.memberAvatarImg}
                resizeMode="cover"
              />
            ) : (
              <Feather name="user" size={28} color="#71717A" />
            )}
          </View>
          {isLeader && (
            <View style={styles.leaderBadgeOverlay}>
              <Feather name="star" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>{item.nickname}</Text>
            {isLeader && (
              <View style={styles.leaderTag}>
                <Text style={styles.leaderTagText}>스터디장</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>참여 멤버</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Study Title */}
      <View style={styles.studyTitleContainer}>
        <Text style={styles.studyTitle} numberOfLines={1}>
          {studyTitle}
        </Text>
        <Text style={styles.memberCount}>{members.length}명 참여 중</Text>
      </View>

      {/* Members List */}
      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMember}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color="#3F3F46" />
            <Text style={styles.emptyText}>아직 참여한 멤버가 없습니다</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  studyTitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  memberAvatarWrapper: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  memberAvatarImg: {
    width: 56,
    height: 56,
  },
  leaderBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#27272A',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#8B5CF620',
    borderRadius: 6,
  },
  leaderTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#71717A',
  },
});
