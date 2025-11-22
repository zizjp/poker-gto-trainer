/**
 * poker-gto-trainer - Training Utilities
 * 学習モード用のユーティリティ関数
 */

import type {
  Hand,
  HandAction,
  HandActionType,
  CustomRange,
  TrainingQuestion,
  TrainingResult,
  TrainingSettings,
  JudgmentMode,
  FrequencyTracker,
} from '../types';

/**
 * 出題範囲に基づいてハンドリストをフィルタリング
 * @param hands - 全ハンドリスト
 * @param coverage - 出題範囲 (0-100)
 * @returns フィルタリングされたハンドリスト
 */
export function filterHandsByCoverage(
  hands: Hand[],
  coverage: number
): Hand[] {
  if (coverage >= 100) return hands;
  if (coverage <= 0) return [];

  const targetCount = Math.floor((hands.length * coverage) / 100);
  return hands.slice(0, targetCount);
}

/**
 * 50問をランダムに生成（重複なし）
 * @param range - レンジデータ
 * @param coverage - 出題範囲 (0-100)
 * @returns 生成された問題リスト
 */
export function generateQuestions(
  range: CustomRange,
  coverage: number = 100
): TrainingQuestion[] {
  const allHands = Object.keys(range.hands) as Hand[];
  const filteredHands = filterHandsByCoverage(allHands, coverage);

  // Fisher-Yates シャッフル
  const shuffled = [...filteredHands];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 最大50問を選択
  const selectedHands = shuffled.slice(0, Math.min(50, shuffled.length));

  return selectedHands.map((hand) => ({
    hand,
    correctActions: range.hands[hand],
  }));
}

/**
 * 確率的判定: ユーザーの回答が正解かどうかを確率的に判定
 * @param correctActions - 正解アクション
 * @param userAnswer - ユーザーの回答
 * @returns 正解かどうか（確率的）
 */
export function judgeProbabilistic(
  correctActions: HandAction,
  userAnswer: HandActionType
): { isCorrect: boolean; probability: number } {
  const probability = correctActions[userAnswer] / 100;
  const isCorrect = Math.random() < probability;

  return { isCorrect, probability };
}

/**
 * 主要アクションを取得（最も頻度が高いアクション）
 * @param actions - アクション頻度
 * @returns 主要アクション
 */
export function getPrimaryAction(actions: HandAction): HandActionType {
  const entries = Object.entries(actions) as [HandActionType, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * 頻度追跡の初期化
 * @param questions - 問題リスト
 * @returns 頻度追跡オブジェクト
 */
export function initializeFrequencyTracker(
  questions: TrainingQuestion[]
): FrequencyTracker {
  const tracker: FrequencyTracker = {};

  questions.forEach((q) => {
    if (!tracker[q.hand]) {
      tracker[q.hand] = {
        expected: { allin: 0, raise: 0, call: 0, fold: 0 },
        actual: { allin: 0, raise: 0, call: 0, fold: 0 },
        count: 0,
      };
    }

    // 期待値を加算
    tracker[q.hand].count++;
    tracker[q.hand].expected.allin += q.correctActions.allin / 100;
    tracker[q.hand].expected.raise += q.correctActions.raise / 100;
    tracker[q.hand].expected.call += q.correctActions.call / 100;
    tracker[q.hand].expected.fold += q.correctActions.fold / 100;
  });

  return tracker;
}

/**
 * 頻度表示判定: ユーザーの回答を頻度追跡に記録
 * @param tracker - 頻度追跡オブジェクト
 * @param hand - ハンド
 * @param userAnswer - ユーザーの回答
 */
export function recordFrequencyAnswer(
  tracker: FrequencyTracker,
  hand: Hand,
  userAnswer: HandActionType
): void {
  if (tracker[hand]) {
    tracker[hand].actual[userAnswer]++;
  }
}

/**
 * 頻度表示判定: 最終スコアを計算
 * @param tracker - 頻度追跡オブジェクト
 * @returns スコア (0-100)
 */
export function calculateFrequencyScore(tracker: FrequencyTracker): number {
  let totalError = 0;
  let totalCount = 0;

  Object.values(tracker).forEach((handData) => {
    const actions: HandActionType[] = ['allin', 'raise', 'call', 'fold'];

    actions.forEach((action) => {
      const expected = handData.expected[action];
      const actual = handData.actual[action];
      const error = Math.abs(expected - actual);
      totalError += error;
    });

    totalCount += handData.count;
  });

  // エラー率を計算（1回答あたりの平均誤差）
  const errorRate = totalError / (totalCount * 4); // 4 = アクション数
  const score = Math.max(0, 100 - errorRate * 100);

  return Math.round(score);
}

/**
 * 学習結果を計算
 * @param settings - 学習設定
 * @param questions - 問題リスト（回答済み）
 * @param judgmentMode - 判定モード
 * @param tracker - 頻度追跡オブジェクト（頻度表示モードの場合）
 * @returns 学習結果
 */
export function calculateTrainingResult(
  settings: TrainingSettings,
  questions: TrainingQuestion[],
  judgmentMode: JudgmentMode,
  tracker?: FrequencyTracker
): TrainingResult {
  const actionStats: Record<HandActionType, { correct: number; total: number }> = {
    allin: { correct: 0, total: 0 },
    raise: { correct: 0, total: 0 },
    call: { correct: 0, total: 0 },
    fold: { correct: 0, total: 0 },
  };

  let correctAnswers = 0;

  questions.forEach((q) => {
    if (q.userAnswer) {
      actionStats[q.userAnswer].total++;
      if (q.isCorrect) {
        correctAnswers++;
        actionStats[q.userAnswer].correct++;
      }
    }
  });

  // スコア計算
  let score: number;
  if (judgmentMode === 'probabilistic') {
    score = Math.round((correctAnswers / questions.length) * 100);
  } else {
    // 頻度表示モード
    score = tracker ? calculateFrequencyScore(tracker) : 0;
  }

  return {
    settings,
    totalQuestions: questions.length,
    correctAnswers,
    score,
    actionStats,
    questions,
    completedAt: new Date().toISOString(),
  };
}

/**
 * アクション名を日本語に変換
 * @param action - アクションタイプ
 * @returns 日本語アクション名
 */
export function getActionLabel(action: HandActionType): string {
  const labels: Record<HandActionType, string> = {
    allin: 'オールイン',
    raise: 'レイズ',
    call: 'コール',
    fold: 'フォールド',
  };
  return labels[action];
}

/**
 * スワイプ方向からアクションタイプに変換
 * @param direction - スワイプ方向 ('up' | 'down' | 'left' | 'right')
 * @returns アクションタイプ
 */
export function swipeDirectionToAction(
  direction: 'up' | 'left' | 'right'
): HandActionType {
  const mapping: Record<string, HandActionType> = {
    up: 'fold',
    left: 'call',
    right: 'raise',
  };
  return mapping[direction];
}
