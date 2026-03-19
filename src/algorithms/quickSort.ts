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
// 1 = 피벗 선택
// 2 = 비교
// 3 = 교환
// 4 = 피벗 위치 확정
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  // 현재 구간을 보라색으로 + 추가 하이라이트
  function rangeStates(left: number, right: number, extra?: Map<number, BarData['state']>) {
    const states = new Map<number, BarData['state']>();
    for (let k = left; k <= right; k++) states.set(k, 'pivot');
    if (extra) extra.forEach((v, k) => states.set(k, v));
    return states;
  }

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '퀵 정렬을 시작합니다.',
    codeLine: 0,
  });

  function quickSort(low: number, high: number) {
    if (low >= high) {
      if (low === high) sortedSet.add(low);
      return;
    }

    const pivotIdx = partition(low, high);
    sortedSet.add(pivotIdx);

    steps.push({
      bars: makeBars(arrIds, arrVals, new Map([[pivotIdx, 'sorted']]), sortedSet),
      description: `피벗(값:${arrVals[pivotIdx]})이 인덱스 ${pivotIdx}에 확정되었습니다.`,
      codeLine: 4,
    });

    quickSort(low, pivotIdx - 1);
    quickSort(pivotIdx + 1, high);
  }

  function partition(low: number, high: number): number {
    const pivotVal = arrVals[high];

    // 피벗 선택 표시
    steps.push({
      bars: makeBars(
        arrIds, arrVals,
        rangeStates(low, high, new Map([[high, 'current']])),
        sortedSet,
      ),
      description: `피벗으로 인덱스 ${high}(값:${pivotVal})을 선택합니다. 구간 [${low}..${high}]`,
      codeLine: 1,
    });

    let i = low;

    for (let j = low; j < high; j++) {
      // 비교
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          rangeStates(low, high, new Map([[high, 'current'], [j, 'comparing'], [i, 'pivot']])),
          sortedSet,
        ),
        description: `인덱스 ${j}(값:${arrVals[j]})와 피벗(${pivotVal})을 비교합니다. (i=${i})`,
        codeLine: 2,
      });

      if (arrVals[j] < pivotVal) {
        if (i !== j) {
          // 교환
          [arrIds[i], arrIds[j]] = [arrIds[j], arrIds[i]];
          [arrVals[i], arrVals[j]] = [arrVals[j], arrVals[i]];
          steps.push({
            bars: makeBars(
              arrIds, arrVals,
              rangeStates(low, high, new Map([[high, 'current'], [i, 'swapping'], [j, 'swapping']])),
              sortedSet,
            ),
            description: `인덱스 ${i}와 ${j}를 교환했습니다.`,
            codeLine: 3,
          });
        }
        i++;
      }
    }

    // 피벗을 최종 위치로 교환
    if (i !== high) {
      [arrIds[i], arrIds[high]] = [arrIds[high], arrIds[i]];
      [arrVals[i], arrVals[high]] = [arrVals[high], arrVals[i]];
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          rangeStates(low, high, new Map([[i, 'swapping'], [high, 'swapping']])),
          sortedSet,
        ),
        description: `피벗을 인덱스 ${i}로 이동했습니다.`,
        codeLine: 3,
      });
    }

    return i;
  }

  quickSort(0, n - 1);

  // 전체 정렬 완료
  for (let i = 0; i < n; i++) sortedSet.add(i);
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
      'function quickSort(arr, low, high) {',
      '  if (low >= high) return;',
      '  const pivot = partition(arr, low, high);',
      '  quickSort(arr, low, pivot - 1);',
      '  quickSort(arr, pivot + 1, high);',
      '}',
      '',
      'function partition(arr, low, high) {',
      '  const pivot = arr[high];',
      '  let i = low;',
      '  for (let j = low; j < high; j++) {',
      '    if (arr[j] < pivot) {',
      '      [arr[i], arr[j]] = [arr[j], arr[i]];',
      '      i++;',
      '    }',
      '  }',
      '  [arr[i], arr[high]] = [arr[high], arr[i]];',
      '  return i;',
      '}',
    ],
    lineMap: [0, 8, 11, 12, 16, 18],
  },
  java: {
    lines: [
      'void quickSort(int[] arr, int low, int high) {',
      '    if (low >= high) return;',
      '    int pivot = partition(arr, low, high);',
      '    quickSort(arr, low, pivot - 1);',
      '    quickSort(arr, pivot + 1, high);',
      '}',
      '',
      'int partition(int[] arr, int low, int high) {',
      '    int pivot = arr[high];',
      '    int i = low;',
      '    for (int j = low; j < high; j++) {',
      '        if (arr[j] < pivot) {',
      '            int temp = arr[i];',
      '            arr[i] = arr[j];',
      '            arr[j] = temp;',
      '            i++;',
      '        }',
      '    }',
      '    int temp = arr[i];',
      '    arr[i] = arr[high];',
      '    arr[high] = temp;',
      '    return i;',
      '}',
    ],
    lineMap: [0, 8, 11, 12, 18, 22],
  },
  python: {
    lines: [
      'def quick_sort(arr, low, high):',
      '    if low >= high:',
      '        return',
      '    pivot = partition(arr, low, high)',
      '    quick_sort(arr, low, pivot - 1)',
      '    quick_sort(arr, pivot + 1, high)',
      '',
      'def partition(arr, low, high):',
      '    pivot = arr[high]',
      '    i = low',
      '    for j in range(low, high):',
      '        if arr[j] < pivot:',
      '            arr[i], arr[j] = arr[j], arr[i]',
      '            i += 1',
      '    arr[i], arr[high] = arr[high], arr[i]',
      '    return i',
    ],
    lineMap: [0, 8, 11, 12, 14, 15],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function quickSort(arr, low, high) {',
      '  while (low < high) {',
      '    if (high - low < 16) {',
      '      insertionSort(arr, low, high); // 작은 구간',
      '      return;',
      '    }',
      '    // 중간값 피벗 (median-of-three)',
      '    const mid = Math.floor((low + high) / 2);',
      '    if (arr[mid] < arr[low]) [arr[low], arr[mid]] = [arr[mid], arr[low]];',
      '    if (arr[high] < arr[low]) [arr[low], arr[high]] = [arr[high], arr[low]];',
      '    if (arr[high] < arr[mid]) [arr[mid], arr[high]] = [arr[high], arr[mid]];',
      '    [arr[mid], arr[high]] = [arr[high], arr[mid]]; // 피벗을 끝으로',
      '    const pivot = partition(arr, low, high);',
      '    // 짧은 쪽 재귀, 긴 쪽 루프 (꼬리 재귀 최적화)',
      '    if (pivot - low < high - pivot) {',
      '      quickSort(arr, low, pivot - 1);',
      '      low = pivot + 1;',
      '    } else {',
      '      quickSort(arr, pivot + 1, high);',
      '      high = pivot - 1;',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 7, 12, 12, 12, 22],
  },
  java: {
    lines: [
      'void quickSort(int[] arr, int low, int high) {',
      '    while (low < high) {',
      '        if (high - low < 16) {',
      '            insertionSort(arr, low, high);',
      '            return;',
      '        }',
      '        // median-of-three 피벗',
      '        int mid = (low + high) / 2;',
      '        if (arr[mid] < arr[low]) swap(arr, low, mid);',
      '        if (arr[high] < arr[low]) swap(arr, low, high);',
      '        if (arr[high] < arr[mid]) swap(arr, mid, high);',
      '        swap(arr, mid, high);',
      '        int pivot = partition(arr, low, high);',
      '        if (pivot - low < high - pivot) {',
      '            quickSort(arr, low, pivot - 1);',
      '            low = pivot + 1;',
      '        } else {',
      '            quickSort(arr, pivot + 1, high);',
      '            high = pivot - 1;',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 7, 12, 12, 12, 21],
  },
  python: {
    lines: [
      'def quick_sort(arr, low, high):',
      '    while low < high:',
      '        if high - low < 16:',
      '            insertion_sort(arr, low, high)',
      '            return',
      '        # median-of-three 피벗',
      '        mid = (low + high) // 2',
      '        if arr[mid] < arr[low]: arr[low], arr[mid] = arr[mid], arr[low]',
      '        if arr[high] < arr[low]: arr[low], arr[high] = arr[high], arr[low]',
      '        if arr[high] < arr[mid]: arr[mid], arr[high] = arr[high], arr[mid]',
      '        arr[mid], arr[high] = arr[high], arr[mid]',
      '        pivot = partition(arr, low, high)',
      '        if pivot - low < high - pivot:',
      '            quick_sort(arr, low, pivot - 1)',
      '            low = pivot + 1',
      '        else:',
      '            quick_sort(arr, pivot + 1, high)',
      '            high = pivot - 1',
    ],
    lineMap: [0, 6, 11, 11, 11, 17],
  },
};

const quickSort: AlgorithmInfo = {
  id: 'quick-sort',
  name: 'Quick Sort',
  korName: '퀵 정렬',
  category: '분할정복',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(log n)',
  stable: false,
  description:
    '피벗을 기준으로 작은 값은 왼쪽, 큰 값은 오른쪽으로 분할한 뒤 재귀적으로 정렬합니다. 평균적으로 가장 빠른 비교 기반 정렬이지만, 최악의 경우(이미 정렬된 배열 등) O(n²)이 될 수 있습니다.',
  code,
  optimizedCode,
  optimizationTip:
    '세 가지 최적화를 적용할 수 있습니다.\n\n' +
    '1. Median-of-three: 첫 번째, 중간, 마지막 원소 중 중간값을 피벗으로 선택하여 최악의 경우를 방지합니다.\n\n' +
    '2. 작은 구간(16개 이하)에서는 삽입 정렬을 사용합니다. 재귀 호출 오버헤드를 줄입니다.\n\n' +
    '3. 꼬리 재귀 최적화: 짧은 쪽만 재귀하고 긴 쪽은 루프로 처리하여 스택 깊이를 O(log n)으로 보장합니다.',
  generateSteps,
};

export default quickSort;
