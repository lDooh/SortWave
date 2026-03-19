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
// 2 = 비교
// 3 = 교환
// 4 = 패스 완료
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), new Set()),
    description: '콤 정렬을 시작합니다.',
    codeLine: 0,
  });

  let gap = n;
  let swapped = true;

  while (gap > 1 || swapped) {
    gap = Math.floor(gap / 1.3);
    if (gap < 1) gap = 1;

    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), new Set()),
      description: `gap = ${gap} 으로 설정합니다. (축소 계수 1.3)`,
      codeLine: 1,
    });

    swapped = false;

    for (let i = 0; i + gap < n; i++) {
      // 비교 단계 (comparing)
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[i, 'comparing'], [i + gap, 'comparing']]),
          new Set(),
        ),
        description: `인덱스 ${i}(값:${arrVals[i]})와 ${i + gap}(값:${arrVals[i + gap]})을 비교합니다. (gap=${gap})`,
        codeLine: 2,
      });

      if (arrVals[i] > arrVals[i + gap]) {
        // 교환 (swap)
        const desc = `${arrVals[i]} > ${arrVals[i + gap]} 이므로 교환합니다.`;
        [arrIds[i], arrIds[i + gap]] = [arrIds[i + gap], arrIds[i]];
        [arrVals[i], arrVals[i + gap]] = [arrVals[i + gap], arrVals[i]];

        steps.push({
          bars: makeBars(
            arrIds, arrVals,
            new Map([[i, 'swapping'], [i + gap, 'swapping']]),
            new Set(),
          ),
          description: desc,
          codeLine: 3,
        });

        swapped = true;
      }
    }

    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), new Set()),
      description: `gap=${gap} 패스 완료.${!swapped && gap === 1 ? ' 교환이 없으므로 정렬 완료.' : ''}`,
      codeLine: 4,
    });
  }

  // 전체 정렬 완료
  const allSorted = new Set(Array.from({ length: n }, (_, i) => i));
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), allSorted),
    description: '정렬이 완료되었습니다!',
    codeLine: 5,
  });

  return steps;
}

const code: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function combSort(arr) {',
      '  let gap = arr.length;',
      '  let swapped = true;',
      '  while (gap > 1 || swapped) {',
      '    gap = Math.floor(gap / 1.3);',
      '    if (gap < 1) gap = 1;',
      '    swapped = false;',
      '    for (let i = 0; i + gap < arr.length; i++) {',
      '      if (arr[i] > arr[i + gap]) {',
      '        [arr[i], arr[i+gap]] = [arr[i+gap], arr[i]];',
      '        swapped = true;',
      '      }',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 8, 9, 3, 14],
  },
  java: {
    lines: [
      'void combSort(int[] arr) {',
      '    int n = arr.length;',
      '    int gap = n;',
      '    boolean swapped = true;',
      '    while (gap > 1 || swapped) {',
      '        gap = (int)(gap / 1.3);',
      '        if (gap < 1) gap = 1;',
      '        swapped = false;',
      '        for (int i = 0; i + gap < n; i++) {',
      '            if (arr[i] > arr[i + gap]) {',
      '                int temp = arr[i];',
      '                arr[i] = arr[i + gap];',
      '                arr[i + gap] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 5, 9, 10, 4, 17],
  },
  python: {
    lines: [
      'def comb_sort(arr):',
      '    n = len(arr)',
      '    gap = n',
      '    swapped = True',
      '    while gap > 1 or swapped:',
      '        gap = int(gap / 1.3)',
      '        if gap < 1:',
      '            gap = 1',
      '        swapped = False',
      '        for i in range(n - gap):',
      '            if arr[i] > arr[i + gap]:',
      '                arr[i], arr[i+gap] = arr[i+gap], arr[i]',
      '                swapped = True',
    ],
    lineMap: [0, 5, 10, 11, 4, 12],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function combSort(arr) {',
      '  let gap = arr.length;',
      '  let swapped = true;',
      '  while (gap > 1 || swapped) {',
      '    gap = Math.floor(gap / 1.3);',
      '    if (gap < 1) gap = 1;',
      '    // Rule of 11: gap이 9 또는 10이면 11로 설정',
      '    if (gap === 9 || gap === 10) gap = 11;',
      '    swapped = false;',
      '    for (let i = 0; i + gap < arr.length; i++) {',
      '      if (arr[i] > arr[i + gap]) {',
      '        [arr[i], arr[i+gap]] = [arr[i+gap], arr[i]];',
      '        swapped = true;',
      '      }',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 10, 11, 3, 16],
  },
  java: {
    lines: [
      'void combSort(int[] arr) {',
      '    int n = arr.length;',
      '    int gap = n;',
      '    boolean swapped = true;',
      '    while (gap > 1 || swapped) {',
      '        gap = (int)(gap / 1.3);',
      '        if (gap < 1) gap = 1;',
      '        // Rule of 11: gap이 9 또는 10이면 11로 설정',
      '        if (gap == 9 || gap == 10) gap = 11;',
      '        swapped = false;',
      '        for (int i = 0; i + gap < n; i++) {',
      '            if (arr[i] > arr[i + gap]) {',
      '                int temp = arr[i];',
      '                arr[i] = arr[i + gap];',
      '                arr[i + gap] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 5, 11, 12, 4, 19],
  },
  python: {
    lines: [
      'def comb_sort(arr):',
      '    n = len(arr)',
      '    gap = n',
      '    swapped = True',
      '    while gap > 1 or swapped:',
      '        gap = int(gap / 1.3)',
      '        if gap < 1:',
      '            gap = 1',
      '        # Rule of 11: gap이 9 또는 10이면 11로 설정',
      '        if gap in (9, 10):',
      '            gap = 11',
      '        swapped = False',
      '        for i in range(n - gap):',
      '            if arr[i] > arr[i + gap]:',
      '                arr[i], arr[i+gap] = arr[i+gap], arr[i]',
      '                swapped = True',
    ],
    lineMap: [0, 5, 13, 14, 4, 15],
  },
};

const combSort: AlgorithmInfo = {
  id: 'comb-sort',
  name: 'Comb Sort',
  korName: '콤 정렬',
  category: '교환 정렬',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n²/2^p)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    '버블 정렬의 개선 버전으로, gap을 줄여가며 멀리 떨어진 원소를 먼저 교환합니다. 축소 계수 1.3을 사용하며, gap이 1이 되면 일반 버블 정렬과 동일합니다.',
  code,
  optimizedCode,
  optimizationTip:
    'gap이 9 또는 10일 때 11로 설정하는 "Rule of 11"을 적용하면 성능이 향상됩니다.\n\n' +
    'gap이 9나 10인 경우 원소들이 잘 섞이지 않는 경향이 있어, 11로 올리면 더 효과적으로 정렬할 수 있습니다.\n\n' +
    '이 최적화는 실험적으로 검증된 것으로, 평균적인 비교 횟수를 줄여줍니다.',
  generateSteps,
};

export default combSort;
