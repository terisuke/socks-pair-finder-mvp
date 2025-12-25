export type Confidence = 'high' | 'medium' | 'low';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface SockPair {
  title: string;
  confidence: Confidence;
  reasons: string[];
  tradeoffs: string[];
  box1: BoundingBox;
  box2: BoundingBox;
  highlightColor: string;
}

export interface AnalysisResult {
  pairs: SockPair[];
  notes: string[];
}

export interface AppState {
  image: string | null;
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

export interface ScaledBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Dimensions {
  width: number;
  height: number;
}
