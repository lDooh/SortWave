import { useState, useCallback, useRef } from 'react';
import { generateRandomArray } from '../utils/arrayUtils';

export function useArray(initialSize = 20) {
  const nextId = useRef(0);

  const createIds = useCallback((count: number) => {
    return Array.from({ length: count }, () => nextId.current++);
  }, []);

  const [size, setSize] = useState(initialSize);
  const [values, setValues] = useState<number[]>(() => generateRandomArray(initialSize));
  const [ids, setIds] = useState<number[]>(() => createIds(initialSize));

  const regenerate = useCallback(() => {
    setValues(generateRandomArray(size));
    setIds(createIds(size));
  }, [size, createIds]);

  const changeSize = useCallback(
    (newSize: number) => {
      setSize(newSize);
      setValues(generateRandomArray(newSize));
      setIds(createIds(newSize));
    },
    [createIds],
  );

  return { ids, values, size, regenerate, changeSize };
}
