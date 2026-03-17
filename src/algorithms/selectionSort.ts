import type { AlgorithmInfo, AnimationStep, BarData, CodeBlock, Language } from '../types';

function makeBars(
  ids: number[],
  values: number[],
  states: Map<number, BarData['state']>,
  sortedSet: Set<number>,
): BarData[] {
  return ids.map((id, i) => ({
    id,
    value: values[i],
    state: states.get(i) ?? (sortedSet.has(i) ? 'sorted' : 'default'),
  }));
}

// codeLine 논리 값:
// 0 = 함수 시작
// 1 = 최솟값 탐색 (비교)
// 2 = 새 최솟값 발견
// 3 = 교환
// 4 = 패스 완료
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '선택 정렬을 시작합니다.',
    codeLine: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // 현재 위치를 current로 표시
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map([[i, 'current']]), sortedSet),
      description: `인덱스 ${i}부터 최솟값을 탐색합니다. 현재 최솟값: ${arrVals[i]}`,
      codeLine: 1,
    });

    for (let j = i + 1; j < n; j++) {
      // 비교
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[minIdx, 'current'], [j, 'comparing']]),
          sortedSet,
        ),
        description: `인덱스 ${j}(값:${arrVals[j]})와 현재 최솟값 인덱스 ${minIdx}(값:${arrVals[minIdx]})을 비교합니다.`,
        codeLine: 1,
      });

      if (arrVals[j] < arrVals[minIdx]) {
        minIdx = j;
        steps.push({
          bars: makeBars(
            arrIds, arrVals,
            new Map([[minIdx, 'current']]),
            sortedSet,
          ),
          description: `새 최솟값 발견: 인덱스 ${minIdx}(값:${arrVals[minIdx]})`,
          codeLine: 2,
        });
      }
    }

    if (minIdx !== i) {
      // 교환 표시
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[i, 'swapping'], [minIdx, 'swapping']]),
          sortedSet,
        ),
        description: `인덱스 ${i}(값:${arrVals[i]})와 최솟값 인덱스 ${minIdx}(값:${arrVals[minIdx]})를 교환합니다.`,
        codeLine: 3,
      });

      [arrIds[i], arrIds[minIdx]] = [arrIds[minIdx], arrIds[i]];
      [arrVals[i], arrVals[minIdx]] = [arrVals[minIdx], arrVals[i]];

      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[i, 'swapping'], [minIdx, 'swapping']]),
          sortedSet,
        ),
        description: `교환 완료.`,
        codeLine: 3,
      });
    }

    sortedSet.add(i);
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `인덱스 ${i}(값:${arrVals[i]})이 확정되었습니다.`,
      codeLine: 4,
    });
  }

  sortedSet.add(n - 1);
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '정렬이 완료되었습니다!',
    codeLine: 5,
  });

  return steps;
}

const code: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function selectionSort(arr) {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    let minIdx = i;',
      '    for (let j = i + 1; j < arr.length; j++) {',
      '      if (arr[j] < arr[minIdx]) {',
      '        minIdx = j;',
      '      }',
      '    }',
      '    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 5, 8, 1, 10],
  },
  java: {
    lines: [
      'void selectionSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i;',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) {',
      '                minIdx = j;',
      '            }',
      '        }',
      '        int temp = arr[minIdx];',
      '        arr[minIdx] = arr[i];',
      '        arr[i] = temp;',
      '    }',
      '}',
    ],
    lineMap: [0, 5, 6, 9, 2, 13],
  },
  python: {
    lines: [
      'def selection_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        min_idx = i',
      '        for j in range(i + 1, n):',
      '            if arr[j] < arr[min_idx]:',
      '                min_idx = j',
      '        arr[i], arr[min_idx] = arr[min_idx], arr[i]',
    ],
    lineMap: [0, 5, 6, 7, 2, 7],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function selectionSort(arr) {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    let minIdx = i;',
      '    for (let j = i + 1; j < arr.length; j++) {',
      '      if (arr[j] < arr[minIdx]) {',
      '        minIdx = j;',
      '      }',
      '    }',
      '    if (minIdx !== i) {',
      '      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 5, 9, 1, 12],
  },
  java: {
    lines: [
      'void selectionSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i;',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) {',
      '                minIdx = j;',
      '            }',
      '        }',
      '        if (minIdx != i) {',
      '            int temp = arr[minIdx];',
      '            arr[minIdx] = arr[i];',
      '            arr[i] = temp;',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 5, 6, 10, 2, 15],
  },
  python: {
    lines: [
      'def selection_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        min_idx = i',
      '        for j in range(i + 1, n):',
      '            if arr[j] < arr[min_idx]:',
      '                min_idx = j',
      '        if min_idx != i:',
      '            arr[i], arr[min_idx] = arr[min_idx], arr[i]',
    ],
    lineMap: [0, 5, 6, 8, 2, 8],
  },
};

const selectionSort: AlgorithmInfo = {
  id: 'selection-sort',
  name: 'Selection Sort',
  korName: '선택 정렬',
  category: '선택 정렬',
  timeComplexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    '배열에서 최솟값을 찾아 맨 앞의 정렬되지 않은 원소와 교환합니다. 매 패스마다 하나의 원소가 최종 위치에 확정됩니다. 비교 횟수는 항상 O(n²)이지만 교환 횟수가 O(n)으로 적습니다.',
  code,
  optimizedCode,
  optimizationTip:
    '최솟값의 인덱스가 현재 위치(i)와 같은 경우, 이미 올바른 위치에 있으므로 교환을 생략합니다.\n\n' +
    'if (minIdx !== i) 조건을 추가하여 불필요한 swap 연산을 줄일 수 있습니다.\n\n' +
    '비교 횟수는 동일하지만 교환 횟수를 줄여 실제 수행 시간을 단축합니다.',
  generateSteps,
};

export default selectionSort;
