export type BarState =
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'pivot'
  | 'current';

export interface BarData {
  id: number;
  value: number;
  state: BarState;
  offsetY?: number; // 수직 오프셋 (삽입 정렬 등에서 요소를 빼내는 효과)
}

export interface AnimationStep {
  bars: BarData[];
  description: string;
  codeLine: number;
}

export interface AlgorithmInfo {
  id: string;
  name: string;
  korName: string;
  category: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable: boolean;
  description: string;
  codeLines: string[];
  generateSteps: (ids: number[], values: number[]) => AnimationStep[];
}
