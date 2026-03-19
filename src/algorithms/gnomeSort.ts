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
// 0 = 함수 시작 (pos = 0)
// 1 = 비교 (arr[pos] >= arr[pos-1])
// 2 = 교환 및 뒤로 이동 (swap, pos--)
// 3 = 앞으로 이동 (pos++)
// 4 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '놈 정렬을 시작합니다. pos = 0에서 출발합니다.',
    codeLine: 0,
  });

  let pos = 0;

  while (pos < n) {
    if (pos === 0) {
      // pos가 0이면 앞으로 이동
      pos++;
      if (pos < n) {
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[pos, 'current']]), sortedSet),
          description: `pos = ${pos}로 앞으로 이동합니다.`,
          codeLine: 3,
        });
      }
    } else if (arrVals[pos] >= arrVals[pos - 1]) {
      // 비교: 현재 원소가 이전 원소보다 크거나 같음 → 앞으로 이동
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[pos - 1, 'comparing'], [pos, 'comparing']]), sortedSet),
        description: `인덱스 ${pos}(값:${arrVals[pos]}) ≥ 인덱스 ${pos - 1}(값:${arrVals[pos - 1]}) → 앞으로 이동합니다.`,
        codeLine: 1,
      });
      pos++;
      if (pos < n) {
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[pos, 'current']]), sortedSet),
          description: `pos = ${pos}로 앞으로 이동합니다.`,
          codeLine: 3,
        });
      }
    } else {
      // 비교: 현재 원소가 이전 원소보다 작음 → 교환 후 뒤로 이동
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[pos - 1, 'comparing'], [pos, 'comparing']]), sortedSet),
        description: `인덱스 ${pos}(값:${arrVals[pos]}) < 인덱스 ${pos - 1}(값:${arrVals[pos - 1]}) → 교환합니다.`,
        codeLine: 1,
      });

      const desc = `${arrVals[pos - 1]}와 ${arrVals[pos]}을 교환하고 뒤로 이동합니다.`;
      [arrIds[pos], arrIds[pos - 1]] = [arrIds[pos - 1], arrIds[pos]];
      [arrVals[pos], arrVals[pos - 1]] = [arrVals[pos - 1], arrVals[pos]];

      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[pos - 1, 'swapping'], [pos, 'swapping']]), sortedSet),
        description: desc,
        codeLine: 2,
      });

      pos--;
    }
  }

  // 정렬 완료 - 모든 인덱스를 sorted로 표시
  for (let i = 0; i < n; i++) sortedSet.add(i);
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '정렬이 완료되었습니다!',
    codeLine: 4,
  });

  return steps;
}

const code: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function gnomeSort(arr) {',
      '  let pos = 0;',
      '  while (pos < arr.length) {',
      '    if (pos === 0 || arr[pos] >= arr[pos - 1]) {',
      '      pos++;',
      '    } else {',
      '      [arr[pos], arr[pos-1]] = [arr[pos-1], arr[pos]];',
      '      pos--;',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 3, 6, 4, 10],
  },
  java: {
    lines: [
      'void gnomeSort(int[] arr) {',
      '    int pos = 0;',
      '    while (pos < arr.length) {',
      '        if (pos == 0 || arr[pos] >= arr[pos - 1]) {',
      '            pos++;',
      '        } else {',
      '            int temp = arr[pos];',
      '            arr[pos] = arr[pos - 1];',
      '            arr[pos - 1] = temp;',
      '            pos--;',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 3, 6, 4, 12],
  },
  python: {
    lines: [
      'def gnome_sort(arr):',
      '    pos = 0',
      '    while pos < len(arr):',
      '        if pos == 0 or arr[pos] >= arr[pos - 1]:',
      '            pos += 1',
      '        else:',
      '            arr[pos], arr[pos-1] = arr[pos-1], arr[pos]',
      '            pos -= 1',
    ],
    lineMap: [0, 3, 6, 4, 7],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function gnomeSort(arr) {',
      '  let pos = 0;',
      '  let teleport = 0;',
      '  while (pos < arr.length) {',
      '    if (pos === 0 || arr[pos] >= arr[pos - 1]) {',
      '      if (teleport > pos) pos = teleport;',
      '      pos++;',
      '      teleport = pos;',
      '    } else {',
      '      [arr[pos], arr[pos-1]] = [arr[pos-1], arr[pos]];',
      '      pos--;',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 9, 5, 13],
  },
  java: {
    lines: [
      'void gnomeSort(int[] arr) {',
      '    int pos = 0;',
      '    int teleport = 0;',
      '    while (pos < arr.length) {',
      '        if (pos == 0 || arr[pos] >= arr[pos - 1]) {',
      '            if (teleport > pos) pos = teleport;',
      '            pos++;',
      '            teleport = pos;',
      '        } else {',
      '            int temp = arr[pos];',
      '            arr[pos] = arr[pos - 1];',
      '            arr[pos - 1] = temp;',
      '            pos--;',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 4, 9, 5, 15],
  },
  python: {
    lines: [
      'def gnome_sort(arr):',
      '    pos = 0',
      '    teleport = 0',
      '    while pos < len(arr):',
      '        if pos == 0 or arr[pos] >= arr[pos - 1]:',
      '            if teleport > pos:',
      '                pos = teleport',
      '            pos += 1',
      '            teleport = pos',
      '        else:',
      '            arr[pos], arr[pos-1] = arr[pos-1], arr[pos]',
      '            pos -= 1',
    ],
    lineMap: [0, 4, 10, 5, 11],
  },
};

const gnomeSort: AlgorithmInfo = {
  id: 'gnome-sort',
  name: 'Gnome Sort',
  korName: '놈 정렬',
  category: '교환 정렬',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
  },
  spaceComplexity: 'O(1)',
  stable: true,
  description:
    '정원사(gnome)가 화분을 정렬하는 방식입니다. 현재 원소가 이전 원소보다 작으면 교환하고 뒤로 돌아가며, 크거나 같으면 앞으로 진행합니다. 삽입 정렬과 유사하지만 구현이 더 단순합니다.',
  code,
  optimizedCode,
  optimizationTip:
    '앞으로 돌아갈 위치를 기억하여 불필요한 비교를 생략합니다 (Teleporting Gnome Sort).\n\n' +
    'teleport 변수에 마지막으로 앞으로 나아갔던 위치를 저장하여, 뒤로 이동한 후 다시 앞으로 돌아올 때 이미 비교했던 구간을 건너뜁니다.\n\n' +
    '이 최적화로 불필요한 비교 횟수를 줄여 실행 시간을 개선합니다.',
  generateSteps,
};

export default gnomeSort;
