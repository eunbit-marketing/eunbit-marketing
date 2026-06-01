import { callAnthropicMessages } from './_anthropic.js';
import { DEFAULT_MODEL, buildStoreContext, getToneBackdata } from './_prompt-data.js';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      tone = '따뜻한',
      keyword = '',
      image,
      imageType,
      storeName,
      category,
      region,
      mainOffer,
      targetCustomer,
      brandTone,
      description,
    } = req.body || {};

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not set' });

    const context = buildStoreContext({
      storeName, category, region, mainOffer, targetCustomer, brandTone, description, tone,
    });
    const toneData = getToneBackdata(tone || context.brandTone);
    const prompt = buildCaptionPrompt({ context, tone, toneData, keyword });
    const content = image ? [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageType || 'image/jpeg',
          data: image,
        },
      },
      { type: 'text', text: prompt },
    ] : prompt;

    const { response, data, model } = await callAnthropicMessages(apiKey, {
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 900,
        temperature: 0.75,
        system: buildCaptionSystem(context),
        messages: [{ role: 'user', content }],
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Caption API failed' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ caption: text.trim(), model: data.model || model });
  } catch (error) {
    console.error('Caption API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

function buildCaptionSystem(context) {
  const { categoryData } = context;
  return `당신은 Bloom의 소상공인 인스타그램 카피라이터입니다.

핵심 사용자:
- 40~60대 사장님이 직접 복사해서 쓸 수 있어야 합니다.
- 어렵고 추상적인 마케팅 용어보다 쉬운 한국어를 사용합니다.
- 과장 광고, 효과 보장, 의료/법률적 단정 표현은 피합니다.

매장 백데이터:
- 매장명: ${context.storeName}
- 업종: ${context.category}
- 지역: ${context.region || '지역 미입력'}
- 대표 상품/서비스: ${context.mainOffer || '대표 상품 미입력'}
- 주요 고객: ${context.targetCustomer}
- 업종 고객 고민: ${categoryData.pains.join(' / ')}
- 신뢰 포인트: ${categoryData.trustSignals.join(' / ')}
- 권장 단어: ${categoryData.words.join(' / ')}
- 피해야 할 표현: ${categoryData.avoid.join(' / ')}

작성 원칙:
1. 첫 줄은 고객이 멈춰 읽을 만큼 분명하게 씁니다.
2. 본문은 사장님 말투처럼 자연스럽게 씁니다.
3. 마지막은 문의, 예약, 방문, 저장 중 하나로 행동을 부드럽게 유도합니다.
4. 해시태그는 지역/업종/상황 태그를 섞어 8~12개 제공합니다.
5. 응답은 오직 최종 캡션만 제공합니다. 설명이나 따옴표는 붙이지 않습니다.`;
}

function buildCaptionPrompt({ context, tone, toneData, keyword }) {
  return `인스타그램 캡션을 작성해주세요.

오늘 홍보할 내용:
${keyword || context.mainOffer || '오늘 매장 소식'}

톤:
- 선택 톤: ${tone || context.brandTone}
- 톤 방향: ${toneData.direction}
- 문장 방식: ${toneData.sentence}

출력 형식:
첫 줄 후킹 문장

본문 3~5문장

마무리 행동 유도 1문장

#해시태그 #8개에서12개

추가 조건:
- 너무 젊은 밈이나 어려운 영어 표현은 피합니다.
- 사장님이 바로 복사해도 어색하지 않게 존댓말 기반으로 씁니다.
- 실제 자동 발행을 암시하지 않습니다.
- 사진이 제공되었다면 사진에서 보이는 구체 요소를 자연스럽게 반영합니다.`;
}
