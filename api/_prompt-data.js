export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export const CATEGORY_BACKDATA = {
  '공예': {
    audience: '취미를 찾는 동네 고객, 손작업 선물을 찾는 고객, 원데이 클래스를 찾는 초보자',
    pains: ['무엇을 만들 수 있는지 바로 알고 싶어함', '가격과 수업 난이도를 궁금해함', '작업실 분위기를 중요하게 봄'],
    trustSignals: ['직접 만든 결과물', '수강생 후기', '작업 과정', '예약 가능 시간', '초보자도 가능하다는 안내'],
    words: ['정성', '손끝', '원데이 클래스', '선물', '작업실', '예약', '초보자 환영'],
    avoid: ['과장된 명품 느낌', '전문가만 가능한 어려운 표현', '가격을 숨기는 듯한 문장'],
  },
  '음식점': {
    audience: '근처에서 오늘 먹을 곳을 찾는 고객, 가족/직장 동료와 방문할 고객, 재방문 단골',
    pains: ['오늘 메뉴가 뭔지 빠르게 알고 싶어함', '주차/대기/영업시간을 궁금해함', '음식 사진과 실제 양을 중요하게 봄'],
    trustSignals: ['대표 메뉴', '재료 신선도', '영업시간', '포장/예약 가능 여부', '단골 후기'],
    words: ['오늘의 메뉴', '든든하게', '정성껏', '포장 가능', '예약 문의', '따뜻한 한 끼'],
    avoid: ['맛을 과도하게 단정하는 표현', '의학적 효능 표현', '실제와 다른 할인 문구'],
  },
  '카페': {
    audience: '근처 카페를 찾는 고객, 조용한 공간을 찾는 고객, 디저트/신메뉴에 반응하는 고객',
    pains: ['분위기와 좌석 정보를 궁금해함', '신메뉴와 디저트 구성을 보고 싶어함', '사진 찍기 좋은지 확인하고 싶어함'],
    trustSignals: ['시그니처 메뉴', '디저트 라인업', '공간 분위기', '영업시간', '테이크아웃 가능 여부'],
    words: ['오늘의 커피', '잠깐 쉬어가기', '디저트', '신메뉴', '아늑한', '테이크아웃'],
    avoid: ['너무 추상적인 감성 문장만 반복', '메뉴명 없는 홍보', '좌석/이용 정보 누락'],
  },
  '뷰티': {
    audience: '근처 관리샵을 찾는 고객, 첫 방문이 조심스러운 고객, 가격/예약 가능 여부를 확인하는 고객',
    pains: ['위생과 전문성을 확인하고 싶어함', '시술 시간이 궁금함', '첫 방문 혜택과 상담 가능 여부를 봄'],
    trustSignals: ['상담 가능', '예약제', '전후 관리 안내', '위생 관리', '고객 후기'],
    words: ['상담', '예약제', '관리', '편안하게', '첫 방문', '꼼꼼하게'],
    avoid: ['의학적 치료 표현', '효과 보장', '불안감을 자극하는 표현'],
  },
  '학원': {
    audience: '자녀 학원을 찾는 학부모, 성인 취미/자격증 수강생, 시험 대비가 필요한 학생',
    pains: ['수업 방식과 난이도를 알고 싶어함', '시간표와 상담 가능 여부를 확인함', '성과와 후기를 중요하게 봄'],
    trustSignals: ['수업 커리큘럼', '상담 가능', '시간표', '학습 후기', '개별 피드백'],
    words: ['상담', '커리큘럼', '개별 지도', '기초부터', '수업 안내', '모집'],
    avoid: ['성적 보장', '불안 마케팅', '과도한 경쟁 자극'],
  },
  '운동/건강': {
    audience: '운동을 시작하려는 초보자, 가까운 센터를 찾는 고객, 꾸준한 관리를 원하는 고객',
    pains: ['초보자도 가능한지 걱정함', '가격/시간/준비물을 궁금해함', '분위기가 부담스럽지 않은지 확인함'],
    trustSignals: ['초보자 환영', '체험 수업', '예약 가능', '운동 루틴 안내', '회원 후기'],
    words: ['체험', '초보자 환영', '꾸준히', '가볍게 시작', '예약', '루틴'],
    avoid: ['의학적 효능 표현', '체형 비하', '무리한 변화 보장'],
  },
  '기타': {
    audience: '동네에서 필요한 서비스를 찾는 고객, 첫 방문 전에 신뢰를 확인하려는 고객',
    pains: ['무엇을 제공하는지 빠르게 알고 싶어함', '가격/예약/문의 방법을 알고 싶어함'],
    trustSignals: ['대표 서비스', '운영 시간', '문의 방법', '고객 후기', '첫 방문 안내'],
    words: ['안내', '예약', '문의', '오늘의 소식', '처음 오시는 분도 편하게'],
    avoid: ['과장 표현', '구체 정보 없는 감성 문장'],
  },
};

export const TONE_BACKDATA = {
  '감성적': {
    direction: '따뜻한 장면과 감정을 먼저 보여주되, 마지막에는 방문/문의 행동으로 자연스럽게 연결',
    sentence: '짧은 문장과 여백을 섞어 읽기 쉽게 작성',
  },
  '정보형': {
    direction: '무엇을, 언제, 어디서, 어떻게 이용할 수 있는지를 분명하게 안내',
    sentence: '목록형 문장과 핵심 정보 위주로 작성',
  },
  '유머러스': {
    direction: '가벼운 농담은 허용하되 사장님 신뢰를 해치지 않는 선에서 친근하게 작성',
    sentence: '과한 밈보다 생활감 있는 표현을 사용',
  },
  '따뜻한': {
    direction: '처음 방문하는 고객도 부담 없이 문의할 수 있게 다정하고 안정적으로 작성',
    sentence: '존댓말과 쉬운 표현을 사용',
  },
  '트렌디한': {
    direction: '요즘 피드에 어울리는 짧은 후킹 문장과 깔끔한 해시태그 흐름으로 작성',
    sentence: '짧고 선명한 문장을 사용하되 과한 영어 남발은 피함',
  },
};

export const NAVER_PLACE_TYPES = {
  '소식': {
    goal: '네이버 플레이스 소식 탭에 올릴 공지/홍보 문안',
    structure: ['첫 줄: 고객이 바로 이해할 제목', '본문: 무엇이 준비됐는지 2~4문장', '마무리: 문의/예약/방문 안내'],
    length: '220~360자',
  },
  '쿠폰': {
    goal: '첫 방문 또는 재방문을 유도하는 쿠폰 안내 문안',
    structure: ['혜택 이름', '사용 조건', '사용 방법', '부담 없는 방문 안내'],
    length: '180~300자',
  },
  '리뷰답글': {
    goal: '고객 리뷰에 남길 사장님 답글',
    structure: ['감사 인사', '리뷰 내용에 대한 구체 반응', '다음 방문 기대 문장'],
    length: '120~220자',
  },
  '주간계획': {
    goal: '인스타그램과 네이버 플레이스를 함께 운영하는 주간 마케팅 계획',
    structure: ['월~일 또는 3~5개 액션', '각 액션의 채널', '복사해서 쓸 짧은 문안 방향'],
    length: '350~550자',
  },
  '프로필': {
    goal: '네이버 플레이스 소개/인스타 프로필에 넣을 매장 소개 문안',
    structure: ['한 줄 소개', '누구에게 좋은지', '대표 상품/서비스', '문의 안내'],
    length: '120~240자',
  },
};

export function normalizeCategory(category) {
  const key = String(category || '').replace(/[^\uAC00-\uD7A3a-zA-Z0-9/]/g, '').trim();
  return CATEGORY_BACKDATA[key] ? key : '기타';
}

export function getCategoryBackdata(category) {
  return CATEGORY_BACKDATA[normalizeCategory(category)];
}

export function getToneBackdata(tone) {
  return TONE_BACKDATA[tone] || TONE_BACKDATA['따뜻한'];
}

export function buildStoreContext(settings = {}) {
  const category = normalizeCategory(settings.category);
  const categoryData = getCategoryBackdata(category);
  return {
    storeName: settings.storeName || '우리 매장',
    category,
    region: settings.region || '',
    mainOffer: settings.mainOffer || '',
    brandTone: settings.brandTone || settings.tone || '따뜻한',
    targetCustomer: settings.targetCustomer || categoryData.audience,
    description: settings.description || '',
    categoryData,
  };
}
