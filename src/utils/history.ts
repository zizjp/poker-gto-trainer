/**
 * poker-gto-trainer - Training History Utilities
 * 学習履歴管理ユーティリティ
 */

import type { TrainingResult, TrainingHistoryRecord, HandStats, RangeStats } from '../types';
import { StorageKey } from '../types';

/**
 * 学習結果を履歴に保存
 */
export function saveTrainingHistory(result: TrainingResult): void {
  const history = loadTrainingHistory();
  const record: TrainingHistoryRecord = {
    id: `history-${Date.now()}`,
    result,
    timestamp: new Date().toISOString(),
  };
  history.push(record);
  localStorage.setItem(StorageKey.TRAINING_HISTORY, JSON.stringify(history));
}

/**
 * 学習履歴を読み込み
 */
export function loadTrainingHistory(): TrainingHistoryRecord[] {
  const data = localStorage.getItem(StorageKey.TRAINING_HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * レンジ別統計を計算
 */
export function calculateRangeStats(): RangeStats[] {
  const history = loadTrainingHistory();
  const rangeMap = new Map<string, RangeStats>();

  history.forEach(record => {
    const { result } = record;
    const rangeId = result.settings.rangeId;
    
    if (!rangeMap.has(rangeId)) {
      rangeMap.set(rangeId, {
        rangeId,
        rangeName: result.settings.rangeName,
        totalSessions: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        lastPlayed: record.timestamp,
      });
    }

    const stats = rangeMap.get(rangeId)!;
    stats.totalSessions++;
    stats.totalQuestions += result.totalQuestions;
    stats.bestScore = Math.max(stats.bestScore, result.score);
    stats.lastPlayed = record.timestamp;
  });

  // 平均スコア計算
  rangeMap.forEach(stats => {
    const sessions = history.filter(r => r.result.settings.rangeId === stats.rangeId);
    const totalScore = sessions.reduce((sum, r) => sum + r.result.score, 0);
    stats.averageScore = Math.round(totalScore / sessions.length);
  });

  return Array.from(rangeMap.values()).sort((a, b) => 
    new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  );
}

/**
 * ハンド別統計を計算
 */
export function calculateHandStats(): HandStats[] {
  const history = loadTrainingHistory();
  const handMap = new Map<string, HandStats>();

  history.forEach(record => {
    record.result.questions.forEach(q => {
      if (!q.userAnswer) return;

      if (!handMap.has(q.hand)) {
        handMap.set(q.hand, {
          hand: q.hand,
          totalAttempts: 0,
          correctCount: 0,
          accuracy: 0,
          lastAttempt: record.timestamp,
        });
      }

      const stats = handMap.get(q.hand)!;
      stats.totalAttempts++;
      if (q.isCorrect) stats.correctCount++;
      stats.lastAttempt = record.timestamp;
    });
  });

  // 正解率計算
  handMap.forEach(stats => {
    stats.accuracy = Math.round((stats.correctCount / stats.totalAttempts) * 100);
  });

  return Array.from(handMap.values()).sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * 最近の学習履歴を取得
 */
export function getRecentHistory(limit: number = 10): TrainingHistoryRecord[] {
  const history = loadTrainingHistory();
  return history.slice(-limit).reverse();
}

/**
 * スコア推移データを取得
 */
export function getScoreTimeline(rangeId?: string): { date: string; score: number }[] {
  const history = loadTrainingHistory();
  const filtered = rangeId 
    ? history.filter(r => r.result.settings.rangeId === rangeId)
    : history;

  return filtered.map(r => ({
    date: new Date(r.timestamp).toLocaleDateString('ja-JP'),
    score: r.result.score,
  }));
}

/**
 * 弱点ハンドを抽出（正解率50%以下、3回以上出題）
 */
export function getWeakHands(): HandStats[] {
  const allStats = calculateHandStats();
  return allStats.filter(s => s.accuracy <= 50 && s.totalAttempts >= 3).slice(0, 20);
}

/**
 * 全体統計を計算
 */
export function calculateOverallStats() {
  const history = loadTrainingHistory();
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalQuestions: 0,
      averageScore: 0,
      bestScore: 0,
      totalCorrect: 0,
    };
  }

  const totalSessions = history.length;
  const totalQuestions = history.reduce((sum, r) => sum + r.result.totalQuestions, 0);
  const totalScore = history.reduce((sum, r) => sum + r.result.score, 0);
  const averageScore = Math.round(totalScore / totalSessions);
  const bestScore = Math.max(...history.map(r => r.result.score));
  const totalCorrect = history.reduce((sum, r) => sum + r.result.correctAnswers, 0);

  return {
    totalSessions,
    totalQuestions,
    averageScore,
    bestScore,
    totalCorrect,
  };
}
