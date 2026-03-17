export type BarState =
  | 'default'
  | 'comparing'
  | 'swapping'
  | 'sorted'
  | 'pivot'
  | 'current';

export type Language = 'js' | 'java' | 'python';

export interface BarData {
  id: number;
  value: number;
  state: BarState;
  offsetY?: number;
}

export interface CodeBlock {
  lines: string[];
  lineMap: number[]; // codeLine(논리적 단계) → 해당 언어의 실제 줄 인덱스
}

export interface AnimationStep {
  bars: BarData[];
  description: string;
  codeLine: number; // 논리적 단계 번호 (각 언어의 lineMap으로 실제 줄 매핑)
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
  code: Record<Language, CodeBlock>;
  optimizedCode: Record<Language, CodeBlock>;
  optimizationTip: string; // 최적화 설명 (팝업 내용)
  generateSteps: (ids: number[], values: number[]) => AnimationStep[];
}
