/**
 * poker-gto-trainer - Training Session Component
 * スワイプ学習UIコンポーネント（UX改善版v2）
 */

import { useState, useEffect } from 'react';
import type { TrainingSettings, TrainingQuestion, FrequencyTracker, HandActionType } from '../types';
import { swipeDirectionToAction, judgeProbabilistic } from '../utils/training';
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{ isCorrect: boolean; userAnswer: HandActionType; probability: number } | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  useEffect(() => {
    if (currentIndex >= questions.length && !showFeedback) {
      onComplete(answeredQuestions, frequencyTracker);
    }
  }, [currentIndex, questions.length, answeredQuestions, frequencyTracker, onComplete, showFeedback]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating || showFeedback) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isAnimating || showFeedback) return;
    const touch = e.touches[0];
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchCurrent || isAnimating) return;

    if (showFeedback) {
      handleNextQuestion();
      return;
    }

    const deltaX = touchCurrent.x - touchStart.x;
    const deltaY = touchCurrent.y - touchStart.y;
    const threshold = 80;

    let direction: SwipeDirection | null = null;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (Math.abs(deltaY) > threshold) {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    if (direction) {
      handleSwipe(direction);
    } else {
      setTouchStart(null);
      setTouchCurrent(null);
      setSwipeDirection(null);
    }
  };

  const handleSwipe = (direction: SwipeDirection) => {
    const userAnswer = swipeDirectionToAction(direction);
    setIsAnimating(true);

    const { isCorrect, probability } = judgeProbabilistic(currentQuestion.correctActions, userAnswer);

    const answeredQuestion: TrainingQuestion = {
      ...currentQuestion,
      userAnswer,
      isCorrect,
      expectedProbability: probability,
    };

    setTimeout(() => {
      setAnsweredQuestions([...answeredQuestions, answeredQuestion]);
      setFeedbackResult({ isCorrect, userAnswer, probability });
      setShowFeedback(true);
      setIsAnimating(false);
      setTouchStart(null);
      setTouchCurrent(null);
      setSwipeDirection(null);
    }, 400);

    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setFeedbackResult(null);
    setCurrentIndex(currentIndex + 1);
  };

  const getSwipeOffset = () => {
    if (!touchStart || !touchCurrent || !swipeDirection) return { x: 0, y: 0 };
    return { x: touchCurrent.x - touchStart.x, y: touchCurrent.y - touchStart.y };
  };

  const offset = getSwipeOffset();

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

  if (!currentQuestion) return null;

  const [card1, card2] = handToCards(currentQuestion.hand);

  return (
    <div className="training-session fixed inset-0 bg-green-50 flex flex-col overflow-hidden touch-none">
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

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-md w-full">
          {!showFeedback ? (
            <div
              className={`
                card-container relative
                ${getCardClass()}
                ${swipeStyle.bgColor}
                rounded-2xl shadow-2xl p-8
                transition-colors duration-200
              `}
              style={
                !isAnimating
                  ? {
                      transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x * 0.05}deg)`,
                      transition: 'none',
                    }
                  : undefined
              }
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {swipeDirection && (
                <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
                  <div className={`${swipeStyle.labelColor} text-3xl font-black opacity-70 animate-pulse`}>
                    {swipeStyle.label}
                  </div>
                </div>
              )}

              <div className="flex justify-center items-center gap-4 my-8">
                <div className="bg-white rounded-xl shadow-lg p-4 w-28 h-40 flex flex-col items-center justify-center border-2 border-gray-300">
                  <div className={`text-6xl font-bold ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                    {getRankDisplay(card1.rank)}
                  </div>
                  <div className={`text-7xl ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                    {card1.suit}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 w-28 h-40 flex flex-col items-center justify-center border-2 border-gray-300">
                  <div className={`text-6xl font-bold ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                    {getRankDisplay(card2.rank)}
                  </div>
                  <div className={`text-7xl ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
                    {card2.suit}
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-600 text-sm font-semibold mt-4">
                {currentQuestion.hand}
              </div>
            </div>
          ) : (
            <div className="feedback-screen bg-white rounded-2xl shadow-2xl p-8 text-center"
              onTouchEnd={handleNextQuestion}>
              <div className={`text-8xl mb-4 ${feedbackResult?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {feedbackResult?.isCorrect ? '○' : '×'}
              </div>
              <div className="text-2xl font-bold mb-2">
                {feedbackResult?.isCorrect ? '正解！' : '不正解'}
              </div>
              <div className="text-gray-600 text-sm">
                確率: {Math.round((feedbackResult?.probability || 0) * 100)}%
              </div>
              <div className="text-gray-400 text-xs mt-4">
                タップで次へ
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 text-center text-sm select-none">
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

      <style>{`
        @keyframes swipe-up {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(0, -150%) rotate(-10deg); opacity: 0; }
        }
        @keyframes swipe-down {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(0, 150%) rotate(10deg); opacity: 0; }
        }
        @keyframes swipe-left {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(-150%, 0) rotate(-20deg); opacity: 0; }
        }
        @keyframes swipe-right {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(150%, 0) rotate(20deg); opacity: 0; }
        }
        .animate-swipe-up { animation: swipe-up 0.4s ease-out forwards; }
        .animate-swipe-down { animation: swipe-down 0.4s ease-out forwards; }
        .animate-swipe-left { animation: swipe-left 0.4s ease-out forwards; }
        .animate-swipe-right { animation: swipe-right 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}