
import React, { useState } from 'react';

const Guide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-blue-800 font-semibold"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          撮影ガイド
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" height="20" 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 text-sm text-blue-700 space-y-2 border-t border-blue-100/50 pt-2">
          <ul className="list-disc list-inside space-y-1">
            <li>背景は明るく、無地の場所で撮影してください（床や机など）</li>
            <li>影が強く出ないよう、室内灯の下で明るく撮りましょう</li>
            <li>靴下を重ならないように広げ、同じ向きに並べてください</li>
            <li>カメラを近づけすぎず、全ての靴下を1枚に収めてください</li>
            <li>汚れが目立ちすぎないよう、きれいに広げるのがコツです</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Guide;
