interface CodePanelProps {
  codeLines: string[];
  currentLine: number;
}

export function CodePanel({ codeLines, currentLine }: CodePanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-auto">
      <div className="px-3 py-2 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Code
      </div>
      <pre className="text-sm leading-relaxed">
        {codeLines.map((line, i) => (
          <div
            key={i}
            className={`px-3 py-0.5 font-mono ${
              i === currentLine
                ? 'bg-yellow-100 border-l-4 border-yellow-500'
                : 'border-l-4 border-transparent'
            }`}
          >
            <span className="text-gray-400 select-none mr-3 inline-block w-4 text-right">
              {i + 1}
            </span>
            {line}
          </div>
        ))}
      </pre>
    </div>
  );
}
