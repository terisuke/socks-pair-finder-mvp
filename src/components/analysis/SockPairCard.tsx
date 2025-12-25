import React from 'react';
import type { SockPair } from '../../types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface SockPairCardProps {
  pair: SockPair;
  index: number;
}

export const SockPairCard: React.FC<SockPairCardProps> = ({ pair, index }) => {
  return (
    <div
      className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3"
      style={{ borderLeft: `6px solid ${pair.highlightColor}` }}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
            style={{ backgroundColor: pair.highlightColor }}
          >
            {index + 1}
          </span>
          {pair.title}
        </h3>
        <ConfidenceBadge confidence={pair.confidence} />
      </div>
      <div className="text-sm space-y-2">
        <div className="flex flex-wrap gap-1">
          {pair.reasons.map((reason, i) => (
            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
              {reason}
            </span>
          ))}
        </div>
        {pair.tradeoffs.length > 0 && (
          <p className="text-xs text-amber-600 italic">注: {pair.tradeoffs.join(', ')}</p>
        )}
      </div>
    </div>
  );
};
