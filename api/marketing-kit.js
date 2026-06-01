import { callAnthropicMessages } from './_anthropic.js';
import { DEFAULT_MODEL, buildStoreContext } from './_prompt-data.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      topic = '',
      tone = '따뜻한',
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
      storeName, category, region, mainOffer, targetCustomer, brandTone, description, tone,
    });

    const { response, data, model } = await callAnthropicMessages(apiKey, {
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: 1500,
      temperature: 0.72,
      system: buildKitSystem(context),
      messages: [{ role: 'user', content: buildKitPrompt({ context, topic, tone }) }],
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Marketing kit API failed' });
    }

    const rawText = data.content?.[0]?.text || '';
    const kit = parseMarketingKit(rawText, { context, topic });
    return res.status(200).json({ kit, model: data.model || model });
  } catch (error) {
    console.error('Marketing kit API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

function buildKitSystem(context) {
  const { categoryData } = context;
  return `당신은 Bloom의 소상공인 원클릭 마케팅 키트 작성자입니다.

대상 사용자는 40~60대 소상공인 사장님입니다. 결과는 사장님이 바로 복사하고 저장할 수 있어야 합니다.

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

작성 원칙:
1. 인스타그램은 감정과 장면을, 네이버 플레이스는 정보와 방문 결정을 돕는 문장으로 씁니다.
2. 자동 발행을 암시하지 말고, 사장님이 확인 후 복사해 쓰는 문장으로 작성합니다.
3. 과장 광고, 효과 보장, 의료적 효능, 허위 할인 표현은 피합니다.
4. 응답은 JSON만 제공합니다. 마크다운 코드블록이나 설명 문장은 붙이지 않습니다.`;
}

function buildKitPrompt({ context, topic, tone }) {
  return `아래 주제로 인스타그램과 네이버 플레이스를 함께 운영할 수 있는 마케팅 키트를 만들어주세요.

주제:
${topic}

선호 톤:
${tone || context.brandTone}

반드시 아래 JSON 형식으로만 답하세요:
{
  "title": "키트 전체 제목",
  "instagram": {
    "caption": "인스타그램에 바로 올릴 캡션. 줄바꿈은 \\n 사용",
    "hashtags": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5", "#태그6", "#태그7", "#태그8"]
  },
  "naver": {
    "title": "네이버 플레이스 소식 제목",
    "body": "네이버 플레이스 본문",
    "cta": "문의/예약/방문 안내",
    "copyText": "네이버 플레이스에 그대로 복사할 전체 문안"
  },
  "visualDirection": "사진이나 배너를 고를 때 참고할 방향 1~2문장",
  "checklist": ["게시 전 확인 1", "게시 전 확인 2", "게시 전 확인 3"]
}`;
}

function parseMarketingKit(rawText, { context, topic }) {
  const text = String(rawText || '').trim();
  const parsed = tryParseJson(text);
  if (parsed) return normalizeKit(parsed, { context, topic });

  return normalizeKit({
    title: `${context.storeName} 오늘의 마케팅 키트`,
    instagram: { caption: text || topic, hashtags: ['#소상공인', '#동네가게', '#오늘의소식'] },
    naver: {
      title: `${context.storeName} 소식`,
      body: text || topic,
      cta: '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.',
      copyText: text || topic,
    },
    visualDirection: '매장 분위기와 대표 상품이 한눈에 보이는 사진을 사용하세요.',
    checklist: ['운영 시간과 날짜를 확인하세요', '가격/혜택 문구가 실제와 맞는지 확인하세요', '문의 채널이 맞는지 확인하세요'],
  }, { context, topic });
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeKit(input, { context, topic }) {
  const instagram = input.instagram || {};
  const naver = input.naver || {};
  const hashtags = Array.isArray(instagram.hashtags)
    ? instagram.hashtags.map(tag => String(tag || '').trim()).filter(Boolean).slice(0, 12)
    : [];
  const naverTitle = clean(naver.title) || `${context.storeName} 소식`;
  const naverBody = clean(naver.body) || topic;
  const naverCta = clean(naver.cta) || '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.';
  const naverCopyText = clean(naver.copyText) || [naverTitle, naverBody, naverCta].filter(Boolean).join('\n\n');

  return {
    title: clean(input.title) || `${context.storeName} 오늘의 마케팅 키트`,
    instagram: {
      caption: clean(instagram.caption) || topic,
      hashtags: hashtags.length ? hashtags : ['#소상공인', '#동네가게', '#오늘의소식'],
    },
    naver: {
      title: naverTitle,
      body: naverBody,
      cta: naverCta,
      copyText: naverCopyText,
    },
    visualDirection: clean(input.visualDirection) || '매장 분위기와 대표 상품이 한눈에 보이는 사진을 사용하세요.',
    checklist: Array.isArray(input.checklist)
      ? input.checklist.map(clean).filter(Boolean).slice(0, 4)
      : ['운영 시간과 날짜를 확인하세요', '가격/혜택 문구가 실제와 맞는지 확인하세요', '문의 채널이 맞는지 확인하세요'],
  };
}

function clean(value) {
  return String(value || '').trim();
}
