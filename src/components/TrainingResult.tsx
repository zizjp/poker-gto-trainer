/**
 * poker-gto-trainer - Training Result Component
 * 学習結果画面（復習モード対応）
 */

import type { TrainingResult, HandActionType } from '../types';
import { getActionLabel } from '../utils/training';

interface TrainingResultProps {
  result: TrainingResult;
  onRestart: () => void;
  onReview?: () => void;
  onBackToHome: () => void;
}

export function TrainingResultComponent({ result, onRestart, onReview, onBackToHome }: TrainingResultProps) {
  const { settings, totalQuestions, correctAnswers, score, actionStats, questions } = result;

  const getAccuracy = (action: HandActionType) => {
    const stat = actionStats[action];
    if (stat.total === 0) return '-';
    return `${Math.round((stat.correct / stat.total) * 100)}%`;
  };

  const getScoreMessage = () => {
    if (score >= 90) return { text: '素晴らしい！', emoji: '🎉' };
    if (score >= 80) return { text: '素晴らしいです！', emoji: '👏' };
    if (score >= 70) return { text: 'よくできました！', emoji: '✨' };
    if (score >= 60) return { text: '良いですね！', emoji: '👍' };
    return { text: 'もう一度挑戦しましょう！', emoji: '💪' };
  };

  const scoreMessage = getScoreMessage();
  const incorrectQuestions = questions.filter(q => !q.isCorrect);

  return (
    <div className="training-result min-h-screen bg-green-50 overflow-y-auto">
      <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">学習結果</h1>
          <p className="text-gray-600">{settings.rangeName}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">{scoreMessage.emoji}</div>
            <div className="text-5xl font-bold text-green-600 mb-2">{score}</div>
            <div className="text-xl font-semibold text-gray-700">{scoreMessage.text}</div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">{correctAnswers}</div>
                <div className="text-sm text-gray-600">正解数</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalQuestions}</div>
                <div className="text-sm text-gray-600">総問題数</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">アクション別統計</h2>
          <div className="space-y-3">
            {(['raise', 'call', 'fold', 'allin'] as HandActionType[]).map(action => {
              const stat = actionStats[action];
              return (
                <div key={action} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">{getActionLabel(action)}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{getAccuracy(action)}</span>
                    <span className="text-sm text-gray-600 ml-2">({stat.correct}/{stat.total})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {incorrectQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              復習が必要なハンド ({incorrectQuestions.length}個)
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {incorrectQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                  <span className="font-bold text-gray-900">{q.hand}</span>
                  <div className="text-sm">
                    <span className="text-gray-600">あなた: </span>
                    <span className="font-semibold text-red-600">
                      {q.userAnswer && getActionLabel(q.userAnswer)}
                    </span>
                    {q.expectedProbability && (
                      <span className="text-gray-500 ml-2">
                        ({Math.round(q.expectedProbability * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-3">
          {incorrectQuestions.length > 0 && (
            <button
              onClick={onReview}
              className="w-full py-4 bg-orange-600 text-white font-semibold text-lg rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
            >
              復習モードで再挑戦
            </button>
          )}
          <button
            onClick={onRestart}
            className="w-full py-4 bg-green-600 text-white font-semibold text-lg rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            もう一度挑戦
          </button>
          <button
            onClick={onBackToHome}
            className="w-full py-4 bg-gray-600 text-white font-semibold text-lg rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}