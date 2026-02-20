import { StudyMethod, DurationType, StudyCreateData } from '../../types/study';

// ─── Data Constants ───────────────────────────────────────────────────────────

export const TOTAL_STEPS = 6;

export const DAY_OPTIONS = [
  { key: 'MON', label: '\uC6D4' },
  { key: 'TUE', label: '\uD654' },
  { key: 'WED', label: '\uC218' },
  { key: 'THU', label: '\uBAA9' },
  { key: 'FRI', label: '\uAE08' },
  { key: 'SAT', label: '\uD1A0' },
  { key: 'SUN', label: '\uC77C' },
] as const;

export const STUDY_METHOD_OPTIONS: { key: StudyMethod; label: string; icon: string }[] = [
  { key: 'ONLINE', label: '\uC628\uB77C\uC778', icon: 'monitor' },
  { key: 'OFFLINE', label: '\uC624\uD504\uB77C\uC778', icon: 'map-pin' },
  { key: 'HYBRID', label: '\uC628/\uC624\uD504\uB77C\uC778 \uBCD1\uD589', icon: 'refresh-cw' },
];

// Duration weeks mapping - exact 1:1 mapping for clear UX
export const WEEKS_TO_DURATION: Record<number, DurationType> = {
  1: 'ONE_WEEK',
  2: 'TWO_WEEKS',
  3: 'THREE_WEEKS',
  4: 'FOUR_WEEKS',
  5: 'FIVE_WEEKS',
  6: 'SIX_WEEKS',
  7: 'SIX_WEEKS',
  8: 'EIGHT_WEEKS',
  9: 'EIGHT_WEEKS',
  10: 'TEN_WEEKS',
  11: 'TEN_WEEKS',
  12: 'TWELVE_WEEKS',
  13: 'TWELVE_WEEKS',
  14: 'TWELVE_WEEKS',
  15: 'TWELVE_WEEKS',
  16: 'SIXTEEN_WEEKS',
  17: 'SIXTEEN_WEEKS',
  18: 'SIXTEEN_WEEKS',
  19: 'SIXTEEN_WEEKS',
  20: 'TWENTY_WEEKS',
  21: 'TWENTY_WEEKS',
  22: 'TWENTY_WEEKS',
  23: 'TWENTY_WEEKS',
  24: 'TWENTY_FOUR_WEEKS',
};

export const PLATFORM_OPTIONS = ['Zoom', 'Google Meet', 'Discord', 'Teams', '\uCE74\uCE74\uC624\uD1A1'];

export const STEP_INFO: Record<number, { title: string; subtitle: string }> = {
  1: { title: '\uC2A4\uD130\uB514 \uAE30\uBCF8 \uC815\uBCF4\uB97C\n\uC785\uB825\uD574\uC8FC\uC138\uC694', subtitle: '\uC2A4\uD130\uB514\uB97C \uC18C\uAC1C\uD560 \uD575\uC2EC \uC815\uBCF4\uC608\uC694' },
  2: { title: '\uC0C1\uC138 \uC124\uBA85\uC744\n\uC791\uC131\uD574\uC8FC\uC138\uC694', subtitle: '\uCC38\uC5EC\uC790\uB4E4\uC774 \uC2A4\uD130\uB514\uB97C \uC774\uD574\uD558\uB294 \uB370 \uB3C4\uC6C0\uB3FC\uC694' },
  3: { title: '\uC77C\uC815\uACFC \uBC29\uC2DD\uC744\n\uC124\uC815\uD574\uC8FC\uC138\uC694', subtitle: '\uC5B8\uC81C, \uC5B4\uB5BB\uAC8C \uC9C4\uD589\uD560\uC9C0 \uC54C\uB824\uC8FC\uC138\uC694' },
  4: { title: '\uBAA8\uC9D1 \uC870\uAC74\uC744\n\uC124\uC815\uD574\uC8FC\uC138\uC694', subtitle: '\uC778\uC6D0, \uBE44\uC6A9, \uC790\uACA9 \uC694\uAC74\uC744 \uC124\uC815\uD574\uC694' },
  5: { title: '\uCEE4\uB9AC\uD050\uB7FC\uACFC \uADDC\uCE59\uC744\n\uC791\uC131\uD574\uC8FC\uC138\uC694', subtitle: '\uC120\uD0DD \uC0AC\uD56D\uC774\uC9C0\uB9CC \uC2E0\uB8B0\uB97C \uB192\uC5EC\uC918\uC694' },
  6: { title: '\uC2A4\uD130\uB514\uB97C\n\uBBF8\uB9AC \uD655\uC778\uD574\uC8FC\uC138\uC694', subtitle: '\uB4F1\uB85D \uC804 \uCD5C\uC885 \uB0B4\uC6A9\uC744 \uD655\uC778\uD558\uC138\uC694' },
};

export const INITIAL_DATA: StudyCreateData = {
  title: '',
  categoryId: null,
  subcategoryId: null,
  coverImageUrl: '',
  tags: [],
  description: '',
  targetAudience: '',
  goals: '',
  studyMethod: null,
  daysOfWeek: [],
  time: '',
  durationType: null,
  platform: '',
  maxMembers: 6,
  participationFee: 0,
  deposit: 0,
  depositRefundPolicy: '',
  requirements: '',
  curriculums: [],
  rules: [],
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export const getDurationTypeFromWeeks = (weeks: number): DurationType | null => {
  if (weeks >= 25) return 'LONG_TERM';
  return WEEKS_TO_DURATION[weeks] || 'FOUR_WEEKS';
};

export const getWeeksFromDurationType = (type: DurationType | null): number => {
  switch (type) {
    case 'ONE_WEEK': return 1;
    case 'TWO_WEEKS': return 2;
    case 'THREE_WEEKS': return 3;
    case 'FOUR_WEEKS': return 4;
    case 'FIVE_WEEKS': return 5;
    case 'SIX_WEEKS': return 6;
    case 'EIGHT_WEEKS': return 8;
    case 'TEN_WEEKS': return 10;
    case 'TWELVE_WEEKS': return 12;
    case 'SIXTEEN_WEEKS': return 16;
    case 'TWENTY_WEEKS': return 20;
    case 'TWENTY_FOUR_WEEKS': return 24;
    case 'LONG_TERM': return 25;
    default: return 4;
  }
};
