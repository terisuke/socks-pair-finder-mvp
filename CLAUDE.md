# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

靴下ペア提案 (Socks Pair Finder) - A mobile-first web app that uses Google Gemini's vision AI to identify and suggest matching sock pairs from photos. Users can capture or upload images of scattered socks, and the AI analyzes visual features (color, pattern, length, texture) to propose up to 2 matching pairs with bounding box overlays.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run preview      # Preview production build
```

## Environment Setup

Set `GEMINI_API_KEY` in `.env.local` with your Google Gemini API key.

## Architecture

### Tech Stack
- React 19 + TypeScript + Vite
- Google Gemini AI (@google/genai) for image analysis
- Tailwind CSS (via CDN in index.html)

### Core Flow
1. User captures/uploads sock image via `Camera.tsx` or file input
2. `App.tsx` manages state (image, loading, result, error)
3. `geminiService.ts` sends image to Gemini with structured JSON schema
4. AI returns pairs with bounding boxes (normalized 0-1000 coordinates)
5. `App.tsx` renders SVG overlays on the image showing matched pairs

### Key Files
- `App.tsx` - Main component with image handling, analysis trigger, and overlay rendering
- `services/geminiService.ts` - Gemini API integration with structured output schema
- `types.ts` - TypeScript interfaces for `SockPair`, `BoundingBox`, `AnalysisResult`
- `components/Camera.tsx` - Camera capture using MediaDevices API
- `components/Guide.tsx` - Collapsible photo tips

### Bounding Box System
Gemini returns coordinates in 0-1000 range. Scaling formula in `renderOverlays()`:
```typescript
const scale = (box: BoundingBox) => ({
  y1: (box.ymin / 1000) * dims.height,
  x1: (box.xmin / 1000) * dims.width,
  // ...
});
```

## Notes

- Uses import maps in index.html for React/Gemini from esm.sh CDN
- Camera defaults to rear-facing (`facingMode: 'environment'`)
- No test framework configured
- Japanese UI language
