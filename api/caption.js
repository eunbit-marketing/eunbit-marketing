import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tone } = req.body;

    if (!tone) {
      return res.status(400).json({ error: 'tone is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const client = new Anthropic({ apiKey });

    const toneDescriptions = {
      '감성적': '감정적이고 따뜻한',
      '정보형': '정보 전달 중심의 명확한',
      '유머러스': '재미있고 즐거운'
    };

    const toneDesc = toneDescriptions[tone] || '매력적인';

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `당신은 인스타그램 마케팅 전문가입니다. 
          
이 사진을 위한 ${toneDesc} 인스타그램 캡션을 작성해주세요.

요구사항:
- 길이: 150-200자
- 해시태그: 8-10개 (한국어 해시태그)
- 형식: 캡션 [줄바꿈] [줄바꿈] #해시태그들

예시:
따뜻한 오후의 한 모금 ☕
마음까지 편해지는 그런 시간...

#카페 #커피 #감성 #일상 #따뜻함 #카페투어 #커피와함께 #휴식 #감성카페`
        }
      ]
    });

    const caption = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Failed to generate caption';

    return res.status(200).json({ caption });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate caption',
      details: error.message 
    });
  }
}
