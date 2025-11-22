/**
 * poker-gto-trainer - Validation Utilities
 * 頻度検証とバリデーション機能
 */

import type { HandAction, ValidationResult } from '../types';

/**
 * ハンドアクションの頻度を検証
 * 合計が100%であることを確認
 */
export function validateFrequencies(action: HandAction): ValidationResult {
  const total = action.allin + action.raise + action.call + action.fold;
  const isValid = Math.abs(total - 100) < 0.01; // 浮動小数点誤差を考慮

  if (!isValid) {
    const diff = 100 - total;
    const error = diff > 0 
      ? `合計: ${total.toFixed(1)}% (あと${diff.toFixed(1)}%必要)`
      : `合計: ${total.toFixed(1)}% (${Math.abs(diff).toFixed(1)}%超過)`;
    
    return { isValid: false, total, error };
  }

  return { isValid: true, total };
}

/**
 * 各頻度が有効な範囲内か確認
 */
export function validateFrequencyRange(value: number): boolean {
  return value >= 0 && value <= 100;
}

/**
 * HandActionオブジェクトを作成（初期値付き）
 */
export function createEmptyHandAction(): HandAction {
  return {
    allin: 0,
    raise: 0,
    call: 0,
    fold: 100, // デフォルトは100% fold
  };
}

/**
 * 頻度を正規化（合計を100%に調整）
 * 最も大きい値を調整する
 */
export function normalizeFrequencies(action: HandAction): HandAction {
  const validation = validateFrequencies(action);
  
  if (validation.isValid) {
    return action;
  }

  const total = validation.total;
  const diff = 100 - total;

  // 最も大きい値を持つアクションを見つける
  const actions: Array<keyof HandAction> = ['allin', 'raise', 'call', 'fold'];
  const maxAction = actions.reduce((max, current) => 
    action[current] > action[max] ? current : max
  );

  return {
    ...action,
    [maxAction]: Math.max(0, action[maxAction] + diff),
  };
}

/**
 * パーセンテージを小数点第1位で四捨五入
 */
export function roundPercentage(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * 入力値を検証してパースする
 */
export function parseFrequencyInput(input: string): number | null {
  const value = parseFloat(input);
  
  if (isNaN(value)) {
    return null;
  }

  if (!validateFrequencyRange(value)) {
    return null;
  }

  return roundPercentage(value);
}
