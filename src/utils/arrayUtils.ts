export function generateRandomArray(size: number, max = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}
