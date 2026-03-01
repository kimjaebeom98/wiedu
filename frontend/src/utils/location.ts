/**
 * 위치 표시 포맷팅 유틸리티
 *
 * 규칙:
 * - 특별시/광역시: "서울특별시 중구", "부산광역시 해운대구"
 * - 일반 지역: 시/군만 표시 (예: "구미시", "칠곡군")
 */

// 특별시/광역시 목록
const SPECIAL_CITIES = [
  '서울특별시',
  '서울',
  '부산광역시',
  '부산',
  '대구광역시',
  '대구',
  '인천광역시',
  '인천',
  '광주광역시',
  '광주',
  '대전광역시',
  '대전',
  '울산광역시',
  '울산',
  '세종특별자치시',
  '세종',
];

/**
 * 특별시/광역시인지 확인
 */
export function isSpecialCity(region: string): boolean {
  return SPECIAL_CITIES.some(city => region.includes(city));
}

/**
 * 위치를 사용자 표시용으로 포맷팅
 *
 * @param region - 시/도 (예: "서울특별시", "경상북도")
 * @param city - 시/군/구 (예: "강남구", "구미시")
 * @param district - 동/읍/면 (예: "역삼동") - 사용하지 않음
 * @returns 포맷된 위치 문자열
 *
 * @example
 * formatLocationDisplay("서울특별시", "중구", "명동") // "서울특별시 중구"
 * formatLocationDisplay("경상북도", "구미시", "원평동") // "구미시"
 * formatLocationDisplay("경상북도", "칠곡군", "왜관읍") // "칠곡군"
 */
export function formatLocationDisplay(
  region?: string | null,
  city?: string | null,
  district?: string | null
): string {
  if (!region && !city) {
    return '';
  }

  // region만 있는 경우 (기존 데이터 호환)
  if (region && !city) {
    // 기존 형식의 주소 파싱 시도 (예: "서울특별시 강남구 역삼동")
    const parts = region.split(' ').filter(Boolean);

    if (parts.length >= 2) {
      const firstPart = parts[0];
      const secondPart = parts[1];

      if (isSpecialCity(firstPart)) {
        // 특별시/광역시: 시/도 + 구/군
        return `${firstPart} ${secondPart}`;
      } else {
        // 일반 지역: 시/군만
        return secondPart;
      }
    }

    return region;
  }

  // 구조화된 데이터가 있는 경우
  if (region && city) {
    if (isSpecialCity(region)) {
      // 특별시/광역시: 시/도 + 구
      return `${region} ${city}`;
    } else {
      // 일반 지역: 시/군만 표시
      return city;
    }
  }

  // city만 있는 경우
  if (city) {
    return city;
  }

  return '';
}

/**
 * 전체 주소에서 표시용 위치 추출
 *
 * @param fullAddress - 전체 주소 문자열
 * @returns 포맷된 위치 문자열
 *
 * @example
 * formatLocationFromAddress("서울특별시 강남구 역삼동 123-45") // "서울특별시 강남구"
 * formatLocationFromAddress("경상북도 구미시 원평동 456-78") // "구미시"
 */
export function formatLocationFromAddress(fullAddress?: string | null): string {
  if (!fullAddress) {
    return '';
  }

  const parts = fullAddress.split(' ').filter(Boolean);

  if (parts.length < 2) {
    return fullAddress;
  }

  const firstPart = parts[0];
  const secondPart = parts[1];

  if (isSpecialCity(firstPart)) {
    // 특별시/광역시: 시/도 + 구/군
    return `${firstPart} ${secondPart}`;
  } else {
    // 일반 지역 (경기도, 경상북도 등): 시/군만
    return secondPart;
  }
}
