import type { BoundingBox, ScaledBox, Dimensions } from '../types';

export const scaleBox = (box: BoundingBox, dims: Dimensions): ScaledBox => ({
  x1: (box.xmin / 1000) * dims.width,
  y1: (box.ymin / 1000) * dims.height,
  x2: (box.xmax / 1000) * dims.width,
  y2: (box.ymax / 1000) * dims.height,
});

export const getCenter = (box: ScaledBox): { x: number; y: number } => ({
  x: (box.x1 + box.x2) / 2,
  y: (box.y1 + box.y2) / 2,
});
