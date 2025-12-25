import type { Confidence } from '../types';

export const getConfidenceStyles = (confidence: Confidence): string => {
  const styles: Record<Confidence, string> = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-red-100 text-red-800 border-red-200',
  };
  return styles[confidence];
};
