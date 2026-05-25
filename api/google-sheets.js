export default async function handler(req, res) {
    // CORS 헤더 추가
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // req.body가 없을 경우 방어 처리 (GET 요청 등)
    const { sheetsId, apiKey } = req.body || {};

    if (!sheetsId || !apiKey) {
        return res.status(400).json({ error: 'Sheets ID와 API 키 필요' });
    }

    try {
        // Google Sheets API 호출 (서버에서!)
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetsId}?key=${apiKey}`
        );

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'Google Sheets 연결 실패' 
            });
        }

        const data = await response.json();
        return res.status(200).json({ 
            success: true, 
            message: '✅ Google Sheets 연결 성공!',
            spreadsheetTitle: data.properties.title 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
