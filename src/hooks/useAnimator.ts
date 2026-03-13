import { useState, useEffect, useRef, useCallback } from 'react';
import type { AnimationStep } from '../types';

export function useAnimator(steps: AnimationStep[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // speed 1 = 1000ms, speed 10 = 50ms
  const getDelay = (spd: number) => Math.round(1050 - spd * 100);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  // steps가 바뀌면 리셋
  useEffect(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, [steps]);

  // 자동 재생 루프
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, getDelay(speed));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, steps.length]);

  return {
    currentStep,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    totalSteps: steps.length,
  };
}
