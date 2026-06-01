import { callAnthropicMessages } from './_anthropic.js';
import { DEFAULT_MODEL } from './_prompt-data.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caption, category, image, imageType } = req.body;

    if (!caption && !image) {
      return res.status(400).json({ error: 'caption or image required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not set' });
    }

    // 카테고리별 해시태그 팁
    const categoryTags = {
      '음식점': ['맛있는', '맛집', '음식', '한식', '가정식', '대박'],
      '카페': ['카페', '커피', '음료', '디저트', '감성', '휴식'],
      '공예': ['공예', '핸드메이드', '예술', '창작', '수작업', '재활용'],
      '패션': ['패션', '스타일', '의류', '코디', '트렌드', '룩'],
      '뷰티': ['뷰티', '화장품', '스킨케어', '메이크업', '아름다움', '피부'],
      '여행': ['여행', '여유', '풍경', '기억', '감동', '추천']
    };

    const tags = categoryTags[category] || ['추천', '감성', '일상', '공유'];

    // 메시지 구성
    let messages = [];

    if (image) {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageType || 'image/jpeg',
              data: image
            }
          },
          {
            type: 'text',
            text: `이 이미지를 보고 인스타그램 해시태그를 생성해주세요.

카테고리: ${category || '일반'}
기본 해시태그: ${tags.join(', ')}
캡션: ${caption || '(캡션 없음)'}

요구사항:
- 해시태그 개수: 10개
- 형식: 각 줄에 하나씩 (예: #태그1)
- 인기도 고려: 인기 있는 태그 5개 + 틈새 태그 5개 혼합
- 한국어만 사용

응답 형식:
#태그1
#태그2
...
#태그10`
          }
        ]
      }];
    } else {
      messages = [{
        role: 'user',
        content: `인스타그램 해시태그를 생성해주세요.

카테고리: ${category || '일반'}
기본 해시태그: ${tags.join(', ')}
캡션: ${caption}

요구사항:
- 해시태그 개수: 10개
- 형식: 각 줄에 하나씩 (예: #태그1)
- 인기도 고려: 인기 있는 태그 5개 + 틈새 태그 5개 혼합
- 한국어만 사용
- 캡션과 관련된 태그 포함

응답 형식:
#태그1
#태그2
...
#태그10`
      }];
    }

    const { response, data } = await callAnthropicMessages(apiKey, {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 200,
        messages: messages
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'API failed'
      });
    }

    if (!data.content || !data.content[0]) {
      return res.status(500).json({
        error: 'Invalid API response'
      });
    }

    // 해시태그 파싱
    const text = data.content[0].text;
    const hashtags = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('#') && line.length > 1)
      .slice(0, 10);

    return res.status(200).json({
      hashtags: hashtags.length > 0 ? hashtags : ['#추천', '#감성', '#일상', '#공유', '#감사', '#행복', '#함께', '#좋아', '#아름다움', '#특별']
    });

  } catch (error) {
    console.error('Hashtag API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
