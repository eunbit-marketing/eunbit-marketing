export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'type required' });
    }

    // 분석 타입별 처리
    switch (type) {
      case 'optimal-time':
        return handleOptimalTime(res, data);
      case 'engagement':
        return handleEngagement(res, data);
      case 'trending':
        return handleTrendingAnalysis(res, data);
      case 'recommendations':
        return handleRecommendations(res, data);
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};

function handleOptimalTime(res, data) {
  try {
    // 요일별, 시간대별 최적 발행 시간 제공
    const optimalTimes = {
      weekday: {
        morning: '10:00',    // 월-금 아침
        afternoon: '15:00',  // 월-금 오후
        evening: '18:00'     // 월-금 저녁
      },
      weekend: {
        morning: '09:00',    // 토-일 아침
        afternoon: '13:00',  // 토-일 오후
        evening: '20:00'     // 토-일 저녁
      }
    };

    const analysis = {
      recommended: {
        weekday: [optimalTimes.weekday.morning, optimalTimes.weekday.afternoon],
        weekend: [optimalTimes.weekend.morning, optimalTimes.weekend.evening]
      },
      reason: '팔로워의 활동성이 가장 높은 시간대입니다',
      tip: '일관된 시간에 게시물을 발행하면 알고리즘 추천이 증가합니다'
    };

    return res.status(200).json(analysis);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze optimal time' });
  }
}

function handleEngagement(res, data) {
  try {
    const { posts } = data || {};

    // 기본 참여도 계산
    const defaultEngagement = {
      avgLikes: 18450,
      avgComments: 1246,
      avgSaves: 345,
      engagementRate: 5.2,
      trend: 'up',
      trendPercentage: 12.5,
      topPost: {
        title: '특별한 순간',
        likes: 2500,
        comments: 150,
        saves: 280
      },
      insights: [
        '사진 품질이 좋을수록 참여도가 높습니다',
        '오후 3시 게시물이 가장 많은 상호작용을 받습니다',
        '하이라이트가 많은 게시물이 저장율이 높습니다'
      ]
    };

    return res.status(200).json(defaultEngagement);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze engagement' });
  }
}

function handleTrendingAnalysis(res, data) {
  try {
    // 현재 트렌드 분석 (시뮬레이션)
    const trendingAnalysis = {
      currentTrends: [
        { hashtag: '#일상', growthRate: 25, posts: 1500000 },
        { hashtag: '#감성', growthRate: 18, posts: 2300000 },
        { hashtag: '#공예', growthRate: 15, posts: 450000 },
        { hashtag: '#취미', growthRate: 12, posts: 800000 },
        { hashtag: '#핸드메이드', growthRate: 20, posts: 350000 }
      ],
      categoryTrends: {
        '음식점': ['맛집', '한식', '분위기', '음식사진'],
        '카페': ['감성카페', '신메뉴', '라떼아트', '디저트'],
        '공예': ['DIY', '재활용', '수작업', '창작'],
        '패션': ['트렌드', '코디', '계절', '스타일'],
        '뷰티': ['스킨케어', '메이크업팁', '제품추천', '기술'],
        '여행': ['감성여행', '숨은명소', '로컬', '계절여행']
      },
      recommendation: '지역 특화 해시태그를 활용하면 타게팅이 더 효과적입니다'
    };

    return res.status(200).json(trendingAnalysis);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze trends' });
  }
}

function handleRecommendations(res, data) {
  try {
    const { category, engagement, followers } = data || {};

    // 맞춤형 추천
    const recommendations = {
      content: [
        '주 3-4회 정기적인 게시물 발행으로 팔로워 참여 유도',
        '카로셀(여러 장의 사진) 게시물이 평균 25% 더 많은 참여도 획득',
        '스토리와 게시물을 번갈아 발행하여 피드 유지',
        '댓글 남기는 팔로워에게 빠르게 응답하여 커뮤니티 형성'
      ],
      hashtags: [
        '인기 해시태그 5개 + 틈새 해시태그 5개 조합',
        '지역 해시태그 활용으로 현지 고객 유입',
        '시즌별 트렌드 해시태그 수시로 업데이트'
      ],
      posting: [
        '평일 오전 10시, 오후 3시 게시 추천',
        '주말 오전 9시, 저녁 8시 게시 추천',
        '일관된 시간대 유지로 알고리즘 신뢰도 증가'
      ],
      engagement: [
        '첫 1시간 내 10개 이상 댓글 남기기',
        '다른 계정과 협업 게시물로 도달범위 확대',
        '팔로워 스토리에 자주 반응하기'
      ]
    };

    return res.status(200).json(recommendations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}
