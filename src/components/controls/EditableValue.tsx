import { useState, useRef, useEffect } from 'react';

interface EditableValueProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  width?: string;
}

export function EditableValue({ value, min, max, onChange, width = 'w-6' }: EditableValueProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      inputRef.current?.select();
    }
  }, [editing, value]);

  const commit = () => {
    setEditing(false);
    const n = parseInt(draft, 10);
    if (!isNaN(n)) {
      onChange(Math.max(min, Math.min(max, n)));
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            const n = Math.min(max, parseInt(draft, 10) + 1 || value + 1);
            setDraft(String(n));
            onChange(n);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const n = Math.max(min, parseInt(draft, 10) - 1 || value - 1);
            setDraft(String(n));
            onChange(n);
          }
        }}
        className={`${width} text-xs font-mono text-center border border-blue-400 rounded px-0.5 py-0 outline-none`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`${width} text-xs text-gray-400 font-mono text-center cursor-pointer hover:text-blue-500 hover:underline`}
      title="클릭하여 직접 입력"
    >
      {value}
    </span>
  );
}
