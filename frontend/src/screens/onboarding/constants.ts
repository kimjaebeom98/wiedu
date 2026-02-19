// ─── Data Constants (design.pen) ─────────────────────────────────

export const TOTAL_STEPS = 7;

export const INTEREST_OPTIONS = [
  { key: 'LANGUAGE', label: '어학' },
  { key: 'CAREER', label: '취업/이직' },
  { key: 'IT_DEV', label: 'IT/개발' },
  { key: 'CERTIFICATION', label: '자격증' },
  { key: 'CIVIL_SERVICE', label: '공무원/고시' },
  { key: 'FINANCE', label: '재테크' },
  { key: 'DESIGN', label: '디자인' },
  { key: 'BUSINESS', label: '비즈니스' },
] as const;

// design.pen: "처음이에요" / "몇 번 해봤어요" / "꾸준히 하고 있어요"
export const EXPERIENCE_OPTIONS = [
  { key: 'BEGINNER', label: '처음이에요' },
  { key: 'INTERMEDIATE', label: '몇 번 해봤어요' },
  { key: 'EXPERIENCED', label: '꾸준히 하고 있어요' },
] as const;

// design.pen: 4개 옵션 with Lucide icons
export const STUDY_STYLE_OPTIONS = [
  { key: 'ONLINE', label: '온라인 스터디', icon: 'monitor' },
  { key: 'OFFLINE', label: '오프라인 스터디', icon: 'map-pin' },
  { key: 'PROJECT', label: '프로젝트형 스터디', icon: 'folder' },
  { key: 'MENTORING', label: '멘토링/레슨', icon: 'award' },
] as const;

export const REGION_OPTIONS = [
  '강남구', '서초구', '마포구', '성동구', '종로구',
  '용산구', '송파구', '영등포구', '관악구', '강동구',
  '노원구', '은평구', '동대문구', '광진구', '중구',
] as const;

export const STEP_INFO: Record<number, { title: string; subtitle: string }> = {
  1: { title: '서비스 이용약관에\n동의해주세요', subtitle: 'wiedu 서비스 이용을 위해 필요해요' },
  2: { title: '스터디 경험이\n어떻게 되시나요?', subtitle: '맞춤 스터디 추천을 위해 알려주세요' },
  3: { title: '어떤 분야에\n관심이 있으세요?', subtitle: '여러 개 선택 가능해요' },
  4: { title: '어떤 방식의 스터디를\n선호하시나요?', subtitle: '복수 선택 가능해요' },
  5: { title: '주로 어디서\n스터디 하시나요?', subtitle: '근처 스터디를 추천해 드릴게요' },
  6: { title: '프로필을 설정해주세요', subtitle: '다른 스터디원들에게 보여질 정보예요' },
  7: { title: '', subtitle: '' },
};
