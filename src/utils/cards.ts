/**
 * poker-gto-trainer - Card Utilities
 * トランプカード表示用ユーティリティ
 */

export interface Card {
  rank: string;
  suit: '♥' | '♦' | '♣' | '♠';
  color: 'red' | 'black';
}

/**
 * ハンド表記を2枚のカードに変換
 * @param hand - ハンド表記 (例: "AKs", "QQ", "72o")
 * @returns 2枚のカード
 */
export function handToCards(hand: string): [Card, Card] {
  // ハンド表記をパース
  const isPair = hand[0] === hand[1];
  const isSuited = hand.endsWith('s');
  const rank1 = hand[0];
  const rank2 = hand[1];

  if (isPair) {
    // ペアの場合: 異なるスートで表示
    return [
      { rank: rank1, suit: '♠', color: 'black' },
      { rank: rank2, suit: '♥', color: 'red' },
    ];
  } else if (isSuited) {
    // スーテッドの場合: 同じスートで表示
    return [
      { rank: rank1, suit: '♠', color: 'black' },
      { rank: rank2, suit: '♠', color: 'black' },
    ];
  } else {
    // オフスーツの場合: 異なるスートで表示
    return [
      { rank: rank1, suit: '♠', color: 'black' },
      { rank: rank2, suit: '♥', color: 'red' },
    ];
  }
}

/**
 * スート記号を取得
 * @param suit - スート
 * @returns スート記号
 */
export function getSuitSymbol(suit: '♥' | '♦' | '♣' | '♠'): string {
  return suit;
}

/**
 * ランク表示名を取得
 * @param rank - ランク (例: "A", "K", "Q", "J", "T", "9")
 * @returns 表示名 (例: "A", "K", "Q", "J", "10", "9")
 */
export function getRankDisplay(rank: string): string {
  return rank === 'T' ? '10' : rank;
}

/**
 * カードの色を取得
 * @param suit - スート
 * @returns 色 ('red' | 'black')
 */
export function getCardColor(suit: '♥' | '♦' | '♣' | '♠'): 'red' | 'black' {
  return suit === '♥' || suit === '♦' ? 'red' : 'black';
}
