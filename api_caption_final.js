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
    const { tone, image, imageType } = req.body;
    
    if (!tone) {
      return res.status(400).json({ error: 'tone required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not set' });
    }

    // 톤별 상세 지시사항
    const toneGuides = {
      '감성적': {
        description: '감정적이고 따뜻한',
        guide: `
스타일: 감성적, 공감하는, 따뜻한, 감정 표현이 풍부한
- 감정적 표현을 많이 사용하세요
- 공감과 감정을 강조하세요
- 따뜻하고 포근한 느낌을 전달하세요
- 감정과 경험을 중심으로 작성하세요
예: "이 순간을 영원히 기억하고 싶어요" "마음까지 편해지는..." 같은 표현 사용`
      },
      '정보형': {
        description: '정보 전달 중심의 명확한',
        guide: `
스타일: 정보 중심, 명확한, 교육적, 사실 기반
- 구체적인 정보와 사실을 중심으로 작성하세요
- 명확한 설명과 교육적 내용을 포함하세요
- 전문성 있는 톤으로 작성하세요
- 팩트와 유용한 정보를 강조하세요
예: "이런 특징이 있습니다", "알아두면 좋은 정보" 같은 표현 사용`
      },
      '유머러스': {
        description: '재미있고 즐거운',
        guide: `
스타일: 유머러스, 즐거운, 장난스러운, 웃음 유발
- 재미있는 표현과 위트를 사용하세요
- 장난스럽고 긍정적인 톤으로 작성하세요
- 웃음을 유발하는 표현을 포함하세요
- 가볍고 즐거운 분위기를 만드세요
예: "ㅋㅋ", "뭔가 설렌다", "이건 꼭..." 같은 친근한 표현 사용`
      }
    };

    const selectedTone = toneGuides[tone] || toneGuides['감성적'];
    const mediaType = imageType || 'image/jpeg';

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
              media_type: mediaType,
              data: image
            }
          },
          {
            type: 'text',
            text: `이 사진을 보고 인스타그램 캡션을 작성해주세요.

작성 톤: ${selectedTone.description}
${selectedTone.guide}

요구사항:
- 길이: 150-200자
- 해시태그: 8-10개 (한국어 해시태그)
- 형식: 캡션 [줄바꿈] [줄바꿈] #해시태그들

⚠️ 중요: 위의 톤 가이드를 반드시 따르세요. 캡션은 반드시 ${selectedTone.description} 스타일로 작성되어야 합니다.`
          }
        ]
      }];
    } else {
      // 사진이 없으면 텍스트만
      messages = [{
        role: 'user',
        content: `당신은 인스타그램 마케팅 전문가입니다.

작성 톤: ${selectedTone.description}
${selectedTone.guide}

요구사항:
- 길이: 150-200자
- 해시태그: 8-10개 (한국어 해시태그)
- 형식: 캡션 [줄바꿈] [줄바꿈] #해시태그들

⚠️ 중요: 위의 톤 가이드를 반드시 따르세요. 캡션은 반드시 ${selectedTone.description} 스타일로 작성되어야 합니다.`
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

    if (!data.content || !data.content[0]) {
      return res.status(500).json({
        error: 'Invalid API response'
      });
    }

    return res.status(200).json({
      caption: data.content[0].text
    });

  } catch (error) {
    console.error('Caption API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
