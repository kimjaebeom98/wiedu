import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
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
import { getAccessToken } from './src/storage/token';
import { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await getAccessToken();
      setIsAuthenticated(!!token);
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
          initialRouteName={isAuthenticated ? 'Home' : 'Login'}
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
