import { callAnthropicMessages } from './_anthropic.js';

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
    const { messages, storeName, category, tone } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not set' });
    }

    const safeMessages = messages
      .filter(msg => msg && ['user', 'assistant'].includes(msg.role) && typeof msg.content === 'string')
      .slice(-12)
      .map(msg => ({
        role: msg.role,
        content: msg.content.slice(0, 1000),
      }));

    if (safeMessages.length === 0) {
      return res.status(400).json({ error: 'valid messages required' });
    }

    const system = `당신은 Bloom AI, 소상공인과 1인 매장의 인스타그램과 네이버 플레이스 마케팅을 도와주는 AI 어시스턴트입니다.
현재 매장: ${storeName || '우리 매장'}
업종: ${category || '소상공인'}
브랜드 톤: ${tone || '따뜻한'}

캡션 작성, 해시태그 추천, 네이버 플레이스 소식/쿠폰/리뷰 답글, 콘텐츠 아이디어 제안, 마케팅 전략 조언을 한국어로 친근하게 답변하세요.
사용자가 바로 복사해 쓸 수 있도록 구체적으로 답변하되, 150자 이내로 핵심만 간결하게 답변하세요.`;

    const { response, data, model } = await callAnthropicMessages(apiKey, {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system,
        messages: safeMessages,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'AI chat failed',
      });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ message: text, model: data.model || model, raw: data });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
};
