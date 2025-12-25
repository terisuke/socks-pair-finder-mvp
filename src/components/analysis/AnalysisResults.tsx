import React from 'react';
import type { AnalysisResult } from '../../types';
import { SockPairCard } from './SockPairCard';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onClear: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onClear }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-lg font-bold text-gray-800">提案ペア</h2>

      {result.pairs.map((pair, idx) => (
        <SockPairCard key={idx} pair={pair} index={idx} />
      ))}

      {result.notes.length > 0 && (
        <div className="bg-blue-50/50 p-4 rounded-xl text-xs text-blue-700 space-y-1">
          <p className="font-bold mb-1">AIメモ:</p>
          {result.notes.map((note, i) => (
            <p key={i}>• {note}</p>
          ))}
        </div>
      )}

      <button onClick={onClear} className="w-full py-3 text-blue-600 font-semibold text-sm">
        別の写真を撮る
      </button>
    </div>
  );
};
