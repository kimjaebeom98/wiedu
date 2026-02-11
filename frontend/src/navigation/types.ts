export type RootStackParamList = {
  Splash: undefined;
  Onboarding: { userId?: number };
  Login: undefined;
  EmailLogin: undefined;
  Signup: undefined;
  EmailVerify: { email: string; password: string };
  Home: { email?: string } | undefined;
};
