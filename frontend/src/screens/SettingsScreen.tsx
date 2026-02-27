import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import {
  getNotificationSettings,
  updateNotificationSettings,
  withdrawAccount,
} from '../api/settings';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [studyEnabled, setStudyEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const settings = await getNotificationSettings();
      setPushEnabled(settings.push);
      setChatEnabled(settings.chat);
      setStudyEnabled(settings.study);
    } catch (error) {
      Alert.alert('오류', '알림 설정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (
    key: 'push' | 'chat' | 'study',
    value: boolean
  ) => {
    const prev = { push: pushEnabled, chat: chatEnabled, study: studyEnabled };
    const next = { ...prev, [key]: value };

    // Optimistic update
    if (key === 'push') setPushEnabled(value);
    if (key === 'chat') setChatEnabled(value);
    if (key === 'study') setStudyEnabled(value);

    try {
      setUpdating(true);
      await updateNotificationSettings(next);
    } catch (error) {
      // Revert on failure
      if (key === 'push') setPushEnabled(prev.push);
      if (key === 'chat') setChatEnabled(prev.chat);
      if (key === 'study') setStudyEnabled(prev.study);
      Alert.alert('오류', '알림 설정을 변경하지 못했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말로 탈퇴하시겠어요? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              await withdrawAccount();
              await handleLogout();
            } catch (error) {
              Alert.alert('오류', '회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 계정 섹션 */}
          <Text style={styles.sectionLabel}>계정</Text>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('ProfileEdit')}
              activeOpacity={0.7}
            >
              <Text style={styles.rowText}>프로필 편집</Text>
              <Feather name="chevron-right" size={20} color="#71717A" />
            </TouchableOpacity>
          </View>

          {/* 알림 섹션 */}
          <Text style={styles.sectionLabel}>알림</Text>
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.rowText}>푸시 알림</Text>
              <Switch
                value={pushEnabled}
                onValueChange={(val) => handleToggle('push', val)}
                trackColor={{ false: '#27272A', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#27272A"
                disabled={updating}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowText}>채팅 알림</Text>
              <Switch
                value={chatEnabled}
                onValueChange={(val) => handleToggle('chat', val)}
                trackColor={{ false: '#27272A', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#27272A"
                disabled={updating}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowText}>스터디 알림</Text>
              <Switch
                value={studyEnabled}
                onValueChange={(val) => handleToggle('study', val)}
                trackColor={{ false: '#27272A', true: '#8B5CF6' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#27272A"
                disabled={updating}
              />
            </View>
          </View>

          {/* 정보 섹션 */}
          <Text style={styles.sectionLabel}>정보</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowText}>이용약관</Text>
              <Feather name="chevron-right" size={20} color="#71717A" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <Text style={styles.rowText}>개인정보처리방침</Text>
              <Feather name="chevron-right" size={20} color="#71717A" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowText}>버전 정보</Text>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
          </View>

          {/* 회원 탈퇴 */}
          <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw} activeOpacity={0.7}>
            <Text style={styles.withdrawText}>회원 탈퇴</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#3F3F46',
    marginHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#71717A',
  },
  withdrawBtn: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 14,
  },
  withdrawText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  bottomSpacer: {
    height: 60,
  },
});
