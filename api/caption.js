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
    const { tone, image } = req.body;
    
    if (!tone) {
      return res.status(400).json({ error: 'tone required' });
    }
 
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not set' });
    }
 
    const toneMap = {
      '감성적': '감정적이고 따뜻한',
      '정보형': '정보 전달 중심의 명확한',
      '유머러스': '재미있고 즐거운'
    };
 
    const toneDesc = toneMap[tone] || '매력적인';
 
    // 메시지 구성
    let messages = [];
 
    if (image) {
      // 사진이 있으면 이미지 분석
      messages = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: image
            }
          },
          {
            type: 'text',
            text: `이 사진을 보고 ${toneDesc} 인스타그램 캡션을 작성해주세요.
 
요구사항:
- 길이: 150-200자
- 해시태그: 8-10개 (한국어 해시태그)
- 형식: 캡션 [줄바꿈] [줄바꿈] #해시태그들
 
사진의 내용을 분석해서 자연스럽고 매력적인 캡션을 만들어주세요.`
          }
        ]
      }];
    } else {
      // 사진이 없으면 텍스트만
      messages = [{
        role: 'user',
        content: `당신은 인스타그램 마케팅 전문가입니다.
 
${toneDesc} 인스타그램 캡션을 작성해주세요.
 
요구사항:
- 길이: 150-200자
- 해시태그: 8-10개 (한국어 해시태그)
- 형식: 캡션 [줄바꿈] [줄바꿈] #해시태그들`
      }];
    }
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: 300,
        messages: messages
      })
    });
 
    const data = await response.json();
 
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'API failed'
      });
    }
 
    return res.status(200).json({
      caption: data.content[0].text
    });
 
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
 
