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
// 1 = 힙 구축 (heapify)
// 2 = 비교 (자식 노드와)
// 3 = 교환
// 4 = 루트를 끝으로 이동
// 5 = 함수 끝

function generateSteps(ids: number[], values: number[]): AnimationStep[] {
  const arrIds = [...ids];
  const arrVals = [...values];
  const steps: AnimationStep[] = [];
  const n = arrIds.length;
  const sortedSet = new Set<number>();

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '힙 정렬을 시작합니다. 먼저 최대 힙을 구축합니다.',
    codeLine: 0,
  });

  function heapify(size: number, root: number, phase: string) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    // 왼쪽 자식 비교
    if (left < size) {
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[root, 'current'], [left, 'comparing']]),
          sortedSet,
        ),
        description: `${phase}: 노드 ${root}(값:${arrVals[root]})과 왼쪽 자식 ${left}(값:${arrVals[left]})을 비교합니다.`,
        codeLine: 2,
      });
      if (arrVals[left] > arrVals[largest]) {
        largest = left;
      }
    }

    // 오른쪽 자식 비교
    if (right < size) {
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[largest, 'current'], [right, 'comparing']]),
          sortedSet,
        ),
        description: `${phase}: 현재 최대 ${largest}(값:${arrVals[largest]})과 오른쪽 자식 ${right}(값:${arrVals[right]})을 비교합니다.`,
        codeLine: 2,
      });
      if (arrVals[right] > arrVals[largest]) {
        largest = right;
      }
    }

    if (largest !== root) {
      // 교환
      [arrIds[root], arrIds[largest]] = [arrIds[largest], arrIds[root]];
      [arrVals[root], arrVals[largest]] = [arrVals[largest], arrVals[root]];
      steps.push({
        bars: makeBars(
          arrIds, arrVals,
          new Map([[root, 'swapping'], [largest, 'swapping']]),
          sortedSet,
        ),
        description: `${phase}: 인덱스 ${root}과 ${largest}를 교환했습니다.`,
        codeLine: 3,
      });

      // 재귀적으로 heapify
      heapify(size, largest, phase);
    }
  }

  // 1단계: 최대 힙 구축
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map([[i, 'pivot']]), sortedSet),
      description: `힙 구축: 노드 ${i}에서 heapify를 시작합니다.`,
      codeLine: 1,
    });
    heapify(n, i, '힙 구축');
  }

  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '최대 힙 구축 완료. 이제 정렬을 시작합니다.',
    codeLine: 1,
  });

  // 2단계: 하나씩 추출
  for (let i = n - 1; i > 0; i--) {
    // 루트(최대)를 끝으로 교환
    steps.push({
      bars: makeBars(
        arrIds, arrVals,
        new Map([[0, 'swapping'], [i, 'swapping']]),
        sortedSet,
      ),
      description: `루트(값:${arrVals[0]})와 인덱스 ${i}(값:${arrVals[i]})를 교환합니다.`,
      codeLine: 4,
    });

    [arrIds[0], arrIds[i]] = [arrIds[i], arrIds[0]];
    [arrVals[0], arrVals[i]] = [arrVals[i], arrVals[0]];

    sortedSet.add(i);
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `인덱스 ${i}(값:${arrVals[i]})이 확정되었습니다. 힙 크기: ${i}`,
      codeLine: 4,
    });

    // 줄어든 힙에서 heapify
    heapify(i, 0, '정렬');
  }

  sortedSet.add(0);
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
      'function heapSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = Math.floor(n/2) - 1; i >= 0; i--)',
      '    heapify(arr, n, i);',
      '  for (let i = n - 1; i > 0; i--) {',
      '    [arr[0], arr[i]] = [arr[i], arr[0]];',
      '    heapify(arr, i, 0);',
      '  }',
      '}',
      '',
      'function heapify(arr, size, root) {',
      '  let largest = root;',
      '  const l = 2 * root + 1, r = 2 * root + 2;',
      '  if (l < size && arr[l] > arr[largest]) largest = l;',
      '  if (r < size && arr[r] > arr[largest]) largest = r;',
      '  if (largest !== root) {',
      '    [arr[root], arr[largest]] = [arr[largest], arr[root]];',
      '    heapify(arr, size, largest);',
      '  }',
      '}',
    ],
    lineMap: [0, 2, 13, 16, 5, 19],
  },
  java: {
    lines: [
      'void heapSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = n/2 - 1; i >= 0; i--)',
      '        heapify(arr, n, i);',
      '    for (int i = n - 1; i > 0; i--) {',
      '        int temp = arr[0];',
      '        arr[0] = arr[i];',
      '        arr[i] = temp;',
      '        heapify(arr, i, 0);',
      '    }',
      '}',
      '',
      'void heapify(int[] arr, int size, int root) {',
      '    int largest = root;',
      '    int l = 2 * root + 1, r = 2 * root + 2;',
      '    if (l < size && arr[l] > arr[largest]) largest = l;',
      '    if (r < size && arr[r] > arr[largest]) largest = r;',
      '    if (largest != root) {',
      '        int temp = arr[root];',
      '        arr[root] = arr[largest];',
      '        arr[largest] = temp;',
      '        heapify(arr, size, largest);',
      '    }',
      '}',
    ],
    lineMap: [0, 2, 15, 18, 5, 23],
  },
  python: {
    lines: [
      'def heap_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n // 2 - 1, -1, -1):',
      '        heapify(arr, n, i)',
      '    for i in range(n - 1, 0, -1):',
      '        arr[0], arr[i] = arr[i], arr[0]',
      '        heapify(arr, i, 0)',
      '',
      'def heapify(arr, size, root):',
      '    largest = root',
      '    l, r = 2 * root + 1, 2 * root + 2',
      '    if l < size and arr[l] > arr[largest]:',
      '        largest = l',
      '    if r < size and arr[r] > arr[largest]:',
      '        largest = r',
      '    if largest != root:',
      '        arr[root], arr[largest] = arr[largest], arr[root]',
      '        heapify(arr, size, largest)',
    ],
    lineMap: [0, 2, 11, 16, 5, 17],
  },
};

const optimizedCode: Record<Language, CodeBlock> = {
  js: {
    lines: [
      'function heapSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = Math.floor(n/2) - 1; i >= 0; i--)',
      '    siftDown(arr, n, i);',
      '  for (let i = n - 1; i > 0; i--) {',
      '    [arr[0], arr[i]] = [arr[i], arr[0]];',
      '    siftDown(arr, i, 0);',
      '  }',
      '}',
      '',
      '// 반복문 기반 siftDown (재귀 제거)',
      'function siftDown(arr, size, root) {',
      '  while (true) {',
      '    let largest = root;',
      '    const l = 2 * root + 1, r = 2 * root + 2;',
      '    if (l < size && arr[l] > arr[largest]) largest = l;',
      '    if (r < size && arr[r] > arr[largest]) largest = r;',
      '    if (largest === root) break;',
      '    [arr[root], arr[largest]] = [arr[largest], arr[root]];',
      '    root = largest;',
      '  }',
      '}',
    ],
    lineMap: [0, 2, 15, 18, 5, 21],
  },
  java: {
    lines: [
      'void heapSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = n/2 - 1; i >= 0; i--)',
      '        siftDown(arr, n, i);',
      '    for (int i = n - 1; i > 0; i--) {',
      '        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;',
      '        siftDown(arr, i, 0);',
      '    }',
      '}',
      '',
      '// 반복문 기반 siftDown (재귀 제거)',
      'void siftDown(int[] arr, int size, int root) {',
      '    while (true) {',
      '        int largest = root;',
      '        int l = 2*root+1, r = 2*root+2;',
      '        if (l < size && arr[l] > arr[largest]) largest = l;',
      '        if (r < size && arr[r] > arr[largest]) largest = r;',
      '        if (largest == root) break;',
      '        int t = arr[root]; arr[root] = arr[largest]; arr[largest] = t;',
      '        root = largest;',
      '    }',
      '}',
    ],
    lineMap: [0, 2, 15, 18, 5, 21],
  },
  python: {
    lines: [
      'def heap_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n // 2 - 1, -1, -1):',
      '        sift_down(arr, n, i)',
      '    for i in range(n - 1, 0, -1):',
      '        arr[0], arr[i] = arr[i], arr[0]',
      '        sift_down(arr, i, 0)',
      '',
      '# 반복문 기반 sift_down (재귀 제거)',
      'def sift_down(arr, size, root):',
      '    while True:',
      '        largest = root',
      '        l, r = 2*root+1, 2*root+2',
      '        if l < size and arr[l] > arr[largest]: largest = l',
      '        if r < size and arr[r] > arr[largest]: largest = r',
      '        if largest == root: break',
      '        arr[root], arr[largest] = arr[largest], arr[root]',
      '        root = largest',
    ],
    lineMap: [0, 2, 13, 16, 5, 17],
  },
};

const heapSort: AlgorithmInfo = {
  id: 'heap-sort',
  name: 'Heap Sort',
  korName: '힙 정렬',
  category: '힙',
  timeComplexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
  },
  spaceComplexity: 'O(1)',
  stable: false,
  description:
    '배열을 최대 힙으로 구축한 뒤, 루트(최대값)를 배열 끝으로 보내고 힙 크기를 줄이며 반복합니다. 항상 O(n log n)을 보장하며 추가 메모리가 필요 없는 제자리 정렬입니다.',
  code,
  optimizedCode,
  optimizationTip:
    '재귀적 heapify를 반복문 기반 siftDown으로 변경합니다.\n\n' +
    '재귀 호출의 함수 호출 오버헤드와 스택 사용을 제거하여 실제 성능이 향상됩니다.\n\n' +
    'while 루프 안에서 root를 largest로 갱신하며 내려가는 방식으로 동일한 동작을 합니다.',
  generateSteps,
};

export default heapSort;
