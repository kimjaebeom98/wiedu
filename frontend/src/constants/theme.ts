/**
 * Wiedu 앱 테마 상수
 * 모든 색상, 간격, 폰트 크기 등을 중앙 관리
 */

// 색상 팔레트
export const colors = {
  // 배경색
  background: '#18181B',
  surface: '#27272A',
  surfaceLight: '#3F3F46',

  // 브랜드 색상
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',

  // 상태 색상
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // 텍스트 색상
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textDark: '#52525B',

  // 보더
  border: '#3F3F46',
  borderLight: '#52525B',

  // 특수 색상
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
} as const;

// 간격
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// 폰트 크기
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
} as const;

// 폰트 굵기
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// 둥글기
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

// 그림자 (Android용 elevation)
export const elevation = {
  sm: 2,
  md: 4,
  lg: 8,
} as const;

// 아이콘 크기
export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

// 버튼 높이
export const buttonHeight = {
  sm: 36,
  md: 48,
  lg: 56,
} as const;

// 입력 필드 높이
export const inputHeight = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

// 공통 스타일 믹스인
export const commonStyles = {
  // 카드 스타일
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },

  // 헤더 스타일
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },

  // 화면 컨테이너
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // 콘텐츠 패딩
  contentPadding: {
    paddingHorizontal: spacing.xxl,
  },

  // 섹션 타이틀
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  // 중앙 정렬
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // 행 정렬
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // 공간 사이
  spaceBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
} as const;

// 전체 테마 객체
const theme = {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  elevation,
  iconSize,
  buttonHeight,
  inputHeight,
  commonStyles,
};

export default theme;
