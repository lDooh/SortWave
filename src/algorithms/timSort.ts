import type { AlgorithmInfo, AnimationStep, BarData, CodeBlock, Language } from '../types';

const RUN_SIZE = 4;

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
// 1 = run에 대한 삽입 정렬
// 2 = 삽입 정렬 중 비교
// 3 = 삽입 정렬 중 교환
// 4 = run 병합
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '팀 정렬을 시작합니다. 배열을 run 단위로 나눠 삽입 정렬한 뒤 병합합니다.',
    codeLine: 0,
  });

  // Phase 1: Split into runs and insertion sort each run
  for (let start = 0; start < n; start += RUN_SIZE) {
    const end = Math.min(start + RUN_SIZE - 1, n - 1);

    // Show run boundaries
    const runStates = new Map<number, BarData['state']>();
    for (let k = start; k <= end; k++) runStates.set(k, 'pivot');
    steps.push({
      bars: makeBars(arrIds, arrVals, runStates, sortedSet),
      description: `run [${start}..${end}] 구간을 삽입 정렬합니다.`,
      codeLine: 1,
    });

    // Insertion sort on this run
    for (let i = start + 1; i <= end; i++) {
      const keyVal = arrVals[i];

      let j = i;
      while (j > start && arrVals[j - 1] > arrVals[j]) {
        // Compare
        const cmpStates = new Map<number, BarData['state']>();
        for (let k = start; k <= end; k++) cmpStates.set(k, 'pivot');
        cmpStates.set(j - 1, 'comparing');
        cmpStates.set(j, 'current');
        steps.push({
          bars: makeBars(arrIds, arrVals, cmpStates, sortedSet, new Map([[j, 50]])),
          description: `인덱스 ${j - 1}(값:${arrVals[j - 1]}) > ${keyVal} → 교환합니다.`,
          codeLine: 2,
        });

        // Adjacent swap
        [arrIds[j], arrIds[j - 1]] = [arrIds[j - 1], arrIds[j]];
        [arrVals[j], arrVals[j - 1]] = [arrVals[j - 1], arrVals[j]];

        const swapStates = new Map<number, BarData['state']>();
        for (let k = start; k <= end; k++) swapStates.set(k, 'pivot');
        swapStates.set(j - 1, 'current');
        swapStates.set(j, 'swapping');
        steps.push({
          bars: makeBars(arrIds, arrVals, swapStates, sortedSet, new Map([[j - 1, 50]])),
          description: `인덱스 ${j}과 ${j - 1}을 교환했습니다.`,
          codeLine: 3,
        });

        j--;
      }

      // Compare stop (element in correct position within run)
      if (j > start) {
        const stopStates = new Map<number, BarData['state']>();
        for (let k = start; k <= end; k++) stopStates.set(k, 'pivot');
        stopStates.set(j - 1, 'comparing');
        stopStates.set(j, 'current');
        steps.push({
          bars: makeBars(arrIds, arrVals, stopStates, sortedSet, new Map([[j, 50]])),
          description: `인덱스 ${j - 1}(값:${arrVals[j - 1]}) ≤ ${keyVal} → 탐색 종료.`,
          codeLine: 2,
        });
      }
    }
  }

  // Phase 2: Merge runs bottom-up
  function rangeStates(left: number, right: number, extra?: Map<number, BarData['state']>) {
    const states = new Map<number, BarData['state']>();
    for (let k = left; k <= right; k++) states.set(k, 'pivot');
    if (extra) extra.forEach((v, k) => states.set(k, v));
    return states;
  }

  function merge(left: number, mid: number, right: number) {
    let i = left;
    let j = mid + 1;

    while (i <= j && j <= right) {
      // Compare
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          rangeStates(left, right, new Map([[i, 'comparing'], [j, 'current']])),
          sortedSet,
        ),
        description: `인덱스 ${i}(값:${arrVals[i]})와 ${j}(값:${arrVals[j]})를 비교합니다.`,
        codeLine: 4,
      });

      if (arrVals[i] <= arrVals[j]) {
        i++;
      } else {
        // Move element at j to position i via adjacent swaps
        let k = j;
        while (k > i) {
          [arrIds[k], arrIds[k - 1]] = [arrIds[k - 1], arrIds[k]];
          [arrVals[k], arrVals[k - 1]] = [arrVals[k - 1], arrVals[k]];
          k--;
        }
        steps.push({
          bars: makeBars(
            arrIds, arrVals,
            rangeStates(left, right, new Map([[i, 'swapping']])),
            sortedSet,
          ),
          description: `값 ${arrVals[i]}를 인덱스 ${i}로 이동했습니다.`,
          codeLine: 4,
        });
        i++;
        j++;
      }
    }

    // Merge complete for this range
    steps.push({
      bars: makeBars(arrIds, arrVals, rangeStates(left, right), sortedSet),
      description: `[${left}..${right}] 구간 병합 완료.`,
      codeLine: 4,
    });
  }

  for (let size = RUN_SIZE; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);

      if (mid < right) {
        steps.push({
          bars: makeBars(
            arrIds, arrVals,
            rangeStates(left, right),
            sortedSet,
          ),
          description: `run [${left}..${mid}]와 [${mid + 1}..${right}]를 병합합니다. (병합 크기: ${size * 2})`,
          codeLine: 4,
        });
        merge(left, mid, right);
      }
    }
  }

  // All sorted
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
      'function timSort(arr) {',
      '  const RUN = 32;',
      '  const n = arr.length;',
      '  // 각 run을 삽입 정렬',
      '  for (let i = 0; i < n; i += RUN) {',
      '    insertionSort(arr, i, Math.min(i + RUN - 1, n - 1));',
      '  }',
      '  // run들을 병합',
      '  for (let size = RUN; size < n; size *= 2) {',
      '    for (let left = 0; left < n; left += 2 * size) {',
      '      let mid = Math.min(left + size - 1, n - 1);',
      '      let right = Math.min(left + 2 * size - 1, n - 1);',
      '      if (mid < right) merge(arr, left, mid, right);',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 4, 5, 5, 8, 15],
  },
  java: {
    lines: [
      'void timSort(int[] arr) {',
      '    int RUN = 32;',
      '    int n = arr.length;',
      '    // 각 run을 삽입 정렬',
      '    for (int i = 0; i < n; i += RUN) {',
      '        insertionSort(arr, i, Math.min(i + RUN - 1, n - 1));',
      '    }',
      '    // run들을 병합',
      '    for (int size = RUN; size < n; size *= 2) {',
      '        for (int left = 0; left < n; left += 2 * size) {',
      '            int mid = Math.min(left + size - 1, n - 1);',
      '            int right = Math.min(left + 2 * size - 1, n - 1);',
      '            if (mid < right) merge(arr, left, mid, right);',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 4, 5, 5, 8, 15],
  },
  python: {
    lines: [
      'def tim_sort(arr):',
      '    RUN = 32',
      '    n = len(arr)',
      '    # 각 run을 삽입 정렬',
      '    for i in range(0, n, RUN):',
      '        insertion_sort(arr, i, min(i + RUN - 1, n - 1))',
      '    # run들을 병합',
      '    size = RUN',
      '    while size < n:',
      '        for left in range(0, n, 2 * size):',
      '            mid = min(left + size - 1, n - 1)',
      '            right = min(left + 2 * size - 1, n - 1)',
      '            if mid < right:',
      '                merge(arr, left, mid, right)',
      '        size *= 2',
    ],
    lineMap: [0, 4, 5, 5, 8, 14],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function timSort(arr) {',
      '  const n = arr.length;',
      '  // 자연적 run 탐지',
      '  let runs = [];',
      '  let i = 0;',
      '  while (i < n) {',
      '    let runEnd = i + 1;',
      '    if (runEnd < n && arr[runEnd] < arr[i]) {',
      '      while (runEnd < n && arr[runEnd] < arr[runEnd - 1]) runEnd++;',
      '      reverse(arr, i, runEnd - 1); // 내림차순 → 오름차순',
      '    } else {',
      '      while (runEnd < n && arr[runEnd] >= arr[runEnd - 1]) runEnd++;',
      '    }',
      '    runs.push([i, runEnd - 1]);',
      '    i = runEnd;',
      '  }',
      '  // 탐지된 run들을 병합',
      '  mergeRuns(arr, runs);',
      '}',
    ],
    lineMap: [0, 5, 7, 9, 17, 18],
  },
  java: {
    lines: [
      'void timSort(int[] arr) {',
      '    int n = arr.length;',
      '    // 자연적 run 탐지',
      '    List<int[]> runs = new ArrayList<>();',
      '    int i = 0;',
      '    while (i < n) {',
      '        int runEnd = i + 1;',
      '        if (runEnd < n && arr[runEnd] < arr[i]) {',
      '            while (runEnd < n && arr[runEnd] < arr[runEnd-1]) runEnd++;',
      '            reverse(arr, i, runEnd - 1); // 내림차순 → 오름차순',
      '        } else {',
      '            while (runEnd < n && arr[runEnd] >= arr[runEnd-1]) runEnd++;',
      '        }',
      '        runs.add(new int[]{i, runEnd - 1});',
      '        i = runEnd;',
      '    }',
      '    // 탐지된 run들을 병합',
      '    mergeRuns(arr, runs);',
      '}',
    ],
    lineMap: [0, 5, 7, 9, 17, 18],
  },
  python: {
    lines: [
      'def tim_sort(arr):',
      '    n = len(arr)',
      '    # 자연적 run 탐지',
      '    runs = []',
      '    i = 0',
      '    while i < n:',
      '        run_end = i + 1',
      '        if run_end < n and arr[run_end] < arr[i]:',
      '            while run_end < n and arr[run_end] < arr[run_end-1]:',
      '                run_end += 1',
      '            arr[i:run_end] = arr[i:run_end][::-1]  # 내림차순 → 오름차순',
      '        else:',
      '            while run_end < n and arr[run_end] >= arr[run_end-1]:',
      '                run_end += 1',
      '        runs.append((i, run_end - 1))',
      '        i = run_end',
      '    # 탐지된 run들을 병합',
      '    merge_runs(arr, runs)',
    ],
    lineMap: [0, 5, 7, 10, 17, 17],
  },
};

const timSort: AlgorithmInfo = {
  id: 'tim-sort',
  name: 'Tim Sort',
  korName: '팀 정렬',
  category: '하이브리드',
  timeComplexity: {
    best: 'O(n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  stable: true,
  description:
    'Python과 Java의 내장 정렬 알고리즘입니다. 배열을 작은 구간(run)으로 나눠 삽입 정렬한 뒤, 병합 정렬로 합칩니다. 실제 데이터의 부분적 정렬을 활용하여 매우 효율적입니다.',
  code,
  optimizedCode,
  optimizationTip:
    '자연적 run 탐지를 활용합니다.\n\n' +
    '고정 크기 run 대신, 이미 정렬된 부분(오름차순 또는 내림차순)을 자동으로 인식하여 run으로 활용합니다.\n\n' +
    '내림차순 run은 뒤집어서 오름차순으로 변환합니다. 부분적으로 정렬된 실제 데이터에서 삽입 정렬 단계를 크게 줄여 성능이 향상됩니다.',
  generateSteps,
};

export default timSort;
