/**
 * poker-gto-trainer - Training Session Component
 * スワイプ学習UIコンポーネント
 */

import { useState, useEffect } from 'react';
import type { TrainingSettings, TrainingQuestion, FrequencyTracker } from '../types';
import { swipeDirectionToAction, getActionLabel } from '../utils/training';

interface TrainingSessionProps {
  settings: TrainingSettings;
  questions: TrainingQuestion[];
  onComplete: (questions: TrainingQuestion[], tracker?: FrequencyTracker) => void;
  onCancel: () => void;
  frequencyTracker?: FrequencyTracker;
}

type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export function TrainingSession({ 
  settings, 
  questions, 
  onComplete, 
  onCancel,
  frequencyTracker 
}: TrainingSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<TrainingQuestion[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<{ x: number; y: number } | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    if (currentIndex >= questions.length) {
      // すべての問題に回答完了
      onComplete(answeredQuestions, frequencyTracker);
    }
  }, [currentIndex, questions.length, answeredQuestions, frequencyTracker, onComplete]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // スワイプ方向を判定
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent) return;

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const threshold = 80; // スワイプ判定の閾値

    let direction: SwipeDirection | null = null;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (Math.abs(deltaY) > threshold) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    if (direction) {
      handleSwipe(direction);
    }

    // リセット
    setTouchStart(null);
    setTouchCurrent(null);
    setSwipeDirection(null);
  };

  const handleSwipe = (direction: SwipeDirection) => {
    const userAnswer = swipeDirectionToAction(direction);
    
    // 判定処理はTrainingResultコンポーネントで実施
    const answeredQuestion: TrainingQuestion = {
      ...currentQuestion,
      userAnswer,
    };

    setAnsweredQuestions([...answeredQuestions, answeredQuestion]);
    setCurrentIndex(currentIndex + 1);
  };

  // スワイプオフセットを計算
  const getSwipeOffset = () => {
    if (!touchStart || !touchCurrent || !swipeDirection) return { x: 0, y: 0 };

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;

    return { x: deltaX, y: deltaY };
  };

  const offset = getSwipeOffset();

  // スワイプ方向に応じた色
  const getSwipeColor = () => {
    if (!swipeDirection) return 'bg-white';
    
    const colors: Record<SwipeDirection, string> = {
      up: 'bg-red-100',    // Raise
      down: 'bg-gray-100', // Fold
      left: 'bg-blue-100', // Call
      right: 'bg-purple-100', // Allin
    };

    return colors[swipeDirection];
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="training-session min-h-screen bg-green-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">
              {settings.rangeName}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900 font-semibold"
            >
              中断
            </button>
          </div>
          
          {/* 進捗バー */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {currentIndex}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* メインカード */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div
            className={`
              card relative rounded-2xl shadow-2xl p-12 transition-all duration-200
              ${getSwipeColor()}
            `}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x * 0.1}deg)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ハンド表示 */}
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-900 mb-4">
                {currentQuestion.hand}
              </div>
              <div className="text-gray-600 text-lg">
                このハンドのアクションは？
              </div>
            </div>

            {/* スワイプヒント */}
            {swipeDirection && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-4xl font-bold opacity-60">
                  {getActionLabel(swipeDirectionToAction(swipeDirection))}
                </div>
              </div>
            )}
          </div>

          {/* 操作ガイド */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-center text-sm text-gray-600">
            <div>
              <div className="font-semibold text-red-600">↑ Raise</div>
            </div>
            <div>
              <div className="font-semibold text-purple-600">→ Allin</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">← Call</div>
            </div>
            <div>
              <div className="font-semibold text-gray-600">↓ Fold</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
