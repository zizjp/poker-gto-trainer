/**
 * poker-gto-trainer - Storage Utilities
 * LocalStorageを使用したデータ永続化
 */

import type { CustomRange, LearningSession } from '../types';
import { StorageKey } from '../types';

/**
 * カスタムレンジを保存
 */
export function saveCustomRange(range: CustomRange): void {
  try {
    const ranges = loadAllCustomRanges();
    const existingIndex = ranges.findIndex(r => r.id === range.id);

    if (existingIndex >= 0) {
      ranges[existingIndex] = range;
    } else {
      ranges.push(range);
    }

    localStorage.setItem(StorageKey.CUSTOM_RANGES, JSON.stringify(ranges));
  } catch (error) {
    console.error('Failed to save custom range:', error);
    throw new Error('レンジの保存に失敗しました');
  }
}

/**
 * カスタムレンジを読み込み
 */
export function loadCustomRange(id: string): CustomRange | null {
  try {
    const ranges = loadAllCustomRanges();
    return ranges.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Failed to load custom range:', error);
    return null;
  }
}

/**
 * 全てのカスタムレンジを読み込み
 */
export function loadAllCustomRanges(): CustomRange[] {
  try {
    const data = localStorage.getItem(StorageKey.CUSTOM_RANGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load custom ranges:', error);
    return [];
  }
}

/**
 * カスタムレンジを削除
 */
export function deleteCustomRange(id: string): void {
  try {
    const ranges = loadAllCustomRanges();
    const filtered = ranges.filter(r => r.id !== id);
    localStorage.setItem(StorageKey.CUSTOM_RANGES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete custom range:', error);
    throw new Error('レンジの削除に失敗しました');
  }
}

/**
 * 学習セッションを保存
 */
export function saveLearningSession(session: LearningSession): void {
  try {
    const sessions = loadAllLearningSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(StorageKey.LEARNING_HISTORY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save learning session:', error);
    throw new Error('学習データの保存に失敗しました');
  }
}

/**
 * 全ての学習セッションを読み込み
 */
export function loadAllLearningSessions(): LearningSession[] {
  try {
    const data = localStorage.getItem(StorageKey.LEARNING_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load learning sessions:', error);
    return [];
  }
}

/**
 * ストレージ使用量を取得（バイト）
 */
export function getStorageSize(): number {
  let total = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * ストレージ使用量を人間が読める形式で取得
 */
export function getStorageSizeFormatted(): string {
  const bytes = getStorageSize();
  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb > 1) {
    return `${mb.toFixed(2)} MB`;
  } else if (kb > 1) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${bytes} bytes`;
  }
}

/**
 * データをエクスポート（JSON形式）
 */
export function exportAllData(): string {
  const data = {
    customRanges: loadAllCustomRanges(),
    learningSessions: loadAllLearningSessions(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  return JSON.stringify(data, null, 2);
}

/**
 * データをインポート
 */
export function importData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString);

    if (data.customRanges) {
      localStorage.setItem(StorageKey.CUSTOM_RANGES, JSON.stringify(data.customRanges));
    }

    if (data.learningSessions) {
      localStorage.setItem(StorageKey.LEARNING_HISTORY, JSON.stringify(data.learningSessions));
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('データのインポートに失敗しました');
  }
}

/**
 * 全データをクリア（確認必須）
 */
export function clearAllData(): void {
  localStorage.removeItem(StorageKey.CUSTOM_RANGES);
  localStorage.removeItem(StorageKey.LEARNING_HISTORY);
  localStorage.removeItem(StorageKey.USER_PREFERENCES);
}
