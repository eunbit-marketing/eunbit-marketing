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
      details = {},
    } = req.body || {};

    if (!topic.trim()) return res.status(400).json({ error: 'topic required' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not set' });

    const context = buildStoreContext({
      storeName, category, region, mainOffer, targetCustomer, brandTone, description,
    });
    const writingDetails = normalizeWritingDetails(details);
    const typeGuide = NAVER_PLACE_TYPES[type] || NAVER_PLACE_TYPES['소식'];

    const { response, data, model } = await callAnthropicMessages(apiKey, {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: type === '주간계획' ? 1300 : 950,
        temperature: 0.68,
        system: buildNaverSystem(context, writingDetails),
        messages: [{
          role: 'user',
          content: buildNaverPrompt({ context, type, typeGuide, topic, writingDetails }),
        }],
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Naver Place API failed' });
    }

    const rawText = data.content?.[0]?.text || '';
    const placePackage = parseNaverPackage(rawText, { context, type, topic });
    return res.status(200).json({
      text: placePackage.copyText,
      package: placePackage,
      model: data.model || model,
    });
  } catch (error) {
    console.error('Naver Place API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

function normalizeWritingDetails(details = {}) {
  const clean = (value) => String(value || '').trim();
  return {
    period: clean(details.period),
    benefit: clean(details.benefit),
    contact: clean(details.contact),
    tone: clean(details.tone),
  };
}

function buildNaverSystem(context, writingDetails) {
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
- 이번 문안 기간/일정: ${writingDetails.period || '미입력'}
- 이번 문안 혜택/가격: ${writingDetails.benefit || '미입력'}
- 문의/예약 방법: ${writingDetails.contact || '네이버 플레이스 문의/예약'}
- 요청 톤: ${writingDetails.tone || context.brandTone}

네이버 플레이스 작성 원칙:
1. 인스타그램보다 정보가 더 분명해야 합니다.
2. 고객이 방문 전 궁금해할 정보(무엇, 언제, 어디, 기간/혜택, 예약/문의 방법)를 빠뜨리지 않습니다.
3. 제목 또는 첫 줄은 20자 안팎으로 짧고 명확하게 씁니다.
4. 과장, 효과 보장, 의료적 효능, 허위 할인 표현을 피합니다.
5. 자동 발행을 암시하지 말고, 사장님이 직접 확인 후 복사해 쓰는 문장으로 작성합니다.
6. 응답은 JSON만 제공합니다. 마크다운 코드블록, 별도 설명, 앞뒤 문장은 붙이지 않습니다.`;
}

function buildNaverPrompt({ context, type, typeGuide, topic, writingDetails }) {
  return `네이버 플레이스 ${type} 문안을 작성해주세요.

작성 목적:
${typeGuide.goal}

오늘 넣을 내용:
${topic}

세부 조건:
- 기간/일정: ${writingDetails.period || '명시된 기간 없음'}
- 혜택/가격: ${writingDetails.benefit || '명시된 혜택 없음'}
- 문의 방법: ${writingDetails.contact || '네이버 플레이스 문의/예약'}
- 문체 톤: ${writingDetails.tone || context.brandTone}

권장 구조:
${typeGuide.structure.map((item, index) => `${index + 1}. ${item}`).join('\n')}

권장 길이:
${typeGuide.length}

추가 조건:
- 매장명 "${context.storeName}"을 자연스럽게 포함합니다.
- 지역 "${context.region || '지역'}" 정보가 도움이 되면 자연스럽게 포함합니다.
- 기간/혜택/문의 방법이 입력되어 있으면 본문 또는 CTA에 빠뜨리지 말고 넣습니다.
- 문의/예약/방문 안내를 마지막에 넣습니다.
- 리뷰 답글이면 고객을 탓하거나 변명하지 말고, 감사와 개선 의지를 담습니다.
- 주간계획이면 인스타그램과 네이버 플레이스를 함께 쓰는 일정으로 구성합니다.

반드시 아래 JSON 형식으로만 답하세요:
{
  "title": "네이버 플레이스에 넣을 짧은 제목",
  "body": "본문 문안. 줄바꿈이 필요하면 \\n을 사용",
  "cta": "문의/예약/방문 안내 한 문장",
  "checklist": ["올리기 전 확인할 것 1", "올리기 전 확인할 것 2", "올리기 전 확인할 것 3"],
  "copyText": "사장님이 네이버 플레이스에 그대로 복사할 전체 문안"
}`;
}

function parseNaverPackage(rawText, { context, type, topic }) {
  const trimmed = String(rawText || '').trim();
  const parsed = tryParseJson(trimmed);
  if (parsed && parsed.title && (parsed.body || parsed.copyText)) {
    return normalizePackage(parsed, { context, type, topic });
  }

  const lines = trimmed.split('\n').map(line => line.trim()).filter(Boolean);
  const title = lines[0] || `${context.storeName} ${type}`;
  const body = lines.slice(1).join('\n\n') || topic;
  return normalizePackage({
    title,
    body,
    cta: '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.',
    checklist: ['날짜와 운영 시간을 확인하세요', '가격/혜택 조건이 실제와 맞는지 확인하세요', '문의 가능한 연락 채널을 확인하세요'],
    copyText: trimmed || `${title}\n\n${body}`,
  }, { context, type, topic });
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

function normalizePackage(input, { context, type, topic }) {
  const title = clean(input.title) || `${context.storeName} ${type}`;
  const body = clean(input.body || input.content) || topic;
  const cta = clean(input.cta) || '문의와 예약은 네이버 플레이스에서 편하게 남겨주세요.';
  const checklist = Array.isArray(input.checklist)
    ? input.checklist.map(clean).filter(Boolean).slice(0, 4)
    : [];
  const safeChecklist = checklist.length ? checklist : [
    '날짜와 운영 시간을 확인하세요',
    '가격/혜택 조건이 실제와 맞는지 확인하세요',
    '문의 가능한 연락 채널을 확인하세요',
  ];
  const copyText = clean(input.copyText) || [title, body, cta].filter(Boolean).join('\n\n');

  return { title, body, cta, checklist: safeChecklist, copyText };
}

function clean(value) {
  return String(value || '').trim();
}
