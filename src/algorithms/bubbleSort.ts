import type { AlgorithmInfo, AnimationStep, BarData } from '../types';

function makeBars(ids: number[], values: number[], states: Map<number, BarData['state']>, sortedSet: Set<number>): BarData[] {
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

  // 초기 상태
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '버블 정렬을 시작합니다.',
    codeLine: 0,
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // 비교 단계 - 노란색
      steps.push({
        bars: makeBars(arrIds, arrVals, new Map([[j, 'comparing'], [j + 1, 'comparing']]), sortedSet),
        description: `인덱스 ${j}(값:${arrVals[j]})와 ${j + 1}(값:${arrVals[j + 1]})을 비교합니다.`,
        codeLine: 3,
      });

      if (arrVals[j] > arrVals[j + 1]) {
        // 교환 표시 - 빨간색 (아직 교환 전 위치)
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j, 'swapping'], [j + 1, 'swapping']]), sortedSet),
          description: `${arrVals[j]} > ${arrVals[j + 1]} 이므로 교환합니다.`,
          codeLine: 5,
        });

        // 실제 교환 (id와 value 모두) - 빨간색 + 위치 이동됨
        [arrIds[j], arrIds[j + 1]] = [arrIds[j + 1], arrIds[j]];
        [arrVals[j], arrVals[j + 1]] = [arrVals[j + 1], arrVals[j]];
        steps.push({
          bars: makeBars(arrIds, arrVals, new Map([[j, 'swapping'], [j + 1, 'swapping']]), sortedSet),
          description: `교환 완료: [${arrVals[j]}, ${arrVals[j + 1]}]`,
          codeLine: 5,
        });
      }
    }
    // 패스 완료 → 맨 뒤 원소 정렬 확정
    sortedSet.add(n - 1 - i);
    steps.push({
      bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
      description: `패스 ${i + 1} 완료. 인덱스 ${n - 1 - i}(값:${arrVals[n - 1 - i]})이 확정되었습니다.`,
      codeLine: 2,
    });
  }

  // 마지막 원소도 정렬 확정
  sortedSet.add(0);
  steps.push({
    bars: makeBars(arrIds, arrVals, new Map(), sortedSet),
    description: '정렬이 완료되었습니다!',
    codeLine: 8,
  });

  return steps;
}

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
  codeLines: [
    'function bubbleSort(arr) {',
    '  const n = arr.length;',
    '  for (let i = 0; i < n - 1; i++) {',
    '    for (let j = 0; j < n - i - 1; j++) {',
    '      if (arr[j] > arr[j + 1]) {',
    '        swap(arr, j, j + 1);',
    '      }',
    '    }',
    '  }',
    '}',
  ],
  generateSteps,
};

export default bubbleSort;
