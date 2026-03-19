import type { AlgorithmInfo } from '../types';
import bubbleSort from './bubbleSort';
import selectionSort from './selectionSort';
import insertionSort from './insertionSort';
import shellSort from './shellSort';
import mergeSort from './mergeSort';
import quickSort from './quickSort';
import heapSort from './heapSort';
import countingSort from './countingSort';
import radixSort from './radixSort';
import cocktailShakerSort from './cocktailShakerSort';
import combSort from './combSort';
import gnomeSort from './gnomeSort';
import timSort from './timSort';

const algorithms: AlgorithmInfo[] = [
  bubbleSort,
  selectionSort,
  insertionSort,
  shellSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  radixSort,
  cocktailShakerSort,
  combSort,
  gnomeSort,
  timSort,
];

export default algorithms;
