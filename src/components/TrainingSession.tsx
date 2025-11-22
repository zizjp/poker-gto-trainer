/**
 * poker-gto-trainer - Training Session Component
 * スワイプ学習UIコンポーネント（UX改善版）
 */

import { useState, useEffect } from 'react';
import type { TrainingSettings, TrainingQuestion, FrequencyTracker } from '../types';
import { swipeDirectionToAction } from '../utils/training';
import { handToCards, getRankDisplay } from '../utils/cards';

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
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    if (currentIndex >= questions.length) {
      // すべての問題に回答完了
      onComplete(answeredQuestions, frequencyTracker);
    }
  }, [currentIndex, questions.length, answeredQuestions, frequencyTracker, onComplete]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isAnimating) return;
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
    if (!touchStart || !touchCurrent || isAnimating) return;

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
    } else {
      // 閾値未満の場合はリセット
      setTouchStart(null);
      setTouchCurrent(null);
      setSwipeDirection(null);
    }
  };

  const handleSwipe = (direction: SwipeDirection) => {
    const userAnswer = swipeDirectionToAction(direction);
    
    // アニメーション開始
    setIsAnimating(true);

    // 判定処理はTrainingResultコンポーネントで実施
    const answeredQuestion: TrainingQuestion = {
      ...currentQuestion,
      userAnswer,
    };

    // アニメーション完了後に次の問題へ
    setTimeout(() => {
      setAnsweredQuestions([...answeredQuestions, answeredQuestion]);
      setCurrentIndex(currentIndex + 1);
      
      // リセット
      setTouchStart(null);
      setTouchCurrent(null);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 400);
  };

  // スワイプオフセットを計算
  const getSwipeOffset = () => {
    if (!touchStart || !touchCurrent || !swipeDirection) return { x: 0, y: 0 };

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;

    return { x: deltaX, y: deltaY };
  };

  const offset = getSwipeOffset();

  // スワイプ方向に応じた色とラベル
  const getSwipeStyle = () => {
    if (!swipeDirection) return { bgColor: 'bg-white', label: '', labelColor: '' };
    
    const styles: Record<SwipeDirection, { bgColor: string; label: string; labelColor: string }> = {
      up: { bgColor: 'bg-red-50', label: 'RAISE', labelColor: 'text-red-600' },
      down: { bgColor: 'bg-gray-50', label: 'FOLD', labelColor: 'text-gray-600' },
      left: { bgColor: 'bg-blue-50', label: 'CALL', labelColor: 'text-blue-600' },
      right: { bgColor: 'bg-purple-50', label: 'ALLIN', labelColor: 'text-purple-600' },
    };

    return styles[swipeDirection];
  };

  const swipeStyle = getSwipeStyle();

  // アニメーション用のクラス
  const getCardClass = () => {
    if (isAnimating && swipeDirection) {
      const animations: Record<SwipeDirection, string> = {
        up: 'animate-swipe-up',
        down: 'animate-swipe-down',
        left: 'animate-swipe-left',
        right: 'animate-swipe-right',
      };
      return animations[swipeDirection];
    }
    return '';
  };

  if (!currentQuestion) {
    return null;
  }

  // トランプカードを取得
  const [card1, card2] = handToCards(currentQuestion.hand);

  return (
    <div className="training-session fixed inset-0 bg-green-50 flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-white shadow-md p-4 flex-shrink-0">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {settings.rangeName}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900 font-semibold px-3 py-1 rounded hover:bg-gray-100"
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
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {currentIndex}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-md w-full flex flex-col" style={{ height: '500px' }}>
          {/* カード */}
          <div
            className={`
              card-container relative flex-shrink-0
              ${getCardClass()}
              ${swipeStyle.bgColor}
              rounded-2xl shadow-2xl p-8
              transition-colors duration-200
            `}
            style={{
              height: '380px',
              ...(              !isAnimating
                ? {
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x * 0.05}deg)`,
                    transition: 'none',
                  }
                : {})
            }}

            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* スワイプラベル */}
            {swipeDirection && (
              <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
                <div className={`
                  ${swipeStyle.labelColor} 
                  text-3xl font-black opacity-70 
                  animate-pulse
                `}>
                  {swipeStyle.label}
                </div>
              </div>
            )}

            {/* トランプカード表示 */}
            <div className="flex justify-center items-center gap-4 my-12">
              {/* カード1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 w-32 h-44 flex flex-col items-center justify-between border-2 border-gray-200">
                <div className={`text-5xl font-bold ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                  {getRankDisplay(card1.rank)}
                </div>
                <div className={`text-6xl ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                  {card1.suit}
                </div>
                <div className={`text-5xl font-bold ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                  {getRankDisplay(card1.rank)}
                </div>
              </div>

              {/* カード2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 w-32 h-44 flex flex-col items-center justify-between border-2 border-gray-200">
                <div className={`text-5xl font-bold ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                  {getRankDisplay(card2.rank)}
                </div>
                <div className={`text-6xl ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                  {card2.suit}
                </div>
                <div className={`text-5xl font-bold ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                  {getRankDisplay(card2.rank)}
                </div>
              </div>
            </div>

            {/* ハンド表記 */}
            <div className="text-center text-gray-600 text-sm font-semibold mt-4">
              {currentQuestion.hand}
            </div>
          </div>

          {/* 操作ガイド */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm select-none flex-shrink-0">
            <div className="bg-white rounded-lg p-3 shadow">
              <div className="text-2xl mb-1">↑</div>
              <div className="font-semibold text-red-600">Raise</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow">
              <div className="text-2xl mb-1">→</div>
              <div className="font-semibold text-purple-600">Allin</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow">
              <div className="text-2xl mb-1">←</div>
              <div className="font-semibold text-blue-600">Call</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow">
              <div className="text-2xl mb-1">↓</div>
              <div className="font-semibold text-gray-600">Fold</div>
            </div>
          </div>
        </div>
      </div>

      {/* スタイル定義 */}
      <style>{`
        @keyframes swipe-up {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(0, -150%) rotate(-10deg);
            opacity: 0;
          }
        }

        @keyframes swipe-down {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(0, 150%) rotate(10deg);
            opacity: 0;
          }
        }

        @keyframes swipe-left {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-150%, 0) rotate(-20deg);
            opacity: 0;
          }
        }

        @keyframes swipe-right {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(150%, 0) rotate(20deg);
            opacity: 0;
          }
        }

        .animate-swipe-up {
          animation: swipe-up 0.4s ease-out forwards;
        }

        .animate-swipe-down {
          animation: swipe-down 0.4s ease-out forwards;
        }

        .animate-swipe-left {
          animation: swipe-left 0.4s ease-out forwards;
        }

        .animate-swipe-right {
          animation: swipe-right 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
