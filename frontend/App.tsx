import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import EmailLoginScreen from './src/screens/EmailLoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import EmailVerifyScreen from './src/screens/EmailVerifyScreen';
import OnboardingScreen from './src/screens/onboarding';
import HomeScreen from './src/screens/HomeScreen';
import StudyCreateScreen from './src/screens/study-create';
import StudyDetailScreen from './src/screens/study-detail';
import StudyApplyScreen from './src/screens/study-apply/StudyApplyScreen';
import ApplyCompleteScreen from './src/screens/study-apply/ApplyCompleteScreen';
import BoardPostDetailScreen from './src/screens/study-board/BoardPostDetailScreen';
import BoardPostCreateScreen from './src/screens/study-board/BoardPostCreateScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import StudyLeaderScreen from './src/screens/StudyLeaderScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LocationSearchScreenBase, { LocationData } from './src/screens/LocationSearchScreen';
import RegionPickerScreen from './src/screens/RegionPickerScreen';
import ReviewWriteScreen from './src/screens/ReviewWriteScreen';
import MemberReviewScreen from './src/screens/MemberReviewScreen';
import ApplicantManagementScreen from './src/screens/applicant-management/ApplicantManagementScreen';
import StudyMembersScreen from './src/screens/StudyMembersScreen';
import { getAccessToken } from './src/storage/token';
import { getMyProfile } from './src/api/profile';
import { RootStackParamList } from './src/navigation/types';

type LocationSearchRouteProp = RouteProp<RootStackParamList, 'LocationSearch'>;

function LocationSearchScreen() {
  const navigation = useNavigation();
  const route = useRoute<LocationSearchRouteProp>();
  const { onSelect } = route.params || {};

  const handleSelect = (location: LocationData) => {
    if (onSelect) {
      onSelect({
        address: location.address,
        addressDetail: location.name,
        latitude: location.latitude ?? 0,
        longitude: location.longitude ?? 0,
      });
    }
    navigation.goBack();
  };

  return (
    <LocationSearchScreenBase
      onSelect={handleSelect}
      onBack={() => navigation.goBack()}
    />
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        setIsAuthenticated(true);
        // 토큰이 있으면 온보딩 완료 상태도 확인
        try {
          const profile = await getMyProfile();
          setOnboardingCompleted(profile.onboardingCompleted);
        } catch (profileError) {
          console.error('Failed to get profile:', profileError);
          // 프로필 조회 실패 시 온보딩 완료로 간주 (기존 사용자 호환)
          setOnboardingCompleted(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to check authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen
  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  // Still checking auth after splash
  if (isCheckingAuth) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? (onboardingCompleted ? 'Home' : 'Onboarding') : 'Login'}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#18181B' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="StudyCreate" component={StudyCreateScreen} />
          <Stack.Screen name="StudyDetail" component={StudyDetailScreen} />
          <Stack.Screen name="StudyApply" component={StudyApplyScreen} />
          <Stack.Screen name="ApplyComplete" component={ApplyCompleteScreen} />
          <Stack.Screen name="BoardPostDetail" component={BoardPostDetailScreen} />
          <Stack.Screen name="BoardPostCreate" component={BoardPostCreateScreen} />
          <Stack.Screen name="MyPage" component={MyPageScreen} />
          <Stack.Screen name="StudyLeader" component={StudyLeaderScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
          <Stack.Screen name="RegionPicker" component={RegionPickerScreen} />
          <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
          <Stack.Screen name="MemberReview" component={MemberReviewScreen} />
          <Stack.Screen name="ApplicantManagement" component={ApplicantManagementScreen} />
          <Stack.Screen name="StudyMembers" component={StudyMembersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
});
