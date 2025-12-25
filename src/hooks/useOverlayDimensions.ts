import { useState, useRef, useEffect, useCallback, type RefObject } from 'react';
import type { Dimensions } from '../types';

interface UseOverlayDimensionsReturn {
  imageRef: RefObject<HTMLImageElement | null>;
  dimensions: Dimensions;
  updateDimensions: () => void;
}

export const useOverlayDimensions = (): UseOverlayDimensionsReturn => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (imageRef.current) {
      setDimensions({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  return {
    imageRef,
    dimensions,
    updateDimensions,
  };
};
