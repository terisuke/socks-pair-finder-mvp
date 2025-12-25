import React from 'react';
import { useImageAnalysis, useOverlayDimensions, useToggle } from './hooks';
import { Guide } from './components/layout/Guide';
import { Camera } from './components/camera/Camera';
import { SockPairOverlay } from './components/image/SockPairOverlay';
import { AnalysisResults } from './components/analysis/AnalysisResults';

const App: React.FC = () => {
  const { image, result, loading, error, setImage, analyzeImage, clearAll } = useImageAnalysis();
  const { imageRef, dimensions, updateDimensions } = useOverlayDimensions();
  const { isOpen: showCamera, open: openCamera, close: closeCamera } = useToggle(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setImage(base64);
    closeCamera();
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20 px-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <span className="text-blue-500">🧦</span> 靴下ペア提案
          <span className="text-xs font-normal bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2">
            Visual
          </span>
        </h1>
      </header>

      <main className="space-y-6">
        <Guide />

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {!image ? (
            <div className="p-10 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 m-4 rounded-xl space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <div className="flex gap-2 w-full pt-4">
                <button
                  onClick={openCamera}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  カメラ
                </button>
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
                src={image}
                alt="Preview"
                className="w-full h-auto"
                onLoad={updateDimensions}
              />
              {result && <SockPairOverlay pairs={result.pairs} dimensions={dimensions} />}

              <button
                onClick={clearAll}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {!result && (
                <div className="p-4 bg-gray-50">
                  <button
                    onClick={analyzeImage}
                    disabled={loading}
                    className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3"
                  >
                    {loading ? '分析中...' : 'ペアを提案する'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && <AnalysisResults result={result} onClear={clearAll} />}
      </main>

      {showCamera && <Camera onCapture={handleCameraCapture} onCancel={closeCamera} />}
    </div>
  );
};

export default App;
