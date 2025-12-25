import React from 'react';
import type { SockPair, Dimensions } from '../../types';
import { scaleBox, getCenter } from '../../utils/coordinateUtils';

interface SockPairOverlayProps {
  pairs: SockPair[];
  dimensions: Dimensions;
}

export const SockPairOverlay: React.FC<SockPairOverlayProps> = ({ pairs, dimensions }) => {
  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
    >
      {pairs.map((pair, index) => {
        const box1 = scaleBox(pair.box1, dimensions);
        const box2 = scaleBox(pair.box2, dimensions);
        const center1 = getCenter(box1);
        const center2 = getCenter(box2);

        return (
          <g key={index}>
            {/* Connection Line */}
            <line
              x1={center1.x}
              y1={center1.y}
              x2={center2.x}
              y2={center2.y}
              stroke={pair.highlightColor}
              strokeWidth="3"
              strokeDasharray="5,5"
              className="animate-[dash_10s_linear_infinite]"
            />

            {/* Box 1 */}
            <rect
              x={box1.x1}
              y={box1.y1}
              width={box1.x2 - box1.x1}
              height={box1.y2 - box1.y1}
              fill={pair.highlightColor}
              fillOpacity="0.2"
              stroke={pair.highlightColor}
              strokeWidth="2"
              rx="4"
            />
            <circle cx={center1.x} cy={center1.y} r="12" fill={pair.highlightColor} />
            <text
              x={center1.x}
              y={center1.y}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              {index + 1}
            </text>

            {/* Box 2 */}
            <rect
              x={box2.x1}
              y={box2.y1}
              width={box2.x2 - box2.x1}
              height={box2.y2 - box2.y1}
              fill={pair.highlightColor}
              fillOpacity="0.2"
              stroke={pair.highlightColor}
              strokeWidth="2"
              rx="4"
            />
            <circle cx={center2.x} cy={center2.y} r="12" fill={pair.highlightColor} />
            <text
              x={center2.x}
              y={center2.y}
              textAnchor="middle"
              dy=".3em"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              {index + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
