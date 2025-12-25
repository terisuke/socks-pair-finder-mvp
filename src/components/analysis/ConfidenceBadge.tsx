import React from 'react';
import type { Confidence } from '../../types';
import { getConfidenceStyles } from '../../utils/styleUtils';

interface ConfidenceBadgeProps {
  confidence: Confidence;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getConfidenceStyles(confidence)}`}>
      {confidence.toUpperCase()}
    </span>
  );
};
