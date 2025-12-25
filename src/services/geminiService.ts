import type { AnalysisResult } from '../types';

const API_ENDPOINT = '/api/analyze-socks';

export const analyzeSocksImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Analysis Error:', error);
    throw new Error('解析中にエラーが発生しました。');
  }
};
