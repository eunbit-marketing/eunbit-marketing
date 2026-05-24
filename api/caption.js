import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { business_type = "공방/클래스", tone = "감성적", caption_text = "새로운 게시물" } = req.body;

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `한국 소상공인 인스타그램 마케팅 전문가입니다.

업종: ${business_type}
톤: ${tone}
내용: ${caption_text}

인스타그램 캡션을 2-3문장으로 작성하세요. 이모지 2개 포함.
해시태그 10개 추천하세요.
최적 발행 시간 추천하세요.

JSON으로만 응답:
{"caption":"...","hashtags":["#tag1","#tag2"],"recommended_time":"오후 7시"}`,
        },
      ],
    });

    const text = message.content[0].text;
    const json = JSON.parse(text);

    res.status(200).json(json);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
