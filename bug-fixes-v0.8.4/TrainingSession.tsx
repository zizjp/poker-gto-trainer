/**
 * poker-gto-trainer - Training Session Component (v0.8.3)
 * フィードバック解説機能追加
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrainingSettings, TrainingQuestion, FrequencyTracker, HandActionType } from '../types';
import { swipeDirectionToAction, judgeProbabilistic } from '../utils/training';
import { SwipeableCard } from './SwipeableCard';
import { FeedbackOverlay } from './FeedbackOverlay';

interface TrainingSessionProps {
  settings: TrainingSettings;
  questions: TrainingQuestion[];
  onComplete: (questions: TrainingQuestion[], tracker?: FrequencyTracker) => void;
  onCancel: () => void;
  frequencyTracker?: FrequencyTracker;
}

type SwipeDirection = 'up' | 'left' | 'right';

export function TrainingSession({ 
  settings, 
  questions, 
  onComplete, 
  onCancel,
  frequencyTracker 
}: TrainingSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<TrainingQuestion[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{ 
    isCorrect: boolean; 
    probability?: number;
    userAction?: HandActionType;
  } | null>(null);
  
  // フィードバック自動進行のタイマー管理用
  const autoProgressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  // スクロール無効化（ゲーム中の誤操作防止）
  useEffect(() => {
    // ゲーム開始時にスクロールを無効化
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // クリーンアップ: ゲーム終了時にスクロールを復元
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (currentIndex >= questions.length) {
      // すべての問題に回答完了
      onComplete(answeredQuestions, frequencyTracker);
    }
  }, [currentIndex, questions.length, answeredQuestions, frequencyTracker, onComplete]);

  // 次の問題へ進む関数（useCallbackで安定化）
  const handleNextQuestion = useCallback(() => {
    // タイマーをクリア
    if (autoProgressTimerRef.current) {
      clearTimeout(autoProgressTimerRef.current);
      autoProgressTimerRef.current = null;
    }
    
    setCurrentIndex(prev => prev + 1);
    setShowFeedback(false);
    setFeedbackResult(null);
  }, []);

  // フィードバック表示時に自動進行タイマーをセット
  useEffect(() => {
    if (showFeedback) {
      // 1.5秒後に自動で次の問題へ
      autoProgressTimerRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    }

    // クリーンアップ: showFeedbackが変わったらタイマーをクリア
    return () => {
      if (autoProgressTimerRef.current) {
        clearTimeout(autoProgressTimerRef.current);
        autoProgressTimerRef.current = null;
      }
    };
  }, [showFeedback, handleNextQuestion]);

  // キーボード操作のサポート
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating || showFeedback) return;
      
      let direction: SwipeDirection | null = null;
      
      switch(e.key) {
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'ArrowUp':
          direction = 'up';
          break;
      }
      
      if (direction) {
        e.preventDefault();
        handleSwipe(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, showFeedback, currentIndex, answeredQuestions, currentQuestion]);

  const handleSwipe = (direction: SwipeDirection) => {
    const userAnswer = swipeDirectionToAction(direction);
    
    // アニメーション開始
    setIsAnimating(true);

    // 即座に判定処理を実施（フィードバック表示用）
    const result = judgeProbabilistic(currentQuestion.correctActions, userAnswer);
    
    const answeredQuestion: TrainingQuestion = {
      ...currentQuestion,
      userAnswer,
      isCorrect: result.isCorrect,
      expectedProbability: result.probability,
    };

    // アニメーション完了後にフィードバック表示
    setTimeout(() => {
      setAnsweredQuestions(prev => [...prev, answeredQuestion]);
      setFeedbackResult({
        ...result,
        userAction: userAnswer
      });
      setShowFeedback(true);
      setIsAnimating(false);
    }, 400);
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="training-session fixed inset-0 bg-green-50 flex flex-col overflow-hidden">
      {/* フィードバックオーバーレイ */}
      {feedbackResult && (
        <FeedbackOverlay
          isVisible={showFeedback}
          isCorrect={feedbackResult.isCorrect}
          probability={feedbackResult.probability}
          onNext={handleNextQuestion}
          correctActions={currentQuestion.correctActions}
          userAction={feedbackResult.userAction}
        />
      )}

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
          
          {/* 進捗バー（Framer Motionでアニメーション） */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {currentIndex}/{questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ（flexbox改善: 操作ガイドを下部固定） */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* カード表示エリア */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
          <div className="max-w-md w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SwipeableCard
                  hand={currentQuestion.hand}
                  onSwipe={handleSwipe}
                  isAnimating={isAnimating}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 操作ガイド（下部固定） */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          <motion.div 
            className="max-w-md mx-auto grid grid-cols-3 gap-3 text-center text-sm select-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-blue-50 rounded-lg p-3 shadow-sm border border-blue-200">
              <div className="text-2xl mb-1">←</div>
              <div className="font-semibold text-blue-600">Call</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="text-2xl mb-1">↑</div>
              <div className="font-semibold text-gray-600">Fold</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 shadow-sm border border-red-200">
              <div className="text-2xl mb-1">→</div>
              <div className="font-semibold text-red-600">Raise</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
