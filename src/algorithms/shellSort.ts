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
// 1 = gap 설정
// 2 = 현재 원소 선택
// 3 = 비교
// 4 = 시프트/교환
// 5 = 삽입
// 6 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), new Set()),
    description: '셸 정렬을 시작합니다.',
    codeLine: 0,
  });

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), new Set()),
      description: `gap = ${gap} 으로 설정합니다.`,
      codeLine: 1,
    });

    for (let i = gap; i < n; i++) {
      const keyVal = arrVals[i];

      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[i, 'current']]), new Set()),
        description: `인덱스 ${i}(값:${keyVal})를 선택합니다. (gap=${gap})`,
        codeLine: 2,
      });

      let j = i;

      while (j >= gap && arrVals[j - gap] > arrVals[j]) {
        // 비교
        steps.push({
          bars: makeBars(
            arrIds, arrVals,
            new Map([[j, 'current'], [j - gap, 'comparing']]),
            new Set(),
          ),
          description: `인덱스 ${j - gap}(값:${arrVals[j - gap]}) > ${keyVal} → 교환합니다. (gap=${gap})`,
          codeLine: 3,
        });

        // swap (ID 중복 방지)
        [arrIds[j], arrIds[j - gap]] = [arrIds[j - gap], arrIds[j]];
        [arrVals[j], arrVals[j - gap]] = [arrVals[j - gap], arrVals[j]];

        steps.push({
          bars: makeBars(
            arrIds, arrVals,
            new Map([[j - gap, 'current'], [j, 'swapping']]),
            new Set(),
          ),
          description: `인덱스 ${j}과 ${j - gap}을 교환했습니다.`,
          codeLine: 4,
        });

        j -= gap;
      }

      if (j !== i) {
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j, 'current']]), new Set()),
          description: `값 ${keyVal}가 인덱스 ${j}에 삽입되었습니다.`,
          codeLine: 5,
        });
      }
    }
  }

  // 전체 정렬 완료
  const allSorted = new Set(Array.from({ length: n }, (_, i) => i));
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), allSorted),
    description: '정렬이 완료되었습니다!',
    codeLine: 6,
  });

  return steps;
}

const code: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function shellSort(arr) {',
      '  const n = arr.length;',
      '  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {',
      '    for (let i = gap; i < n; i++) {',
      '      let temp = arr[i];',
      '      let j = i;',
      '      while (j >= gap && arr[j - gap] > temp) {',
      '        arr[j] = arr[j - gap];',
      '        j -= gap;',
      '      }',
      '      arr[j] = temp;',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 2, 4, 6, 7, 10, 13],
  },
  java: {
    lines: [
      'void shellSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int gap = n/2; gap > 0; gap /= 2) {',
      '        for (int i = gap; i < n; i++) {',
      '            int temp = arr[i];',
      '            int j = i;',
      '            while (j >= gap && arr[j - gap] > temp) {',
      '                arr[j] = arr[j - gap];',
      '                j -= gap;',
      '            }',
      '            arr[j] = temp;',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 2, 4, 6, 7, 10, 13],
  },
  python: {
    lines: [
      'def shell_sort(arr):',
      '    n = len(arr)',
      '    gap = n // 2',
      '    while gap > 0:',
      '        for i in range(gap, n):',
      '            temp = arr[i]',
      '            j = i',
      '            while j >= gap and arr[j - gap] > temp:',
      '                arr[j] = arr[j - gap]',
      '                j -= gap',
      '            arr[j] = temp',
      '        gap //= 2',
    ],
    lineMap: [0, 2, 5, 7, 8, 10, 11],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function shellSort(arr) {',
      '  const n = arr.length;',
      '  // Knuth 간격 수열: 1, 4, 13, 40, 121, ...',
      '  let gap = 1;',
      '  while (gap < Math.floor(n / 3)) gap = gap * 3 + 1;',
      '  while (gap > 0) {',
      '    for (let i = gap; i < n; i++) {',
      '      let temp = arr[i];',
      '      let j = i;',
      '      while (j >= gap && arr[j - gap] > temp) {',
      '        arr[j] = arr[j - gap];',
      '        j -= gap;',
      '      }',
      '      arr[j] = temp;',
      '    }',
      '    gap = Math.floor(gap / 3);',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 7, 9, 10, 13, 17],
  },
  java: {
    lines: [
      'void shellSort(int[] arr) {',
      '    int n = arr.length;',
      '    // Knuth 간격 수열: 1, 4, 13, 40, 121, ...',
      '    int gap = 1;',
      '    while (gap < n / 3) gap = gap * 3 + 1;',
      '    while (gap > 0) {',
      '        for (int i = gap; i < n; i++) {',
      '            int temp = arr[i];',
      '            int j = i;',
      '            while (j >= gap && arr[j - gap] > temp) {',
      '                arr[j] = arr[j - gap];',
      '                j -= gap;',
      '            }',
      '            arr[j] = temp;',
      '        }',
      '        gap /= 3;',
      '    }',
      '}',
    ],
    lineMap: [0, 4, 7, 9, 10, 13, 17],
  },
  python: {
    lines: [
      'def shell_sort(arr):',
      '    n = len(arr)',
      '    # Knuth 간격 수열: 1, 4, 13, 40, 121, ...',
      '    gap = 1',
      '    while gap < n // 3:',
      '        gap = gap * 3 + 1',
      '    while gap > 0:',
      '        for i in range(gap, n):',
      '            temp = arr[i]',
      '            j = i',
      '            while j >= gap and arr[j - gap] > temp:',
      '                arr[j] = arr[j - gap]',
      '                j -= gap',
      '            arr[j] = temp',
      '        gap //= 3',
    ],
    lineMap: [0, 4, 8, 10, 11, 13, 14],
  },
};

const shellSort: AlgorithmInfo = {
  id: 'shell-sort',
  name: 'Shell Sort',
  korName: '셸 정렬',
  category: '삽입 정렬 변형',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n^1.3)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    '삽입 정렬의 개선 버전입니다. 일정 간격(gap)만큼 떨어진 원소끼리 삽입 정렬을 수행하고, gap을 점차 줄여 최종적으로 gap=1인 일반 삽입 정렬을 수행합니다. gap 수열에 따라 성능이 크게 달라집니다.',
  code,
  optimizedCode,
  optimizationTip:
    '기본 gap 수열(n/2, n/4, ...)보다 Knuth 수열(1, 4, 13, 40, 121, ...)을 사용하면 성능이 향상됩니다.\n\n' +
    'Knuth 수열은 gap = gap × 3 + 1 로 생성하고, 매 라운드마다 gap = gap / 3 으로 줄입니다.\n\n' +
    '이 수열을 사용하면 최악의 경우에도 O(n^(3/2))의 시간복잡도를 보장합니다.',
  generateSteps,
};

export default shellSort;
