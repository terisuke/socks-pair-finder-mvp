import { useState, useCallback } from 'react';
import { analyzeSocksImage } from '../services/geminiService';
import type { AnalysisResult } from '../types';

interface UseImageAnalysisReturn {
  image: string | null;
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  setImage: (image: string | null) => void;
  analyzeImage: () => Promise<void>;
  clearAll: () => void;
}

export const useImageAnalysis = (): UseImageAnalysisReturn => {
  const [image, setImageState] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setImage = useCallback((newImage: string | null) => {
    setImageState(newImage);
    setResult(null);
    setError(null);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!image) {
      setError('画像が選択されていません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzeSocksImage(image);
      setResult(analysisResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '分析中にエラーが発生しました';
      setError(errorMessage);
      console.error('[useImageAnalysis] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [image]);

  const clearAll = useCallback(() => {
    setImageState(null);
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    image,
    result,
    loading,
    error,
    setImage,
    analyzeImage,
    clearAll,
  };
};
