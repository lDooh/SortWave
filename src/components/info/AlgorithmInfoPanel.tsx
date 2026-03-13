import type { AlgorithmInfo } from '../../types';

interface AlgorithmInfoPanelProps {
  algorithm: AlgorithmInfo;
}

export function AlgorithmInfoPanel({ algorithm }: AlgorithmInfoPanelProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          복잡도
        </h3>
        <table className="text-sm w-full">
          <tbody>
            <tr>
              <td className="text-gray-500 pr-3 py-0.5">최선</td>
              <td className="font-mono text-gray-800">{algorithm.timeComplexity.best}</td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-3 py-0.5">평균</td>
              <td className="font-mono text-gray-800">{algorithm.timeComplexity.average}</td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-3 py-0.5">최악</td>
              <td className="font-mono text-gray-800">{algorithm.timeComplexity.worst}</td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-3 py-0.5">공간</td>
              <td className="font-mono text-gray-800">{algorithm.spaceComplexity}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <span
          className={`inline-block text-xs px-2 py-0.5 rounded-full ${
            algorithm.stable
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {algorithm.stable ? '안정 정렬' : '불안정 정렬'}
        </span>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">설명</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{algorithm.description}</p>
      </div>
    </div>
  );
}
