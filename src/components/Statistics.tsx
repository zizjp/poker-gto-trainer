/**
 * poker-gto-trainer - Statistics Component
 * 統計画面
 */

import { useMemo } from 'react';
import { calculateRangeStats, getRecentHistory, calculateOverallStats, getWeakHands } from '../utils/history';

interface StatisticsProps {
  onClose: () => void;
}

export function Statistics({ onClose }: StatisticsProps) {
  const overallStats = useMemo(() => calculateOverallStats(), []);
  const rangeStats = useMemo(() => calculateRangeStats(), []);
  const recentHistory = useMemo(() => getRecentHistory(5), []);
  const weakHands = useMemo(() => getWeakHands(), []);

  return (
    <div className="statistics fixed inset-0 bg-green-50 overflow-y-auto z-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">学習統計</h1>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded hover:bg-gray-100"
          >
            閉じる
          </button>
        </div>

        {/* 全体統計 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">全体サマリー</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{overallStats.totalSessions}</div>
              <div className="text-sm text-gray-600">学習回数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{overallStats.totalQuestions}</div>
              <div className="text-sm text-gray-600">総問題数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{overallStats.averageScore}</div>
              <div className="text-sm text-gray-600">平均スコア</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{overallStats.bestScore}</div>
              <div className="text-sm text-gray-600">最高スコア</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{overallStats.totalCorrect}</div>
              <div className="text-sm text-gray-600">正解数</div>
            </div>
          </div>
        </div>

        {/* レンジ別統計 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">レンジ別統計</h2>
          {rangeStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ学習履歴がありません</p>
          ) : (
            <div className="space-y-3">
              {rangeStats.map(stats => (
                <div key={stats.rangeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{stats.rangeName}</div>
                    <div className="text-sm text-gray-600">
                      {stats.totalSessions}回 • 平均 {stats.averageScore}点 • 最高 {stats.bestScore}点
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
                    <div className="text-xs text-gray-500">平均</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 弱点ハンド */}
        {weakHands.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">弱点ハンド（正解率50%以下）</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {weakHands.map(stats => (
                <div key={stats.hand} className="p-3 bg-red-50 rounded border border-red-200 text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.hand}</div>
                  <div className="text-sm text-red-600">{stats.accuracy}%</div>
                  <div className="text-xs text-gray-500">{stats.totalAttempts}回</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近の学習履歴 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">最近の学習履歴</h2>
          {recentHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ学習履歴がありません</p>
          ) : (
            <div className="space-y-3">
              {recentHistory.map(record => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{record.result.settings.rangeName}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(record.timestamp).toLocaleString('ja-JP')} • 
                      {record.result.totalQuestions}問 • 
                      正解率 {Math.round((record.result.correctAnswers / record.result.totalQuestions) * 100)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">{record.result.score}</div>
                    <div className="text-xs text-gray-500">スコア</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
