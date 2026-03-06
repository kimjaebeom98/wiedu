// 한국 행정구역 데이터 (시/도 → 시/군/구)
// 각 지역의 중심 좌표 포함

export interface District {
  name: string;
  lat: number;
  lng: number;
}

export interface Province {
  name: string;
  districts: District[];
}

export const REGIONS: Province[] = [
  {
    name: '서울특별시',
    districts: [
      { name: '강남구', lat: 37.5172, lng: 127.0473 },
      { name: '강동구', lat: 37.5301, lng: 127.1238 },
      { name: '강북구', lat: 37.6396, lng: 127.0257 },
      { name: '강서구', lat: 37.5509, lng: 126.8495 },
      { name: '관악구', lat: 37.4784, lng: 126.9516 },
      { name: '광진구', lat: 37.5385, lng: 127.0823 },
      { name: '구로구', lat: 37.4954, lng: 126.8874 },
      { name: '금천구', lat: 37.4519, lng: 126.9020 },
      { name: '노원구', lat: 37.6542, lng: 127.0568 },
      { name: '도봉구', lat: 37.6688, lng: 127.0471 },
      { name: '동대문구', lat: 37.5744, lng: 127.0396 },
      { name: '동작구', lat: 37.5124, lng: 126.9393 },
      { name: '마포구', lat: 37.5663, lng: 126.9014 },
      { name: '서대문구', lat: 37.5791, lng: 126.9368 },
      { name: '서초구', lat: 37.4837, lng: 127.0324 },
      { name: '성동구', lat: 37.5633, lng: 127.0371 },
      { name: '성북구', lat: 37.5894, lng: 127.0167 },
      { name: '송파구', lat: 37.5145, lng: 127.1050 },
      { name: '양천구', lat: 37.5170, lng: 126.8667 },
      { name: '영등포구', lat: 37.5264, lng: 126.8963 },
      { name: '용산구', lat: 37.5324, lng: 126.9906 },
      { name: '은평구', lat: 37.6027, lng: 126.9291 },
      { name: '종로구', lat: 37.5735, lng: 126.9790 },
      { name: '중구', lat: 37.5641, lng: 126.9979 },
      { name: '중랑구', lat: 37.6063, lng: 127.0925 },
    ],
  },
  {
    name: '부산광역시',
    districts: [
      { name: '강서구', lat: 35.2122, lng: 128.9808 },
      { name: '금정구', lat: 35.2428, lng: 129.0922 },
      { name: '기장군', lat: 35.2445, lng: 129.2222 },
      { name: '남구', lat: 35.1366, lng: 129.0844 },
      { name: '동구', lat: 35.1294, lng: 129.0454 },
      { name: '동래구', lat: 35.1960, lng: 129.0857 },
      { name: '부산진구', lat: 35.1629, lng: 129.0531 },
      { name: '북구', lat: 35.1972, lng: 128.9903 },
      { name: '사상구', lat: 35.1526, lng: 128.9919 },
      { name: '사하구', lat: 35.1046, lng: 128.9747 },
      { name: '서구', lat: 35.0977, lng: 129.0241 },
      { name: '수영구', lat: 35.1455, lng: 129.1133 },
      { name: '연제구', lat: 35.1760, lng: 129.0799 },
      { name: '영도구', lat: 35.0912, lng: 129.0680 },
      { name: '중구', lat: 35.1064, lng: 129.0324 },
      { name: '해운대구', lat: 35.1631, lng: 129.1635 },
    ],
  },
  {
    name: '대구광역시',
    districts: [
      { name: '남구', lat: 35.8462, lng: 128.5975 },
      { name: '달서구', lat: 35.8299, lng: 128.5327 },
      { name: '달성군', lat: 35.7746, lng: 128.4314 },
      { name: '동구', lat: 35.8863, lng: 128.6357 },
      { name: '북구', lat: 35.8858, lng: 128.5828 },
      { name: '서구', lat: 35.8718, lng: 128.5592 },
      { name: '수성구', lat: 35.8584, lng: 128.6308 },
      { name: '중구', lat: 35.8694, lng: 128.6062 },
    ],
  },
  {
    name: '인천광역시',
    districts: [
      { name: '강화군', lat: 37.7467, lng: 126.4877 },
      { name: '계양구', lat: 37.5372, lng: 126.7376 },
      { name: '남동구', lat: 37.4488, lng: 126.7317 },
      { name: '동구', lat: 37.4737, lng: 126.6432 },
      { name: '미추홀구', lat: 37.4639, lng: 126.6503 },
      { name: '부평구', lat: 37.5076, lng: 126.7217 },
      { name: '서구', lat: 37.5457, lng: 126.6760 },
      { name: '연수구', lat: 37.4102, lng: 126.6783 },
      { name: '옹진군', lat: 37.4467, lng: 126.6364 },
      { name: '중구', lat: 37.4736, lng: 126.6217 },
    ],
  },
  {
    name: '광주광역시',
    districts: [
      { name: '광산구', lat: 35.1395, lng: 126.7937 },
      { name: '남구', lat: 35.1328, lng: 126.9025 },
      { name: '동구', lat: 35.1461, lng: 126.9234 },
      { name: '북구', lat: 35.1747, lng: 126.9120 },
      { name: '서구', lat: 35.1519, lng: 126.8895 },
    ],
  },
  {
    name: '대전광역시',
    districts: [
      { name: '대덕구', lat: 36.3469, lng: 127.4156 },
      { name: '동구', lat: 36.3121, lng: 127.4548 },
      { name: '서구', lat: 36.3551, lng: 127.3837 },
      { name: '유성구', lat: 36.3622, lng: 127.3561 },
      { name: '중구', lat: 36.3256, lng: 127.4212 },
    ],
  },
  {
    name: '울산광역시',
    districts: [
      { name: '남구', lat: 35.5440, lng: 129.3302 },
      { name: '동구', lat: 35.5050, lng: 129.4165 },
      { name: '북구', lat: 35.5822, lng: 129.3610 },
      { name: '울주군', lat: 35.5225, lng: 129.0996 },
      { name: '중구', lat: 35.5664, lng: 129.3328 },
    ],
  },
  {
    name: '세종특별자치시',
    districts: [
      { name: '세종시', lat: 36.4800, lng: 127.2890 },
    ],
  },
  {
    name: '경기도',
    districts: [
      { name: '가평군', lat: 37.8315, lng: 127.5095 },
      { name: '고양시 덕양구', lat: 37.6374, lng: 126.8320 },
      { name: '고양시 일산동구', lat: 37.6586, lng: 126.7748 },
      { name: '고양시 일산서구', lat: 37.6752, lng: 126.7517 },
      { name: '과천시', lat: 37.4292, lng: 126.9876 },
      { name: '광명시', lat: 37.4786, lng: 126.8644 },
      { name: '광주시', lat: 37.4295, lng: 127.2550 },
      { name: '구리시', lat: 37.5943, lng: 127.1295 },
      { name: '군포시', lat: 37.3616, lng: 126.9352 },
      { name: '김포시', lat: 37.6152, lng: 126.7156 },
      { name: '남양주시', lat: 37.6360, lng: 127.2165 },
      { name: '동두천시', lat: 37.9034, lng: 127.0606 },
      { name: '부천시', lat: 37.5034, lng: 126.7660 },
      { name: '성남시 분당구', lat: 37.3826, lng: 127.1189 },
      { name: '성남시 수정구', lat: 37.4503, lng: 127.1457 },
      { name: '성남시 중원구', lat: 37.4313, lng: 127.1372 },
      { name: '수원시 권선구', lat: 37.2577, lng: 127.0287 },
      { name: '수원시 영통구', lat: 37.2595, lng: 127.0466 },
      { name: '수원시 장안구', lat: 37.3038, lng: 127.0108 },
      { name: '수원시 팔달구', lat: 37.2851, lng: 127.0188 },
      { name: '시흥시', lat: 37.3800, lng: 126.8030 },
      { name: '안산시 단원구', lat: 37.3183, lng: 126.8387 },
      { name: '안산시 상록구', lat: 37.3008, lng: 126.8468 },
      { name: '안성시', lat: 37.0078, lng: 127.2797 },
      { name: '안양시 동안구', lat: 37.3943, lng: 126.9516 },
      { name: '안양시 만안구', lat: 37.3866, lng: 126.9322 },
      { name: '양주시', lat: 37.7853, lng: 127.0456 },
      { name: '양평군', lat: 37.4917, lng: 127.4875 },
      { name: '여주시', lat: 37.2983, lng: 127.6375 },
      { name: '연천군', lat: 38.0966, lng: 127.0748 },
      { name: '오산시', lat: 37.1498, lng: 127.0773 },
      { name: '용인시 기흥구', lat: 37.2804, lng: 127.1150 },
      { name: '용인시 수지구', lat: 37.3220, lng: 127.0975 },
      { name: '용인시 처인구', lat: 37.2341, lng: 127.2005 },
      { name: '의왕시', lat: 37.3448, lng: 126.9683 },
      { name: '의정부시', lat: 37.7381, lng: 127.0337 },
      { name: '이천시', lat: 37.2720, lng: 127.4348 },
      { name: '파주시', lat: 37.7600, lng: 126.7800 },
      { name: '평택시', lat: 36.9920, lng: 127.1127 },
      { name: '포천시', lat: 37.8948, lng: 127.2003 },
      { name: '하남시', lat: 37.5393, lng: 127.2148 },
      { name: '화성시', lat: 37.1996, lng: 126.8312 },
    ],
  },
  {
    name: '강원도',
    districts: [
      { name: '강릉시', lat: 37.7519, lng: 128.8761 },
      { name: '고성군', lat: 38.3800, lng: 128.4678 },
      { name: '동해시', lat: 37.5247, lng: 129.1143 },
      { name: '삼척시', lat: 37.4500, lng: 129.1650 },
      { name: '속초시', lat: 38.2070, lng: 128.5918 },
      { name: '양구군', lat: 38.1098, lng: 127.9898 },
      { name: '양양군', lat: 38.0754, lng: 128.6189 },
      { name: '영월군', lat: 37.1838, lng: 128.4619 },
      { name: '원주시', lat: 37.3422, lng: 127.9202 },
      { name: '인제군', lat: 38.0695, lng: 128.1706 },
      { name: '정선군', lat: 37.3807, lng: 128.6608 },
      { name: '철원군', lat: 38.1467, lng: 127.3133 },
      { name: '춘천시', lat: 37.8813, lng: 127.7300 },
      { name: '태백시', lat: 37.1640, lng: 128.9856 },
      { name: '평창군', lat: 37.3707, lng: 128.3904 },
      { name: '홍천군', lat: 37.6972, lng: 127.8884 },
      { name: '화천군', lat: 38.1062, lng: 127.7082 },
      { name: '횡성군', lat: 37.4914, lng: 127.9847 },
    ],
  },
  {
    name: '충청북도',
    districts: [
      { name: '괴산군', lat: 36.8154, lng: 127.7866 },
      { name: '단양군', lat: 36.9845, lng: 128.3655 },
      { name: '보은군', lat: 36.4893, lng: 127.7295 },
      { name: '영동군', lat: 36.1750, lng: 127.7833 },
      { name: '옥천군', lat: 36.3064, lng: 127.5713 },
      { name: '음성군', lat: 36.9401, lng: 127.6907 },
      { name: '제천시', lat: 37.1327, lng: 128.1910 },
      { name: '증평군', lat: 36.7854, lng: 127.5815 },
      { name: '진천군', lat: 36.8554, lng: 127.4358 },
      { name: '청주시 상당구', lat: 36.6335, lng: 127.4915 },
      { name: '청주시 서원구', lat: 36.6382, lng: 127.4696 },
      { name: '청주시 청원구', lat: 36.6967, lng: 127.4894 },
      { name: '청주시 흥덕구', lat: 36.6431, lng: 127.4313 },
      { name: '충주시', lat: 36.9911, lng: 127.9259 },
    ],
  },
  {
    name: '충청남도',
    districts: [
      { name: '계룡시', lat: 36.2745, lng: 127.2486 },
      { name: '공주시', lat: 36.4465, lng: 127.1190 },
      { name: '금산군', lat: 36.1087, lng: 127.4880 },
      { name: '논산시', lat: 36.1872, lng: 127.0987 },
      { name: '당진시', lat: 36.8898, lng: 126.6459 },
      { name: '보령시', lat: 36.3334, lng: 126.6129 },
      { name: '부여군', lat: 36.2758, lng: 126.9098 },
      { name: '서산시', lat: 36.7845, lng: 126.4503 },
      { name: '서천군', lat: 36.0803, lng: 126.6917 },
      { name: '아산시', lat: 36.7898, lng: 127.0018 },
      { name: '예산군', lat: 36.6827, lng: 126.8482 },
      { name: '천안시 동남구', lat: 36.8108, lng: 127.1479 },
      { name: '천안시 서북구', lat: 36.8670, lng: 127.1436 },
      { name: '청양군', lat: 36.4592, lng: 126.8023 },
      { name: '태안군', lat: 36.7456, lng: 126.2978 },
      { name: '홍성군', lat: 36.6011, lng: 126.6609 },
    ],
  },
  {
    name: '전라북도',
    districts: [
      { name: '고창군', lat: 35.4358, lng: 126.7020 },
      { name: '군산시', lat: 35.9676, lng: 126.7368 },
      { name: '김제시', lat: 35.8037, lng: 126.8808 },
      { name: '남원시', lat: 35.4165, lng: 127.3900 },
      { name: '무주군', lat: 36.0068, lng: 127.6608 },
      { name: '부안군', lat: 35.7316, lng: 126.7332 },
      { name: '순창군', lat: 35.3745, lng: 127.1373 },
      { name: '완주군', lat: 35.9044, lng: 127.1619 },
      { name: '익산시', lat: 35.9483, lng: 126.9577 },
      { name: '임실군', lat: 35.6179, lng: 127.2891 },
      { name: '장수군', lat: 35.6473, lng: 127.5212 },
      { name: '전주시 덕진구', lat: 35.8472, lng: 127.1088 },
      { name: '전주시 완산구', lat: 35.7912, lng: 127.1088 },
      { name: '정읍시', lat: 35.5699, lng: 126.8560 },
      { name: '진안군', lat: 35.7914, lng: 127.4246 },
    ],
  },
  {
    name: '전라남도',
    districts: [
      { name: '강진군', lat: 34.6419, lng: 126.7672 },
      { name: '고흥군', lat: 34.6047, lng: 127.2752 },
      { name: '곡성군', lat: 35.2820, lng: 127.2918 },
      { name: '광양시', lat: 34.9407, lng: 127.6956 },
      { name: '구례군', lat: 35.2026, lng: 127.4629 },
      { name: '나주시', lat: 35.0159, lng: 126.7108 },
      { name: '담양군', lat: 35.3213, lng: 126.9881 },
      { name: '목포시', lat: 34.8118, lng: 126.3922 },
      { name: '무안군', lat: 34.9905, lng: 126.4816 },
      { name: '보성군', lat: 34.7714, lng: 127.0799 },
      { name: '순천시', lat: 34.9506, lng: 127.4872 },
      { name: '신안군', lat: 34.8272, lng: 126.1070 },
      { name: '여수시', lat: 34.7604, lng: 127.6622 },
      { name: '영광군', lat: 35.2772, lng: 126.5120 },
      { name: '영암군', lat: 34.8001, lng: 126.6969 },
      { name: '완도군', lat: 34.3109, lng: 126.7550 },
      { name: '장성군', lat: 35.3018, lng: 126.7848 },
      { name: '장흥군', lat: 34.6815, lng: 126.9070 },
      { name: '진도군', lat: 34.4869, lng: 126.2636 },
      { name: '함평군', lat: 35.0659, lng: 126.5168 },
      { name: '해남군', lat: 34.5734, lng: 126.5990 },
      { name: '화순군', lat: 35.0644, lng: 126.9867 },
    ],
  },
  {
    name: '경상북도',
    districts: [
      { name: '경산시', lat: 35.8251, lng: 128.7414 },
      { name: '경주시', lat: 35.8562, lng: 129.2247 },
      { name: '고령군', lat: 35.7262, lng: 128.2628 },
      { name: '구미시', lat: 36.1195, lng: 128.3446 },
      { name: '군위군', lat: 36.2428, lng: 128.5728 },
      { name: '김천시', lat: 36.1398, lng: 128.1136 },
      { name: '문경시', lat: 36.5868, lng: 128.1867 },
      { name: '봉화군', lat: 36.8932, lng: 128.7324 },
      { name: '상주시', lat: 36.4109, lng: 128.1590 },
      { name: '성주군', lat: 35.9191, lng: 128.2830 },
      { name: '안동시', lat: 36.5684, lng: 128.7294 },
      { name: '영덕군', lat: 36.4153, lng: 129.3658 },
      { name: '영양군', lat: 36.6669, lng: 129.1124 },
      { name: '영주시', lat: 36.8057, lng: 128.6240 },
      { name: '영천시', lat: 35.9733, lng: 128.9385 },
      { name: '예천군', lat: 36.6577, lng: 128.4527 },
      { name: '울릉군', lat: 37.4845, lng: 130.9057 },
      { name: '울진군', lat: 36.9930, lng: 129.4003 },
      { name: '의성군', lat: 36.3526, lng: 128.6970 },
      { name: '청도군', lat: 35.6473, lng: 128.7340 },
      { name: '청송군', lat: 36.4361, lng: 129.0571 },
      { name: '칠곡군', lat: 35.9955, lng: 128.4017 },
      { name: '포항시 남구', lat: 35.9949, lng: 129.3595 },
      { name: '포항시 북구', lat: 36.0411, lng: 129.3594 },
    ],
  },
  {
    name: '경상남도',
    districts: [
      { name: '거제시', lat: 34.8806, lng: 128.6211 },
      { name: '거창군', lat: 35.6867, lng: 127.9094 },
      { name: '고성군', lat: 35.0594, lng: 128.3222 },
      { name: '김해시', lat: 35.2285, lng: 128.8894 },
      { name: '남해군', lat: 34.8374, lng: 127.8924 },
      { name: '밀양시', lat: 35.5037, lng: 128.7467 },
      { name: '사천시', lat: 35.0037, lng: 128.0642 },
      { name: '산청군', lat: 35.4155, lng: 127.8733 },
      { name: '양산시', lat: 35.3350, lng: 129.0373 },
      { name: '의령군', lat: 35.3221, lng: 128.2617 },
      { name: '진주시', lat: 35.1799, lng: 128.1076 },
      { name: '창녕군', lat: 35.5448, lng: 128.4914 },
      { name: '창원시 마산합포구', lat: 35.1984, lng: 128.5674 },
      { name: '창원시 마산회원구', lat: 35.2207, lng: 128.5822 },
      { name: '창원시 성산구', lat: 35.1983, lng: 128.6989 },
      { name: '창원시 의창구', lat: 35.2540, lng: 128.6401 },
      { name: '창원시 진해구', lat: 35.1335, lng: 128.7113 },
      { name: '통영시', lat: 34.8544, lng: 128.4330 },
      { name: '하동군', lat: 35.0674, lng: 127.7513 },
      { name: '함안군', lat: 35.2724, lng: 128.4065 },
      { name: '함양군', lat: 35.5205, lng: 127.7251 },
      { name: '합천군', lat: 35.5664, lng: 128.1658 },
    ],
  },
  {
    name: '제주특별자치도',
    districts: [
      { name: '제주시', lat: 33.4996, lng: 126.5312 },
      { name: '서귀포시', lat: 33.2541, lng: 126.5600 },
    ],
  },
];

// 시/도 목록만 가져오기
export const getProvinces = (): string[] => {
  return REGIONS.map(r => r.name);
};

// 특정 시/도의 시/군/구 목록 가져오기
export const getDistricts = (provinceName: string): District[] => {
  const province = REGIONS.find(r => r.name === provinceName);
  return province?.districts || [];
};

// 전체 주소로 좌표 찾기
export const getCoordinates = (provinceName: string, districtName: string): { lat: number; lng: number } | null => {
  const province = REGIONS.find(r => r.name === provinceName);
  if (!province) return null;

  const district = province.districts.find(d => d.name === districtName);
  if (!district) return null;

  return { lat: district.lat, lng: district.lng };
};

// 전체 지역 검색 (자동완성용)
export const searchRegions = (query: string): Array<{ province: string; district: string; lat: number; lng: number }> => {
  if (!query.trim()) return [];

  const results: Array<{ province: string; district: string; lat: number; lng: number }> = [];
  const lowerQuery = query.toLowerCase();

  for (const province of REGIONS) {
    for (const district of province.districts) {
      const fullName = `${province.name} ${district.name}`;
      if (fullName.toLowerCase().includes(lowerQuery) ||
          district.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          province: province.name,
          district: district.name,
          lat: district.lat,
          lng: district.lng,
        });
      }
    }
  }

  return results.slice(0, 20); // 최대 20개 결과
};
