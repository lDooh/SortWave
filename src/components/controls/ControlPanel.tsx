interface ControlPanelProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onRegenerate: () => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

export function ControlPanel({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onRegenerate,
  canStepForward,
  canStepBackward,
}: ControlPanelProps) {
  const btnBase =
    'px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isPlaying ? (
        <button onClick={onPause} className={`${btnBase} bg-amber-500 text-white hover:bg-amber-600`}>
          ⏸ 일시정지
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={!canStepForward}
          className={`${btnBase} bg-green-500 text-white hover:bg-green-600`}
        >
          ▶ 재생
        </button>
      )}

      <button
        onClick={onStepBackward}
        disabled={!canStepBackward || isPlaying}
        className={`${btnBase} bg-gray-200 text-gray-700 hover:bg-gray-300`}
      >
        ⏮ 이전
      </button>

      <button
        onClick={onStepForward}
        disabled={!canStepForward || isPlaying}
        className={`${btnBase} bg-gray-200 text-gray-700 hover:bg-gray-300`}
      >
        ⏭ 다음
      </button>

      <button onClick={onReset} className={`${btnBase} bg-gray-200 text-gray-700 hover:bg-gray-300`}>
        ↺ 리셋
      </button>

      <button
        onClick={onRegenerate}
        disabled={isPlaying}
        className={`${btnBase} bg-blue-100 text-blue-700 hover:bg-blue-200`}
      >
        🔀 새 배열
      </button>
    </div>
  );
}
