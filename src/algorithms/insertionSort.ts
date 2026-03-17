import type { AlgorithmInfo, AnimationStep, BarData, CodeBlock, Language } from '../types';

function makeBars(
  ids: number[],
  values: number[],
  states: Map<number, BarData['state']>,
  sortedSet: Set<number>,
  offsets?: Map<number, number>,
): BarData[] {
  return ids.map((id, i) => ({
    id,
    value: values[i],
    state: states.get(i) ?? (sortedSet.has(i) ? 'sorted' : 'default'),
    offsetY: offsets?.get(i),
  }));
}

// codeLine 논리 값:
// 0 = 함수 시작
// 1 = key 선택
// 2 = 비교
// 3 = 시프트
// 4 = 삽입
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  sortedSet.add(0);
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '삽입 정렬을 시작합니다. 인덱스 0은 이미 정렬된 것으로 간주합니다.',
    codeLine: 0,
  });

  for (let i = 1; i < n; i++) {
    const keyVal = arrVals[i];

    // key 선택
    steps.push({
      bars: makeBars(
        arrIds, arrVals,
        new Map([[i, 'current']]),
        sortedSet,
        new Map([[i, 50]]),
      ),
      description: `인덱스 ${i}(값:${keyVal})를 key로 선택하여 삽입할 위치를 찾습니다.`,
      codeLine: 1,
    });

    let j = i;

    while (j > 0 && arrVals[j - 1] > arrVals[j]) {
      // 비교
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[j - 1, 'comparing'], [j, 'current']]),
          sortedSet,
          new Map([[j, 50]]),
        ),
        description: `인덱스 ${j - 1}(값:${arrVals[j - 1]}) > key(${keyVal}) → 교환합니다.`,
        codeLine: 2,
      });

      // 인접 swap (ID 중복 없음)
      [arrIds[j], arrIds[j - 1]] = [arrIds[j - 1], arrIds[j]];
      [arrVals[j], arrVals[j - 1]] = [arrVals[j - 1], arrVals[j]];

      // swap 후에도 key는 아래에 유지 (j-1이 key의 새 위치)
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[j - 1, 'current'], [j, 'swapping']]),
          sortedSet,
          new Map([[j - 1, 50]]),
        ),
        description: `인덱스 ${j}과 ${j - 1}을 교환했습니다.`,
        codeLine: 3,
      });

      j--;
    }

    // 삽입 위치 확정 - 탐색 종료 표시 (key는 아직 아래)
    if (j > 0) {
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[j - 1, 'comparing'], [j, 'current']]),
          sortedSet,
          new Map([[j, 50]]),
        ),
        description: `인덱스 ${j - 1}(값:${arrVals[j - 1]}) ≤ key(${keyVal}) → 탐색 종료.`,
        codeLine: 2,
      });
    }

    // 정렬된 범위 갱신 (0~i)
    for (let k = 0; k <= i; k++) sortedSet.add(k);

    // key를 위로 올림 (삽입 완료)
    steps.push({
      bars: makeBars(
        arrIds, arrVals,
        new Map([[j, 'current']]),
        sortedSet,
      ),
      description: `key(${keyVal})가 인덱스 ${j}에 삽입되었습니다.`,
      codeLine: 4,
    });
  }

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
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j + 1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j + 1] = key;',
      '  }',
      '}',
    ],
    lineMap: [0, 2, 4, 5, 8, 10],
  },
  java: {
    lines: [
      'void insertionSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i];',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j];',
      '            j--;',
      '        }',
      '        arr[j + 1] = key;',
      '    }',
      '}',
    ],
    lineMap: [0, 3, 5, 6, 9, 11],
  },
  python: {
    lines: [
      'def insertion_sort(arr):',
      '    for i in range(1, len(arr)):',
      '        key = arr[i]',
      '        j = i - 1',
      '        while j >= 0 and arr[j] > key:',
      '            arr[j + 1] = arr[j]',
      '            j -= 1',
      '        arr[j + 1] = key',
    ],
    lineMap: [0, 2, 4, 5, 7, 7],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    if (key >= arr[i - 1]) continue; // 이미 정렬됨',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j + 1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j + 1] = key;',
      '  }',
      '}',
    ],
    lineMap: [0, 2, 5, 6, 9, 11],
  },
  java: {
    lines: [
      'void insertionSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i];',
      '        if (key >= arr[i - 1]) continue; // 이미 정렬됨',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j];',
      '            j--;',
      '        }',
      '        arr[j + 1] = key;',
      '    }',
      '}',
    ],
    lineMap: [0, 3, 6, 7, 10, 12],
  },
  python: {
    lines: [
      'def insertion_sort(arr):',
      '    for i in range(1, len(arr)):',
      '        key = arr[i]',
      '        if key >= arr[i - 1]:  # 이미 정렬됨',
      '            continue',
      '        j = i - 1',
      '        while j >= 0 and arr[j] > key:',
      '            arr[j + 1] = arr[j]',
      '            j -= 1',
      '        arr[j + 1] = key',
    ],
    lineMap: [0, 2, 6, 7, 9, 9],
  },
};

const insertionSort: AlgorithmInfo = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  korName: '삽입 정렬',
  category: '삽입 정렬',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: true,
  description:
    '정렬된 부분 배열에 새 원소를 올바른 위치에 삽입합니다. 앞에서부터 이미 정렬된 부분을 유지하며, 새 원소를 적절한 위치에 끼워 넣습니다. 거의 정렬된 배열에서 매우 효율적입니다.',
  code,
  optimizedCode,
  optimizationTip:
    '현재 원소가 이전 원소보다 크거나 같으면 이미 올바른 위치에 있으므로 while 루프 진입 없이 건너뜁니다.\n\n' +
    'if (key >= arr[i - 1]) continue 조건을 추가하여 불필요한 비교를 조기에 차단합니다.\n\n' +
    '이미 정렬된 배열에서 O(n) 시간에 완료됩니다.',
  generateSteps,
};

export default insertionSort;
