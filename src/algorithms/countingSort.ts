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
// 1 = 카운팅
// 2 = 누적합 계산
// 3 = 배치 (원소 이동)
// 4 = 배치 완료
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '카운팅 정렬을 시작합니다.',
    codeLine: 0,
  });

  const minVal = Math.min(...arrVals);
  const maxVal = Math.max(...arrVals);
  const range = maxVal - minVal + 1;

  // 1단계: 카운팅
  const count = new Array(range).fill(0);
  for (let i = 0; i < n; i++) {
    count[arrVals[i] - minVal]++;
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map([[i, 'current']]), sortedSet),
      description: `인덱스 ${i}(값:${arrVals[i]})을 카운트합니다. count[${arrVals[i] - minVal}] = ${count[arrVals[i] - minVal]}`,
      codeLine: 1,
    });
  }

  // 2단계: 누적합
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '누적합 계산 완료.',
    codeLine: 2,
  });

  // 3단계: 최종 위치 계산 (역순으로 안정성 보장)
  const targetIds = new Array(n);
  const targetVals = new Array(n);
  const countCopy = [...count];

  for (let i = n - 1; i >= 0; i--) {
    const val = arrVals[i];
    const pos = countCopy[val - minVal] - 1;
    countCopy[val - minVal]--;
    targetIds[pos] = arrIds[i];
    targetVals[pos] = arrVals[i];
  }

  // 4단계: cycle sort로 현재 배열을 target 순서로 재배치 (ID 중복 없음)
  // 각 원소를 목표 위치로 보내는 사이클을 추적
  const visited = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (visited[i] || arrIds[i] === targetIds[i]) {
      visited[i] = true;
      continue;
    }

    // 사이클 시작
    let j = i;
    while (!visited[j]) {
      visited[j] = true;
      // targetIds[j]에 있어야 할 원소가 현재 어디에 있는지 찾기
      let from = -1;
      for (let k = 0; k < n; k++) {
        if (arrIds[k] === targetIds[j]) {
          from = k;
          break;
        }
      }
      if (from === -1 || from === j) break;

      // swap
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[j, 'comparing'], [from, 'current']]), sortedSet),
        description: `값 ${arrVals[from]}를 인덱스 ${j}로 이동합니다.`,
        codeLine: 3,
      });

      [arrIds[j], arrIds[from]] = [arrIds[from], arrIds[j]];
      [arrVals[j], arrVals[from]] = [arrVals[from], arrVals[j]];

      sortedSet.add(j);
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[j, 'sorted']]), sortedSet),
        description: `인덱스 ${j}(값:${arrVals[j]})이 확정되었습니다.`,
        codeLine: 4,
      });

      // 다음 사이클 위치
      if (arrIds[from] === targetIds[from]) {
        visited[from] = true;
        sortedSet.add(from);
      }
      j = from;
    }
  }

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
      'function countingSort(arr) {',
      '  const max = Math.max(...arr);',
      '  const count = new Array(max + 1).fill(0);',
      '  const output = new Array(arr.length);',
      '',
      '  for (let i = 0; i < arr.length; i++)',
      '    count[arr[i]]++;',
      '',
      '  for (let i = 1; i <= max; i++)',
      '    count[i] += count[i - 1];',
      '',
      '  for (let i = arr.length - 1; i >= 0; i--) {',
      '    output[count[arr[i]] - 1] = arr[i];',
      '    count[arr[i]]--;',
      '  }',
      '',
      '  for (let i = 0; i < arr.length; i++)',
      '    arr[i] = output[i];',
      '}',
    ],
    lineMap: [0, 6, 9, 12, 16, 18],
  },
  java: {
    lines: [
      'void countingSort(int[] arr) {',
      '    int max = Arrays.stream(arr).max().getAsInt();',
      '    int[] count = new int[max + 1];',
      '    int[] output = new int[arr.length];',
      '',
      '    for (int v : arr) count[v]++;',
      '',
      '    for (int i = 1; i <= max; i++)',
      '        count[i] += count[i - 1];',
      '',
      '    for (int i = arr.length - 1; i >= 0; i--) {',
      '        output[count[arr[i]] - 1] = arr[i];',
      '        count[arr[i]]--;',
      '    }',
      '',
      '    System.arraycopy(output, 0, arr, 0, arr.length);',
      '}',
    ],
    lineMap: [0, 5, 8, 11, 15, 16],
  },
  python: {
    lines: [
      'def counting_sort(arr):',
      '    max_val = max(arr)',
      '    count = [0] * (max_val + 1)',
      '    output = [0] * len(arr)',
      '',
      '    for v in arr:',
      '        count[v] += 1',
      '',
      '    for i in range(1, max_val + 1):',
      '        count[i] += count[i - 1]',
      '',
      '    for i in range(len(arr) - 1, -1, -1):',
      '        output[count[arr[i]] - 1] = arr[i]',
      '        count[arr[i]] -= 1',
      '',
      '    arr[:] = output',
    ],
    lineMap: [0, 6, 9, 12, 15, 15],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function countingSort(arr) {',
      '  const min = Math.min(...arr);',
      '  const max = Math.max(...arr);',
      '  const range = max - min + 1; // 크기 최소화',
      '  const count = new Array(range).fill(0);',
      '  const output = new Array(arr.length);',
      '',
      '  for (let i = 0; i < arr.length; i++)',
      '    count[arr[i] - min]++;',
      '',
      '  for (let i = 1; i < range; i++)',
      '    count[i] += count[i - 1];',
      '',
      '  for (let i = arr.length - 1; i >= 0; i--) {',
      '    output[count[arr[i] - min] - 1] = arr[i];',
      '    count[arr[i] - min]--;',
      '  }',
      '',
      '  for (let i = 0; i < arr.length; i++)',
      '    arr[i] = output[i];',
      '}',
    ],
    lineMap: [0, 8, 11, 14, 18, 20],
  },
  java: {
    lines: [
      'void countingSort(int[] arr) {',
      '    int min = Arrays.stream(arr).min().getAsInt();',
      '    int max = Arrays.stream(arr).max().getAsInt();',
      '    int range = max - min + 1;',
      '    int[] count = new int[range];',
      '    int[] output = new int[arr.length];',
      '',
      '    for (int v : arr) count[v - min]++;',
      '',
      '    for (int i = 1; i < range; i++)',
      '        count[i] += count[i - 1];',
      '',
      '    for (int i = arr.length - 1; i >= 0; i--) {',
      '        output[count[arr[i] - min] - 1] = arr[i];',
      '        count[arr[i] - min]--;',
      '    }',
      '',
      '    System.arraycopy(output, 0, arr, 0, arr.length);',
      '}',
    ],
    lineMap: [0, 7, 10, 13, 17, 18],
  },
  python: {
    lines: [
      'def counting_sort(arr):',
      '    min_val, max_val = min(arr), max(arr)',
      '    range_val = max_val - min_val + 1',
      '    count = [0] * range_val',
      '    output = [0] * len(arr)',
      '',
      '    for v in arr:',
      '        count[v - min_val] += 1',
      '',
      '    for i in range(1, range_val):',
      '        count[i] += count[i - 1]',
      '',
      '    for i in range(len(arr) - 1, -1, -1):',
      '        output[count[arr[i] - min_val] - 1] = arr[i]',
      '        count[arr[i] - min_val] -= 1',
      '',
      '    arr[:] = output',
    ],
    lineMap: [0, 7, 10, 13, 16, 16],
  },
};

const countingSort: AlgorithmInfo = {
  id: 'counting-sort',
  name: 'Counting Sort',
  korName: '카운팅 정렬',
  category: '비교 기반 외',
  timeComplexity: {
    best: 'O(n+k)',
    average: 'O(n+k)',
    worst: 'O(n+k)',
  },
  spaceComplexity: 'O(n+k)',
  stable: true,
  description:
    '각 값의 개수를 세어 정렬합니다. 비교 기반이 아니므로 O(n+k)로 매우 빠르지만, 값의 범위(k)가 클 경우 메모리를 많이 사용합니다.',
  code,
  optimizedCode,
  optimizationTip:
    '최솟값(min)을 빼서 count 배열 크기를 max-min+1로 최소화합니다.\n\n' +
    '값의 범위가 크지만 최솟값이 0보다 훨씬 큰 경우(예: 1000~1050) 메모리를 크게 절약할 수 있습니다.\n\n' +
    '역순 순회로 안정성(같은 값의 상대적 순서 유지)을 보장합니다.',
  generateSteps,
};

export default countingSort;
