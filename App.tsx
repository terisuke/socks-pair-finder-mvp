
import React, { useState, useRef, useEffect } from 'react';
import Guide from './components/Guide';
import Camera from './components/Camera';
import { analyzeSocksImage } from './services/geminiService';
import { AppState, AnalysisResult, Confidence, BoundingBox } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    image: null,
    loading: false,
    result: null,
    error: null,
  });
  const [showCamera, setShowCamera] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDims = () => {
      if (imageRef.current) {
        setDims({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, [state.image, state.result]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, image: reader.result as string, result: null, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setState(prev => ({ ...prev, image: base64, result: null, error: null }));
    setShowCamera(false);
  };

  const executeAnalysis = async () => {
    if (!state.image) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await analyzeSocksImage(state.image);
      setState(prev => ({ ...prev, result, loading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const clearImage = () => {
    setState({ image: null, loading: false, result: null, error: null });
  };

  const getConfidenceBadge = (confidence: Confidence) => {
    const styles = {
      high: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-red-100 text-red-800 border-red-200"
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${styles[confidence]}`}>
        {confidence.toUpperCase()}
      </span>
    );
  };

  const renderOverlays = () => {
    if (!state.result || !dims.width) return null;

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox={`0 0 ${dims.width} ${dims.height}`}>
        {state.result.pairs.map((pair, i) => {
          const b1 = pair.box1;
          const b2 = pair.box2;

          const scale = (box: BoundingBox) => ({
            y1: (box.ymin / 1000) * dims.height,
            x1: (box.xmin / 1000) * dims.width,
            y2: (box.ymax / 1000) * dims.height,
            x2: (box.xmax / 1000) * dims.width,
          });

          const p1 = scale(b1);
          const p2 = scale(b2);

          const c1 = { x: (p1.x1 + p2.x2) / 2, y: (p1.y1 + p1.y2) / 2 }; // Just for naming logic
          const center1 = { x: (p1.x1 + p1.x2) / 2, y: (p1.y1 + p1.y2) / 2 };
          const center2 = { x: (p2.x1 + p2.x2) / 2, y: (p2.y1 + p2.y2) / 2 };

          return (
            <g key={i}>
              {/* Connection Line */}
              <line 
                x1={center1.x} y1={center1.y} x2={center2.x} y2={center2.y} 
                stroke={pair.highlightColor} strokeWidth="3" strokeDasharray="5,5" 
                className="animate-[dash_10s_linear_infinite]"
              />
              
              {/* Box 1 */}
              <rect 
                x={p1.x1} y={p1.y1} width={p1.x2 - p1.x1} height={p1.y2 - p1.y1} 
                fill={pair.highlightColor} fillOpacity="0.2" 
                stroke={pair.highlightColor} strokeWidth="2" rx="4"
              />
              <circle cx={center1.x} cy={center1.y} r="12" fill={pair.highlightColor} />
              <text x={center1.x} y={center1.y} textAnchor="middle" dy=".3em" fill="white" fontSize="10" fontWeight="bold">{i+1}</text>

              {/* Box 2 */}
              <rect 
                x={p2.x1} y={p2.y1} width={p2.x2 - p2.x1} height={p2.y2 - p2.y1} 
                fill={pair.highlightColor} fillOpacity="0.2" 
                stroke={pair.highlightColor} strokeWidth="2" rx="4"
              />
              <circle cx={center2.x} cy={center2.y} r="12" fill={pair.highlightColor} />
              <text x={center2.x} y={center2.y} textAnchor="middle" dy=".3em" fill="white" fontSize="10" fontWeight="bold">{i+1}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 px-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span className="text-blue-500">🧦</span> 靴下ペア提案
          <span className="text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2">Visual</span>
        </h1>
      </header>

      <main className="space-y-6">
        <Guide />

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {!state.image ? (
            <div className="p-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 m-4 rounded-xl space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div className="flex gap-2 w-full pt-4">
                <button onClick={() => setShowCamera(true)} className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">カメラ</button>
                <label className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                  フォルダ
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <img 
                ref={imageRef} 
                src={state.image} 
                alt="Preview" 
                className="w-full h-auto" 
                onLoad={() => setDims({ width: imageRef.current!.clientWidth, height: imageRef.current!.clientHeight })}
              />
              {renderOverlays()}
              
              <button onClick={clearImage} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              
              {!state.result && (
                <div className="p-4 bg-gray-50">
                   <button onClick={executeAnalysis} disabled={state.loading} className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3">
                    {state.loading ? "分析中..." : "ペアを提案する"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {state.result && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-gray-800">提案ペア</h2>
            {state.result.pairs.map((pair, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3" style={{ borderLeft: `6px solid ${pair.highlightColor}` }}>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white" style={{ backgroundColor: pair.highlightColor }}>{idx + 1}</span>
                    {pair.title}
                  </h3>
                  {getConfidenceBadge(pair.confidence)}
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {pair.reasons.map((r, i) => <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">{r}</span>)}
                  </div>
                  {pair.tradeoffs.length > 0 && (
                    <p className="text-xs text-amber-600 italic">注: {pair.tradeoffs.join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
            {state.result.notes.length > 0 && (
              <div className="bg-blue-50/50 p-4 rounded-xl text-xs text-blue-700 space-y-1">
                <p className="font-bold mb-1">AIメモ:</p>
                {state.result.notes.map((n, i) => <p key={i}>• {n}</p>)}
              </div>
            )}
            <button onClick={clearImage} className="w-full py-3 text-blue-600 font-semibold text-sm">別の写真を撮る</button>
          </div>
        )}
      </main>

      {showCamera && <Camera onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />}
    </div>
  );
};

export default App;
