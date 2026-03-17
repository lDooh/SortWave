import { useState, useRef, useEffect } from 'react';

interface OptimizationTipButtonProps {
  tip: string;
}

export function OptimizationTipButton({ tip }: OptimizationTipButtonProps) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="w-5 h-5 rounded-full border-2 border-blue-400 text-blue-400 flex items-center justify-center text-xs font-bold hover:bg-blue-50 transition-colors leading-none"
        title="최적화 설명"
      >
        i
      </button>

      {open && (
        <div
          ref={popupRef}
          className="absolute right-0 top-7 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              최적화 설명
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm leading-none"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{tip}</p>
        </div>
      )}
    </div>
  );
}
