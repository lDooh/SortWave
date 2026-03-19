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
// 1 = 자릿수 선택
// 2 = 현재 원소의 자릿수 확인
// 3 = 버킷에 배치
// 4 = 자릿수 패스 완료
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '기수 정렬을 시작합니다.',
    codeLine: 0,
  });

  if (n === 0) {
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: '정렬이 완료되었습니다!',
      codeLine: 5,
    });
    return steps;
  }

  const maxVal = Math.max(...arrVals);
  let exp = 1;
  let digitPos = 0;

  while (Math.floor(maxVal / exp) > 0) {
    const digitNames = ['1의 자리', '10의 자리', '100의 자리', '1000의 자리'];
    const digitName = digitPos < digitNames.length ? digitNames[digitPos] : `${exp}의 자리`;

    // 자릿수 패스 시작
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `${digitName}를 기준으로 정렬합니다.`,
      codeLine: 1,
    });

    // 각 원소의 현재 자릿수를 확인
    const buckets: { id: number; val: number }[][] = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arrVals[i] / exp) % 10;
      const stateMap = new Map<number, BarData['state']>([[i, 'current']]);
      steps.push({
        bars: makeBars(arrIds, arrVals, stateMap, sortedSet),
        description: `인덱스 ${i}(값:${arrVals[i]})의 ${digitName} = ${digit} → 버킷 ${digit}에 배치합니다.`,
        codeLine: 2,
      });

      buckets[digit].push({ id: arrIds[i], val: arrVals[i] });
    }

    // 버킷에서 꺼내어 배열 재구성
    let idx = 0;
    for (let b = 0; b < 10; b++) {
      for (const item of buckets[b]) {
        arrIds[idx] = item.id;
        arrVals[idx] = item.val;
        idx++;
      }
    }

    // 배치 완료 후 결과 표시
    const placementStates = new Map<number, BarData['state']>();
    for (let i = 0; i < n; i++) placementStates.set(i, 'swapping');
    steps.push({
      bars: makeBars(arrIds, arrVals, placementStates, sortedSet),
      description: `버킷에서 순서대로 꺼내 배열을 재구성했습니다.`,
      codeLine: 3,
    });

    // 자릿수 패스 완료
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `${digitName} 기준 정렬 패스가 완료되었습니다.`,
      codeLine: 4,
    });

    exp *= 10;
    digitPos++;
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
      'function radixSort(arr) {',
      '  const max = Math.max(...arr);',
      '  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {',
      '    const buckets = Array.from({length: 10}, () => []);',
      '    for (const num of arr) {',
      '      const digit = Math.floor(num / exp) % 10;',
      '      buckets[digit].push(num);',
      '    }',
      '    let idx = 0;',
      '    for (const bucket of buckets) {',
      '      for (const num of bucket) arr[idx++] = num;',
      '    }',
      '  }',
      '}',
    ],
    lineMap: [0, 2, 5, 10, 12, 13],
  },
  java: {
    lines: [
      'void radixSort(int[] arr) {',
      '    int max = Arrays.stream(arr).max().getAsInt();',
      '    for (int exp = 1; max / exp > 0; exp *= 10) {',
      '        List<List<Integer>> buckets = new ArrayList<>();',
      '        for (int i = 0; i < 10; i++) buckets.add(new ArrayList<>());',
      '        for (int num : arr) {',
      '            int digit = (num / exp) % 10;',
      '            buckets.get(digit).add(num);',
      '        }',
      '        int idx = 0;',
      '        for (List<Integer> bucket : buckets) {',
      '            for (int num : bucket) arr[idx++] = num;',
      '        }',
      '    }',
      '}',
    ],
    lineMap: [0, 2, 6, 11, 13, 14],
  },
  python: {
    lines: [
      'def radix_sort(arr):',
      '    max_val = max(arr)',
      '    exp = 1',
      '    while max_val // exp > 0:',
      '        buckets = [[] for _ in range(10)]',
      '        for num in arr:',
      '            digit = (num // exp) % 10',
      '            buckets[digit].append(num)',
      '        idx = 0',
      '        for bucket in buckets:',
      '            for num in bucket:',
      '                arr[idx] = num',
      '                idx += 1',
      '        exp *= 10',
    ],
    lineMap: [0, 3, 6, 11, 13, 13],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function radixSort(arr) {',
      '  const max = Math.max(...arr);',
      '  const RADIX = 256;',
      '  for (let shift = 0; (max >>> shift) > 0; shift += 8) {',
      '    const count = new Array(RADIX).fill(0);',
      '    for (const num of arr) count[(num >>> shift) & 0xFF]++;',
      '    for (let i = 1; i < RADIX; i++) count[i] += count[i-1];',
      '    const output = new Array(arr.length);',
      '    for (let i = arr.length - 1; i >= 0; i--) {',
      '      output[--count[(arr[i] >>> shift) & 0xFF]] = arr[i];',
      '    }',
      '    for (let i = 0; i < arr.length; i++) arr[i] = output[i];',
      '  }',
      '}',
    ],
    lineMap: [0, 3, 5, 11, 12, 13],
  },
  java: {
    lines: [
      'void radixSort(int[] arr) {',
      '    int max = Arrays.stream(arr).max().getAsInt();',
      '    int RADIX = 256;',
      '    for (int shift = 0; (max >>> shift) > 0; shift += 8) {',
      '        int[] count = new int[RADIX];',
      '        for (int num : arr) count[(num >>> shift) & 0xFF]++;',
      '        for (int i = 1; i < RADIX; i++) count[i] += count[i-1];',
      '        int[] output = new int[arr.length];',
      '        for (int i = arr.length - 1; i >= 0; i--) {',
      '            output[--count[(arr[i] >>> shift) & 0xFF]] = arr[i];',
      '        }',
      '        System.arraycopy(output, 0, arr, 0, arr.length);',
      '    }',
      '}',
    ],
    lineMap: [0, 3, 5, 11, 12, 13],
  },
  python: {
    lines: [
      'def radix_sort(arr):',
      '    max_val = max(arr)',
      '    RADIX = 256',
      '    shift = 0',
      '    while (max_val >> shift) > 0:',
      '        count = [0] * RADIX',
      '        for num in arr:',
      '            count[(num >> shift) & 0xFF] += 1',
      '        for i in range(1, RADIX):',
      '            count[i] += count[i - 1]',
      '        output = [0] * len(arr)',
      '        for i in range(len(arr) - 1, -1, -1):',
      '            idx = (arr[i] >> shift) & 0xFF',
      '            count[idx] -= 1',
      '            output[count[idx]] = arr[i]',
      '        arr[:] = output',
      '        shift += 8',
    ],
    lineMap: [0, 4, 7, 15, 16, 16],
  },
};

const radixSort: AlgorithmInfo = {
  id: 'radix-sort',
  name: 'Radix Sort',
  korName: '기수 정렬',
  category: '비교 기반 외',
  timeComplexity: {
    best: 'O(d·n)',
    average: 'O(d·n)',
    worst: 'O(d·n)',
  },
  spaceComplexity: 'O(n+k)',
  stable: true,
  description:
    '각 자릿수(1의 자리, 10의 자리, ...)를 기준으로 안정 정렬을 반복합니다. 비교 기반이 아니며, 자릿수(d) × n에 비례하는 시간이 걸립니다.',
  code,
  optimizedCode,
  optimizationTip:
    '기수(radix)를 10 대신 256으로 사용하면 패스 수를 크게 줄일 수 있습니다.\n\n' +
    '10진법에서는 각 자릿수마다 한 번의 패스가 필요하지만, 256진법(8비트 단위)에서는 32비트 정수를 최대 4번의 패스로 정렬할 수 있습니다.\n\n' +
    '또한 카운팅 배열의 누적합을 이용한 안정 배치로 별도의 버킷 리스트 없이 효율적으로 구현할 수 있습니다.',
  generateSteps,
};

export default radixSort;
