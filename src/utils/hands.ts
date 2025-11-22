/**
 * poker-gto-trainer - Hand Utilities
 * 169個のポーカーハンド生成とユーティリティ関数
 */

import type { Hand } from '../types';

/**
 * 全169ハンドを生成（標準的なポーカーハンド表記）
 * - ペア: AA, KK, QQ, ..., 22
 * - スーテッド: AKs, AQs, ..., 32s
 * - オフスーツ: AKo, AQo, ..., 32o
 */
export function generateAllHands(): Hand[] {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const hands: Hand[] = [];

  for (let i = 0; i < ranks.length; i++) {
    for (let j = i; j < ranks.length; j++) {
      const rank1 = ranks[i];
      const rank2 = ranks[j];

      if (i === j) {
        // ペア
        hands.push(`${rank1}${rank2}`);
      } else {
        // スーテッド
        hands.push(`${rank1}${rank2}s`);
        // オフスーツ
        hands.push(`${rank1}${rank2}o`);
      }
    }
  }

  return hands;
}

/**
 * ハンドをグリッド座標に変換
 * 13x13のグリッド表示用
 */
export function handToGridPosition(hand: Hand): { row: number; col: number } {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  const rank1 = hand[0];
  const rank2 = hand[1];
  const suited = hand.includes('s');
  const pair = hand.length === 2;

  const row = ranks.indexOf(rank1);
  const col = ranks.indexOf(rank2);

  if (pair) {
    return { row, col };
  } else if (suited) {
    // スーテッドは対角線より上
    return { row: Math.min(row, col), col: Math.max(row, col) };
  } else {
    // オフスーツは対角線より下
    return { row: Math.max(row, col), col: Math.min(row, col) };
  }
}

/**
 * グリッド座標からハンドを取得
 */
export function gridPositionToHand(row: number, col: number): Hand {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  if (row === col) {
    // ペア
    return `${ranks[row]}${ranks[col]}`;
  } else if (row < col) {
    // スーテッド（対角線より上）
    return `${ranks[row]}${ranks[col]}s`;
  } else {
    // オフスーツ（対角線より下）
    return `${ranks[col]}${ranks[row]}o`;
  }
}

/**
 * ハンドの強さをランク付け（0-168）
 * 0 = AA（最強）, 168 = 32o（最弱）
 */
export function getHandStrength(hand: Hand): number {
  const allHands = generateAllHands();
  return allHands.indexOf(hand);
}

/**
 * ハンドがペアかどうか
 */
export function isPair(hand: Hand): boolean {
  return hand.length === 2 && hand[0] === hand[1];
}

/**
 * ハンドがスーテッドかどうか
 */
export function isSuited(hand: Hand): boolean {
  return hand.includes('s');
}

/**
 * ハンドを読みやすい形式で表示
 */
export function formatHand(hand: Hand): string {
  if (isPair(hand)) {
    return `${hand} (Pair)`;
  } else if (isSuited(hand)) {
    return `${hand} (Suited)`;
  } else {
    return `${hand} (Offsuit)`;
  }
}
