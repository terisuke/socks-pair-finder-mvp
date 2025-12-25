
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeSocksImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imageData = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageData,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pairs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tradeoffs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  highlightColor: { type: Type.STRING },
                  box1: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER }
                    },
                    required: ["ymin", "xmin", "ymax", "xmax"]
                  },
                  box2: {
                    type: Type.OBJECT,
                    properties: {
                      ymin: { type: Type.NUMBER },
                      xmin: { type: Type.NUMBER },
                      ymax: { type: Type.NUMBER },
                      xmax: { type: Type.NUMBER }
                    },
                    required: ["ymin", "xmin", "ymax", "xmax"]
                  }
                },
                required: ["title", "confidence", "reasons", "tradeoffs", "box1", "box2", "highlightColor"]
              }
            },
            notes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["pairs", "notes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("応答が得られませんでした。");
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("解析中にエラーが発生しました。");
  }
};
