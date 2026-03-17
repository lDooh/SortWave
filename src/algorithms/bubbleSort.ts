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
    description: '버블 정렬을 시작합니다.',
    codeLine: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[j, 'comparing'], [j + 1, 'comparing']]), sortedSet),
        description: `인덱스 ${j}(값:${arrVals[j]})와 ${j + 1}(값:${arrVals[j + 1]})을 비교합니다.`,
        codeLine: 1,
      });

      if (arrVals[j] > arrVals[j + 1]) {
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j, 'swapping'], [j + 1, 'swapping']]), sortedSet),
          description: `${arrVals[j]} > ${arrVals[j + 1]} 이므로 교환합니다.`,
          codeLine: 2,
        });

        [arrIds[j], arrIds[j + 1]] = [arrIds[j + 1], arrIds[j]];
        [arrVals[j], arrVals[j + 1]] = [arrVals[j + 1], arrVals[j]];
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j, 'swapping'], [j + 1, 'swapping']]), sortedSet),
          description: `교환 완료: [${arrVals[j]}, ${arrVals[j + 1]}]`,
          codeLine: 3,
        });
      }
    }
    sortedSet.add(n - 1 - i);
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `패스 ${i + 1} 완료. 인덱스 ${n - 1 - i}(값:${arrVals[n - 1 - i]})이 확정되었습니다.`,
      codeLine: 4,
    });
  }

  sortedSet.add(0);
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '정렬이 완료되었습니다!',
    codeLine: 5,
  });

  return steps;
}

// codeLine 논리 값:
// 0 = 함수 시작
// 1 = 비교 (if arr[j] > arr[j+1])
// 2 = 교환 시작 (swap)
// 3 = 교환 완료
// 4 = 외부 루프 끝
// 5 = 함수 끝

const code: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function bubbleSort(arr) {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    for (let j = 0; j < arr.length - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '      }',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 3, 4, 4, 1, 8],
  },
  java: {
    lines: [
      'void bubbleSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        for (int j = 0; j < n - i - 1; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                int temp = arr[j];',
      '                arr[j] = arr[j + 1];',
      '                arr[j + 1] = temp;',
      '            }',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 4, 5, 7, 2, 11],
  },
  python: {
    lines: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        for j in range(n - i - 1):',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j+1] = arr[j+1], arr[j]',
    ],
    lineMap: [0, 4, 5, 5, 2, 5],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function bubbleSort(arr) {',
      '  for (let i = 0; i < arr.length - 1; i++) {',
      '    let swapped = false;',
      '    for (let j = 0; j < arr.length - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '        swapped = true;',
      '      }',
      '    }',
      '    if (!swapped) break;',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 5, 6, 1, 11],
  },
  java: {
    lines: [
      'void bubbleSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        boolean swapped = false;',
      '        for (int j = 0; j < n - i - 1; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                int temp = arr[j];',
      '                arr[j] = arr[j + 1];',
      '                arr[j + 1] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break;',
      '    }',
      '}',
    ],
    lineMap: [0, 5, 6, 9, 2, 14],
  },
  python: {
    lines: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n - 1):',
      '        swapped = False',
      '        for j in range(n - i - 1):',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j+1] = arr[j+1], arr[j]',
      '                swapped = True',
      '        if not swapped:',
      '            break',
    ],
    lineMap: [0, 5, 6, 7, 2, 9],
  },
};

const bubbleSort: AlgorithmInfo = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  korName: '버블 정렬',
  category: '교환 정렬',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: true,
  description:
    '인접한 두 원소를 비교하여 잘못된 순서라면 교환합니다. 한 패스를 돌 때마다 가장 큰 원소가 배열의 끝으로 이동(버블)합니다. 구현이 단순하지만 O(n²)으로 느린 정렬입니다.',
  code,
  optimizedCode,
  optimizationTip:
    '이미 정렬된 배열이나 거의 정렬된 배열에서 불필요한 패스를 줄일 수 있습니다.\n\n' +
    'swapped 플래그를 추가하여 한 패스에서 교환이 한 번도 일어나지 않으면 배열이 이미 정렬된 것이므로 즉시 종료합니다.\n\n' +
    '이 최적화로 최선의 경우(이미 정렬된 배열) 시간복잡도가 O(n)이 됩니다.',
  generateSteps,
};

export default bubbleSort;
