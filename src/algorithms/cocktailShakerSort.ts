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

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '칵테일 셰이커 정렬을 시작합니다.',
    codeLine: 0,
  });

  let start = 0;
  let end = n - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    // Forward pass (left → right)
    for (let j = start; j < end; j++) {
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[j, 'comparing'], [j + 1, 'comparing']]), sortedSet),
        description: `→ 정방향: 인덱스 ${j}(값:${arrVals[j]})와 ${j + 1}(값:${arrVals[j + 1]})을 비교합니다.`,
        codeLine: 1,
      });

      if (arrVals[j] > arrVals[j + 1]) {
        const desc = `${arrVals[j]} > ${arrVals[j + 1]} 이므로 교환합니다.`;
        [arrIds[j], arrIds[j + 1]] = [arrIds[j + 1], arrIds[j]];
        [arrVals[j], arrVals[j + 1]] = [arrVals[j + 1], arrVals[j]];
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j, 'swapping'], [j + 1, 'swapping']]), sortedSet),
          description: desc,
          codeLine: 2,
        });
        swapped = true;
      }
    }

    sortedSet.add(end);
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `정방향 패스 완료. 인덱스 ${end}(값:${arrVals[end]})이 확정되었습니다.`,
      codeLine: 5,
    });
    end--;

    if (!swapped) break;

    swapped = false;

    // Backward pass (right → left)
    for (let j = end; j > start; j--) {
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[j - 1, 'comparing'], [j, 'comparing']]), sortedSet),
        description: `← 역방향: 인덱스 ${j - 1}(값:${arrVals[j - 1]})와 ${j}(값:${arrVals[j]})을 비교합니다.`,
        codeLine: 3,
      });

      if (arrVals[j - 1] > arrVals[j]) {
        const desc = `${arrVals[j - 1]} > ${arrVals[j]} 이므로 교환합니다.`;
        [arrIds[j - 1], arrIds[j]] = [arrIds[j], arrIds[j - 1]];
        [arrVals[j - 1], arrVals[j]] = [arrVals[j], arrVals[j - 1]];
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j - 1, 'swapping'], [j, 'swapping']]), sortedSet),
          description: desc,
          codeLine: 4,
        });
        swapped = true;
      }
    }

    sortedSet.add(start);
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `역방향 패스 완료. 인덱스 ${start}(값:${arrVals[start]})이 확정되었습니다.`,
      codeLine: 5,
    });
    start++;
  }

  // Mark all remaining as sorted
  for (let i = start; i <= end; i++) {
    sortedSet.add(i);
  }

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '정렬이 완료되었습니다!',
    codeLine: 5,
  });

  return steps;
}

// codeLine 논리 값:
// 0 = 함수 시작
// 1 = 정방향 비교 (forward compare)
// 2 = 정방향 교환 (forward swap)
// 3 = 역방향 비교 (backward compare)
// 4 = 역방향 교환 (backward swap)
// 5 = 함수 끝 / 패스 완료

const code: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function cocktailShakerSort(arr) {',
      '  let start = 0, end = arr.length - 1;',
      '  let swapped = true;',
      '  while (swapped) {',
      '    swapped = false;',
      '    for (let i = start; i < end; i++) {',
      '      if (arr[i] > arr[i + 1]) {',
      '        [arr[i], arr[i+1]] = [arr[i+1], arr[i]];',
      '        swapped = true;',
      '      }',
      '    }',
      '    end--;',
      '    for (let i = end; i > start; i--) {',
      '      if (arr[i - 1] > arr[i]) {',
      '        [arr[i-1], arr[i]] = [arr[i], arr[i-1]];',
      '        swapped = true;',
      '      }',
      '    }',
      '    start++;',
      '  }',
      '}',
    ],
    lineMap: [0, 6, 7, 13, 14, 20],
  },
  java: {
    lines: [
      'void cocktailShakerSort(int[] arr) {',
      '    int start = 0, end = arr.length - 1;',
      '    boolean swapped = true;',
      '    while (swapped) {',
      '        swapped = false;',
      '        for (int i = start; i < end; i++) {',
      '            if (arr[i] > arr[i + 1]) {',
      '                int temp = arr[i];',
      '                arr[i] = arr[i + 1];',
      '                arr[i + 1] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '        end--;',
      '        for (int i = end; i > start; i--) {',
      '            if (arr[i - 1] > arr[i]) {',
      '                int temp = arr[i - 1];',
      '                arr[i - 1] = arr[i];',
      '                arr[i] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '        start++;',
      '    }',
      '}',
    ],
    lineMap: [0, 6, 7, 15, 16, 24],
  },
  python: {
    lines: [
      'def cocktail_shaker_sort(arr):',
      '    start, end = 0, len(arr) - 1',
      '    swapped = True',
      '    while swapped:',
      '        swapped = False',
      '        for i in range(start, end):',
      '            if arr[i] > arr[i + 1]:',
      '                arr[i], arr[i+1] = arr[i+1], arr[i]',
      '                swapped = True',
      '        end -= 1',
      '        for i in range(end, start, -1):',
      '            if arr[i - 1] > arr[i]:',
      '                arr[i-1], arr[i] = arr[i], arr[i-1]',
      '                swapped = True',
      '        start += 1',
    ],
    lineMap: [0, 6, 7, 11, 12, 14],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function cocktailShakerSort(arr) {',
      '  let start = 0, end = arr.length - 1;',
      '  while (start < end) {',
      '    let newEnd = start;',
      '    for (let i = start; i < end; i++) {',
      '      if (arr[i] > arr[i + 1]) {',
      '        [arr[i], arr[i+1]] = [arr[i+1], arr[i]];',
      '        newEnd = i;',
      '      }',
      '    }',
      '    end = newEnd;',
      '    let newStart = end;',
      '    for (let i = end; i > start; i--) {',
      '      if (arr[i - 1] > arr[i]) {',
      '        [arr[i-1], arr[i]] = [arr[i], arr[i-1]];',
      '        newStart = i;',
      '      }',
      '    }',
      '    start = newStart;',
      '  }',
      '}',
    ],
    lineMap: [0, 5, 6, 13, 14, 20],
  },
  java: {
    lines: [
      'void cocktailShakerSort(int[] arr) {',
      '    int start = 0, end = arr.length - 1;',
      '    while (start < end) {',
      '        int newEnd = start;',
      '        for (int i = start; i < end; i++) {',
      '            if (arr[i] > arr[i + 1]) {',
      '                int temp = arr[i];',
      '                arr[i] = arr[i + 1];',
      '                arr[i + 1] = temp;',
      '                newEnd = i;',
      '            }',
      '        }',
      '        end = newEnd;',
      '        int newStart = end;',
      '        for (int i = end; i > start; i--) {',
      '            if (arr[i - 1] > arr[i]) {',
      '                int temp = arr[i - 1];',
      '                arr[i - 1] = arr[i];',
      '                arr[i] = temp;',
      '                newStart = i;',
      '            }',
      '        }',
      '        start = newStart;',
      '    }',
      '}',
    ],
    lineMap: [0, 5, 6, 15, 16, 24],
  },
  python: {
    lines: [
      'def cocktail_shaker_sort(arr):',
      '    start, end = 0, len(arr) - 1',
      '    while start < end:',
      '        new_end = start',
      '        for i in range(start, end):',
      '            if arr[i] > arr[i + 1]:',
      '                arr[i], arr[i+1] = arr[i+1], arr[i]',
      '                new_end = i',
      '        end = new_end',
      '        new_start = end',
      '        for i in range(end, start, -1):',
      '            if arr[i - 1] > arr[i]:',
      '                arr[i-1], arr[i] = arr[i], arr[i-1]',
      '                new_start = i',
      '        start = new_start',
    ],
    lineMap: [0, 5, 6, 11, 12, 14],
  },
};

const cocktailShakerSort: AlgorithmInfo = {
  id: 'cocktail-shaker-sort',
  name: 'Cocktail Shaker Sort',
  korName: '칵테일 셰이커 정렬',
  category: '교환 정렬',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: true,
  description:
    '버블 정렬의 양방향 버전입니다. 왼쪽→오른쪽, 오른쪽→왼쪽을 번갈아 수행하여 "거북이 문제"(작은 값이 끝에 있을 때 느린 문제)를 개선합니다.',
  code,
  optimizedCode,
  optimizationTip:
    'swapped 플래그와 마지막 교환 위치를 기록하여 탐색 범위를 축소합니다.\n\n' +
    '정방향 패스에서 마지막으로 교환이 일어난 위치 이후는 이미 정렬되어 있으므로 end를 그 위치로 줄이고, ' +
    '역방향 패스에서도 마지막 교환 위치 이전은 정렬되어 있으므로 start를 그 위치로 올립니다.\n\n' +
    '이 최적화로 불필요한 비교를 크게 줄일 수 있습니다.',
  generateSteps,
};

export default cocktailShakerSort;
