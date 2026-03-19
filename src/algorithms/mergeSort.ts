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
// 1 = 분할
// 2 = 병합 중 비교
// 3 = 병합 중 이동
// 4 = 부분 배열 병합 완료
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '병합 정렬을 시작합니다.',
    codeLine: 0,
  });

  function mergeSort(left: number, right: number) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    // 분할 표시
    const divideStates = new Map<number, BarData['state']>();
    for (let k = left; k <= mid; k++) divideStates.set(k, 'comparing');
    for (let k = mid + 1; k <= right; k++) divideStates.set(k, 'current');
    steps.push({
      bars: makeBars(arrIds, arrVals, divideStates, sortedSet),
      description: `[${left}..${mid}] 와 [${mid + 1}..${right}] 로 분할합니다.`,
      codeLine: 1,
    });

    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  // 현재 구간을 보라색으로 표시하고, 추가 하이라이트를 덮어쓰는 헬퍼
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
      // 비교 (구간 보라 + 비교 대상 강조)
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          rangeStates(left, right, new Map([[i, 'comparing'], [j, 'current']])),
          sortedSet,
        ),
        description: `인덱스 ${i}(값:${arrVals[i]})와 ${j}(값:${arrVals[j]})를 비교합니다.`,
        codeLine: 2,
      });

      if (arrVals[i] <= arrVals[j]) {
        i++;
      } else {
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
          codeLine: 3,
        });
        i++;
        j++;
      }
    }

    // 병합 완료 표시
    steps.push({
      bars: makeBars(arrIds, arrVals, rangeStates(left, right), sortedSet),
      description: `[${left}..${right}] 구간 병합 완료.`,
      codeLine: 4,
    });
  }

  mergeSort(0, n - 1);

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
      'function mergeSort(arr, l, r) {',
      '  if (l >= r) return;',
      '  const mid = Math.floor((l + r) / 2);',
      '  mergeSort(arr, l, mid);',
      '  mergeSort(arr, mid + 1, r);',
      '  merge(arr, l, mid, r);',
      '}',
      '',
      'function merge(arr, l, mid, r) {',
      '  let left = arr.slice(l, mid + 1);',
      '  let right = arr.slice(mid + 1, r + 1);',
      '  let i = 0, j = 0, k = l;',
      '  while (i < left.length && j < right.length) {',
      '    if (left[i] <= right[j]) arr[k++] = left[i++];',
      '    else arr[k++] = right[j++];',
      '  }',
      '  while (i < left.length) arr[k++] = left[i++];',
      '  while (j < right.length) arr[k++] = right[j++];',
      '}',
    ],
    lineMap: [0, 2, 12, 14, 5, 18],
  },
  java: {
    lines: [
      'void mergeSort(int[] arr, int l, int r) {',
      '    if (l >= r) return;',
      '    int mid = (l + r) / 2;',
      '    mergeSort(arr, l, mid);',
      '    mergeSort(arr, mid + 1, r);',
      '    merge(arr, l, mid, r);',
      '}',
      '',
      'void merge(int[] arr, int l, int mid, int r) {',
      '    int[] temp = new int[r - l + 1];',
      '    int i = l, j = mid + 1, k = 0;',
      '    while (i <= mid && j <= r) {',
      '        if (arr[i] <= arr[j]) temp[k++] = arr[i++];',
      '        else temp[k++] = arr[j++];',
      '    }',
      '    while (i <= mid) temp[k++] = arr[i++];',
      '    while (j <= r) temp[k++] = arr[j++];',
      '    System.arraycopy(temp, 0, arr, l, temp.length);',
      '}',
    ],
    lineMap: [0, 2, 11, 13, 5, 18],
  },
  python: {
    lines: [
      'def merge_sort(arr, l, r):',
      '    if l >= r:',
      '        return',
      '    mid = (l + r) // 2',
      '    merge_sort(arr, l, mid)',
      '    merge_sort(arr, mid + 1, r)',
      '    merge(arr, l, mid, r)',
      '',
      'def merge(arr, l, mid, r):',
      '    left = arr[l:mid+1]',
      '    right = arr[mid+1:r+1]',
      '    i = j = 0',
      '    k = l',
      '    while i < len(left) and j < len(right):',
      '        if left[i] <= right[j]:',
      '            arr[k] = left[i]; i += 1',
      '        else:',
      '            arr[k] = right[j]; j += 1',
      '        k += 1',
    ],
    lineMap: [0, 3, 13, 17, 6, 18],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function mergeSort(arr, l, r) {',
      '  if (r - l < 16) {',
      '    insertionSort(arr, l, r); // 작은 구간은 삽입정렬',
      '    return;',
      '  }',
      '  const mid = Math.floor((l + r) / 2);',
      '  mergeSort(arr, l, mid);',
      '  mergeSort(arr, mid + 1, r);',
      '  if (arr[mid] <= arr[mid + 1]) return; // 이미 정렬됨',
      '  merge(arr, l, mid, r);',
      '}',
    ],
    lineMap: [0, 5, 8, 9, 9, 10],
  },
  java: {
    lines: [
      'void mergeSort(int[] arr, int l, int r) {',
      '    if (r - l < 16) {',
      '        insertionSort(arr, l, r); // 작은 구간은 삽입정렬',
      '        return;',
      '    }',
      '    int mid = (l + r) / 2;',
      '    mergeSort(arr, l, mid);',
      '    mergeSort(arr, mid + 1, r);',
      '    if (arr[mid] <= arr[mid + 1]) return; // 이미 정렬됨',
      '    merge(arr, l, mid, r);',
      '}',
    ],
    lineMap: [0, 5, 8, 9, 9, 10],
  },
  python: {
    lines: [
      'def merge_sort(arr, l, r):',
      '    if r - l < 16:',
      '        insertion_sort(arr, l, r)  # 작은 구간은 삽입정렬',
      '        return',
      '    mid = (l + r) // 2',
      '    merge_sort(arr, l, mid)',
      '    merge_sort(arr, mid + 1, r)',
      '    if arr[mid] <= arr[mid + 1]:  # 이미 정렬됨',
      '        return',
      '    merge(arr, l, mid, r)',
    ],
    lineMap: [0, 4, 7, 9, 9, 9],
  },
};

const mergeSort: AlgorithmInfo = {
  id: 'merge-sort',
  name: 'Merge Sort',
  korName: '병합 정렬',
  category: '분할정복',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(n)',
  stable: true,
  description:
    '배열을 반씩 나눈 뒤, 정렬된 부분 배열을 병합하여 전체를 정렬합니다. 항상 O(n log n)을 보장하는 안정 정렬이지만, 추가 메모리 O(n)이 필요합니다.',
  code,
  optimizedCode,
  optimizationTip:
    '두 가지 최적화를 적용할 수 있습니다.\n\n' +
    '1. 작은 구간(16개 이하)에서는 삽입 정렬을 사용합니다. 삽입 정렬은 작은 배열에서 오버헤드가 적어 병합 정렬보다 빠릅니다.\n\n' +
    '2. 병합 전 arr[mid] <= arr[mid+1]이면 이미 정렬된 상태이므로 병합을 생략합니다. 거의 정렬된 배열에서 큰 성능 향상을 얻을 수 있습니다.',
  generateSteps,
};

export default mergeSort;
