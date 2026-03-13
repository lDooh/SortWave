import { useState } from 'react';
import algorithms from './algorithms';
import { useArray } from './hooks/useArray';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { VisualizerPanel } from './components/visualizer/VisualizerPanel';

export default function App() {
  const [selectedId, setSelectedId] = useState(algorithms[0].id);
  const { ids, values, size, regenerate, changeSize } = useArray(20);

  const selectedAlgorithm = algorithms.find((a) => a.id === selectedId) ?? algorithms[0];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          algorithms={algorithms}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <VisualizerPanel
          algorithm={selectedAlgorithm}
          ids={ids}
          values={values}
          arraySize={size}
          onArraySizeChange={changeSize}
          onRegenerate={regenerate}
        />
      </div>
    </div>
  );
}
