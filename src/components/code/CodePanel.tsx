import type { CodeBlock, Language } from '../../types';

const LANGUAGE_LABELS: Record<Language, string> = {
  js: 'JavaScript',
  java: 'Java',
  python: 'Python',
};

interface CodePanelProps {
  title: string;
  codeBlock: CodeBlock;
  currentLogicalLine: number;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  topRightSlot?: React.ReactNode;
}

export function CodePanel({
  title,
  codeBlock,
  currentLogicalLine,
  language,
  onLanguageChange,
  topRightSlot,
}: CodePanelProps) {
  const highlightedLine = codeBlock.lineMap[currentLogicalLine] ?? -1;

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-auto flex flex-col">
      {/* 헤더 */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {topRightSlot}
          {language && onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white text-gray-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 코드 */}
      <pre className="text-sm leading-relaxed flex-1">
        {codeBlock.lines.map((line, i) => (
          <div
            key={i}
            className={`px-3 py-0.5 font-mono ${
              i === highlightedLine
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
