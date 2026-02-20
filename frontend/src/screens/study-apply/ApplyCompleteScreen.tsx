import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { styles } from './completeStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ApplyCompleteRouteProp = RouteProp<RootStackParamList, 'ApplyComplete'>;

export default function ApplyCompleteScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ApplyCompleteRouteProp>();
  const { studyTitle } = route.params;

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleClose = () => {
    navigation.goBack();
    navigation.goBack(); // Go back twice to skip apply form
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#18181B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerCloseBtn} onPress={handleClose}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>신청 완료</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Feather name="check" size={48} color="#22C55E" />
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.successTitle}>가입 신청이 완료되었습니다!</Text>
          <Text style={styles.successSubtitle}>
            스터디장이 신청서를 확인 후{'\n'}승인 여부를 알려드릴게요
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>신청 상태</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>승인 대기중</Text>
            </View>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusInfoText}>📅 신청일: {formattedDate}</Text>
            <Text style={styles.statusInfoText}>⏰ 예상 응답: 1~3일 이내</Text>
          </View>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome}>
          <Text style={styles.homeBtnText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
