import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

interface AnalysisRequest {
  base64Image: string;
}

// Constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - allow all origins in development, restrict in production
  const origin = req.headers.origin ?? '';
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

  if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production' || allowedOrigins.length === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { base64Image } = req.body as AnalysisRequest;

    // Validation
    if (!base64Image || typeof base64Image !== 'string') {
      return res.status(400).json({ error: '画像データが無効です' });
    }

    // Size validation (base64 is ~33% larger than binary)
    const estimatedSize = (base64Image.length * 3) / 4;
    if (estimatedSize > MAX_IMAGE_SIZE) {
      return res.status(413).json({ error: '画像サイズが大きすぎます（最大10MB）' });
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'サーバー設定エラー' });
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });

    // Parse image data
    const parts = base64Image.split(',');
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return res.status(400).json({ error: '画像データの形式が無効です' });
    }

    const imageData = parts[1];
    const mimeMatch = parts[0].match(/data:(.+);base64/);
    const mimeType = mimeMatch?.[1] ?? 'image/jpeg';

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({
        error: '画像形式が無効です（JPEG、PNG、WebPのみ対応）'
      });
    }

    const systemInstruction = `
あなたは靴下のペアリングを専門とするAIアシスタントです。
画像内の靴下を観察して、同じ、または非常に近い組み合わせを最大2ペア提案してください。

指示事項:
1. 画像内の靴下の特徴を詳細に分析すること。
2. ペアとなる各靴下の位置を「正規化された座標 ([ymin, xmin, ymax, xmax], 0-1000の範囲)」で指定すること。
3. 出力は必ず指定されたJSONスキーマに従うこと。
4. ペアごとに異なる視覚的に目立つ 'highlightColor' (例: #FF5733) を割り当てること。
`;

    const prompt = `画像内の靴下を観察して、同じ/近い組み合わせを最大2ペア提案してください。
各ペアについて、画像上の位置(ymin, xmin, ymax, xmax)を正確に特定してください。
理由は色・柄・丈・素材感など視覚的特徴に基づいて説明してください。`;

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageData,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                  reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tradeoffs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  highlightColor: { type: Type.STRING },
                  box1: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER },
                    },
                    required: ['ymin', 'xmin', 'ymax', 'xmax'],
                  },
                  box2: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER },
                    },
                    required: ['ymin', 'xmin', 'ymax', 'xmax'],
                  },
                },
                required: ['title', 'confidence', 'reasons', 'tradeoffs', 'box1', 'box2', 'highlightColor'],
              },
            },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['pairs', 'notes'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('応答が得られませんでした');
    }

    const result = JSON.parse(resultText);
    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error('Analysis Error:', error);
    const message = error instanceof Error ? error.message : '解析中にエラーが発生しました';
    return res.status(500).json({ error: message });
  }
}
