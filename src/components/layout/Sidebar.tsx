import type { AlgorithmInfo } from '../../types';
import { AlgorithmInfoPanel } from '../info/AlgorithmInfoPanel';

interface SidebarProps {
  algorithms: AlgorithmInfo[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ algorithms, selectedId, onSelect }: SidebarProps) {
  const selected = algorithms.find((a) => a.id === selectedId);

  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          알고리즘
        </h2>
        <ul className="space-y-1">
          {algorithms.map((algo) => (
            <li key={algo.id}>
              <button
                onClick={() => onSelect(algo.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedId === algo.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {algo.name}
                <span className="block text-xs text-gray-400">{algo.korName}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="p-4 flex-1">
          <AlgorithmInfoPanel algorithm={selected} />
        </div>
      )}
    </aside>
  );
}
