import type { AlgorithmInfo } from '../types';
import bubbleSort from './bubbleSort';
import selectionSort from './selectionSort';
import insertionSort from './insertionSort';
import shellSort from './shellSort';

const algorithms: AlgorithmInfo[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
];

export default algorithms;
