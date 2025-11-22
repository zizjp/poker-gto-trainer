/**
 * poker-gto-trainer - Type Definitions
 * GTO混合戦略に基づくポーカー学習アプリの型定義
 */

/**
 * ハンドアクション: 各ポーカーハンドに対する4つのアクション頻度
 * 合計は必ず100%になる必要がある
 */
export interface HandAction {
  allin: number;  // オールイン頻度 (0-100)
  raise: number;  // レイズ頻度 (0-100)
  call: number;   // コール頻度 (0-100)
  fold: number;   // フォールド頻度 (0-100)
}

/**
 * ポーカーハンド表現
 * 例: "AA", "KQs", "72o"
 */
export type Hand = string;

/**
 * アクションタイプ
 */
export type HandActionType = 'allin' | 'raise' | 'call' | 'fold';

/**
 * カスタムレンジ: 169個のハンドに対する完全なアクション定義
 */
export interface CustomRange {
  id: string;
  name: string;
  description?: string;
  scenarioType?: '3bet' | '4bet' | 'preflop'; // シナリオタイプ
  hands: Record<Hand, HandAction>;
  createdAt: string;
  updatedAt: string;
}

/**
 * シナリオタイプ
 */
export type ScenarioType = 'preflop' | 'three-bet' | 'four-bet';

/**
 * アプリモード
 */
export type AppMode = 'debug' | 'training';

/**
 * 判定モード
 */
export type JudgmentMode = 'probabilistic' | 'frequency';

/**
 * 学習設定
 */
export interface TrainingSettings {
  rangeId: string;
  rangeName: string;
  coverage: number; // 0-100
  judgmentMode: JudgmentMode;
  totalQuestions: 50;
}

/**
 * 学習問題（新形式）
 */
export interface TrainingQuestion {
  hand: Hand;
  correctActions: HandAction;
  userAnswer?: HandActionType;
  isCorrect?: boolean;
  expectedProbability?: number; // 確率的判定モードで使用
}

/**
 * 学習結果
 */
export interface TrainingResult {
  settings: TrainingSettings;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // 0-100
  actionStats: Record<HandActionType, { correct: number; total: number }>;
  questions: TrainingQuestion[];
  completedAt: string;
}

/**
 * 頻度追跡（頻度表示判定モード用）
 */
export interface FrequencyTracker {
  [hand: string]: {
    expected: Record<HandActionType, number>;
    actual: Record<HandActionType, number>;
    count: number;
  };
}

/**
 * ポジション
 */
export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

/**
 * レンジシナリオ: 特定のシチュエーションでのレンジ定義
 */
export interface RangeScenario {
  id: string;
  type: ScenarioType;
  position: Position;
  vsPosition?: Position;  // 対戦相手のポジション（3bet/4betの場合）
  range: CustomRange;
  isGTO: boolean;        // GTOデータか否か
}

/**
 * 頻度検証結果
 */
export interface ValidationResult {
  isValid: boolean;
  total: number;
  error?: string;
}

/**
 * 学習問題
 */
export interface Question {
  id: string;
  hand: Hand;
  scenario: RangeScenario;
  correctAction: HandAction;
}

/**
 * ユーザーの回答（旧形式 - 後方互換性のため保持）
 */
export interface Answer {
  questionId: string;
  userAction: HandActionType;
  isCorrect: boolean;
  timestamp: string;
}

/**
 * 学習セッション
 */
export interface LearningSession {
  id: string;
  scenarioId: string;
  questions: Question[];
  answers: Answer[];
  startedAt: string;
  completedAt?: string;
  score?: number;
}

/**
 * ストレージキー
 */
export const StorageKey = {
  CUSTOM_RANGES: 'poker-gto-trainer:custom-ranges',
  LEARNING_HISTORY: 'poker-gto-trainer:learning-history',
  USER_PREFERENCES: 'poker-gto-trainer:user-preferences',
  APP_MODE: 'poker-gto-trainer:app-mode',
  TRAINING_SETTINGS: 'poker-gto-trainer:training-settings',
} as const;
