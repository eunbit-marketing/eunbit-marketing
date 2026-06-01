import { callAnthropicMessages } from './_anthropic.js';
import { DEFAULT_MODEL, NAVER_PLACE_TYPES, buildStoreContext } from './_prompt-data.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      topic = '',
      type = '소식',
      storeName,
      category,
      region,
      mainOffer,
      targetCustomer,
      brandTone,
      description,
    } = req.body || {};

    if (!topic.trim()) return res.status(400).json({ error: 'topic required' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not set' });

    const context = buildStoreContext({
      storeName, category, region, mainOffer, targetCustomer, brandTone, description,
    });
    const typeGuide = NAVER_PLACE_TYPES[type] || NAVER_PLACE_TYPES['소식'];

    const { response, data, model } = await callAnthropicMessages(apiKey, {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: type === '주간계획' ? 1100 : 750,
        temperature: 0.68,
        system: buildNaverSystem(context),
        messages: [{
          role: 'user',
          content: buildNaverPrompt({ context, type, typeGuide, topic }),
        }],
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Naver Place API failed' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ text: text.trim(), model: data.model || model });
  } catch (error) {
    console.error('Naver Place API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

function buildNaverSystem(context) {
  const { categoryData } = context;
  return `당신은 Bloom의 네이버 플레이스 마케팅 작성 도우미입니다.

대상 사용자는 40~60대 소상공인 사장님입니다. 결과물은 사장님이 네이버 플레이스에 바로 복사해서 붙여넣을 수 있어야 합니다.

매장 백데이터:
- 매장명: ${context.storeName}
- 업종: ${context.category}
- 지역: ${context.region || '지역 미입력'}
- 대표 상품/서비스: ${context.mainOffer || '대표 상품 미입력'}
- 주요 고객: ${context.targetCustomer}
- 매장 설명: ${context.description || '설명 미입력'}
- 업종 고객 고민: ${categoryData.pains.join(' / ')}
- 신뢰 포인트: ${categoryData.trustSignals.join(' / ')}
- 권장 단어: ${categoryData.words.join(' / ')}
- 피해야 할 표현: ${categoryData.avoid.join(' / ')}

네이버 플레이스 작성 원칙:
1. 인스타그램보다 정보가 더 분명해야 합니다.
2. 고객이 방문 전 궁금해할 정보(무엇, 언제, 어디, 예약/문의 방법)를 빠뜨리지 않습니다.
3. 제목 또는 첫 줄은 20자 안팎으로 짧고 명확하게 씁니다.
4. 과장, 효과 보장, 의료적 효능, 허위 할인 표현을 피합니다.
5. 자동 발행을 암시하지 말고, 사장님이 직접 확인 후 복사해 쓰는 문장으로 작성합니다.
6. 응답은 최종 문안만 제공합니다. 별도 설명은 쓰지 않습니다.`;
}

function buildNaverPrompt({ context, type, typeGuide, topic }) {
  return `네이버 플레이스 ${type} 문안을 작성해주세요.

작성 목적:
${typeGuide.goal}

오늘 넣을 내용:
${topic}

권장 구조:
${typeGuide.structure.map((item, index) => `${index + 1}. ${item}`).join('\n')}

권장 길이:
${typeGuide.length}

추가 조건:
- 매장명 "${context.storeName}"을 자연스럽게 포함합니다.
- 지역 "${context.region || '지역'}" 정보가 도움이 되면 자연스럽게 포함합니다.
- 문의/예약/방문 안내를 마지막에 넣습니다.
- 리뷰 답글이면 고객을 탓하거나 변명하지 말고, 감사와 개선 의지를 담습니다.
- 주간계획이면 인스타그램과 네이버 플레이스를 함께 쓰는 일정으로 구성합니다.`;
}
