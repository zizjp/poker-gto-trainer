/**
 * poker-gto-trainer - Swipeable Card Component (v0.8.1)
 * Framer Motionを使った高度なスワイプカードコンポーネント
 * バグ修正: トランプ表示の重複を修正（5♠5 → 5♠）
 */

import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Hand } from '../types';
import { handToCards, getRankDisplay } from '../utils/cards';

interface SwipeableCardProps {
  hand: Hand;
  onSwipe: (direction: 'up' | 'left' | 'right') => void;
  isAnimating: boolean;
}

export function SwipeableCard({ hand, onSwipe, isAnimating }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // スワイプ方向に応じた背景色の計算
  const backgroundLeft = useTransform(x, [-150, 0], [1, 0]);
  const backgroundRight = useTransform(x, [0, 150], [0, 1]);
  const backgroundUp = useTransform(y, [-150, 0], [1, 0]);

  // ドラッグ中のヒント表示用のopacity計算
  const leftOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);
  const upOpacity = useTransform(y, [-150, -50, 0], [1, 0.5, 0]);

  // 回転角度の計算
  const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);

  // ドラッグ終了時の処理
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100; // スワイプ判定の閾値
    const { offset } = info;

    // スワイプ方向を判定（3方向: 左Call、上Fold、右Raise）
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // 横方向のスワイプ
      if (Math.abs(offset.x) > threshold) {
        if (offset.x > 0) {
          onSwipe('right'); // Raise
        } else {
          onSwipe('left'); // Call
        }
      }
    } else {
      // 縦方向のスワイプ（上のみ有効）
      if (offset.y < -threshold) {
        onSwipe('up'); // Fold
      }
    }
  };

  // トランプカードを取得
  const [card1, card2] = handToCards(hand);

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotate,
      }}
      animate={isAnimating ? { opacity: 0 } : { opacity: 1 }}
      className="relative rounded-2xl shadow-2xl p-8 cursor-grab active:cursor-grabbing"
      initial={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 背景色のレイヤー（ドラッグ中に色が変わる） */}
      <motion.div
        className="absolute inset-0 bg-blue-100 rounded-2xl"
        style={{ opacity: backgroundLeft }}
      />
      <motion.div
        className="absolute inset-0 bg-red-100 rounded-2xl"
        style={{ opacity: backgroundRight }}
      />
      <motion.div
        className="absolute inset-0 bg-gray-100 rounded-2xl"
        style={{ opacity: backgroundUp }}
      />

      {/* ベースの背景 */}
      <div className="absolute inset-0 bg-white rounded-2xl" style={{ zIndex: -1 }} />

      {/* ドラッグ中のヒント表示 */}
      <motion.div
        className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-blue-600 select-none"
        style={{ opacity: leftOpacity }}
      >
        👈 CALL
      </motion.div>

      <motion.div
        className="absolute right-6 top-1/2 -translate-y-1/2 text-4xl font-black text-red-600 select-none"
        style={{ opacity: rightOpacity }}
      >
        RAISE 👉
      </motion.div>

      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl font-black text-gray-600 select-none"
        style={{ opacity: upOpacity }}
      >
        👆 FOLD
      </motion.div>

      {/* トランプカード表示（修正: 上下の数字を削除してシンプルに） */}
      <div className="flex justify-center items-center gap-4 my-12 relative z-10">
        {/* カード1 */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-32 h-44 flex flex-col items-center justify-center border-2 border-gray-200">
          <div className={`text-6xl font-bold ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {getRankDisplay(card1.rank)}
          </div>
          <div className={`text-7xl ${card1.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {card1.suit}
          </div>
        </div>

        {/* カード2 */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-32 h-44 flex flex-col items-center justify-center border-2 border-gray-200">
          <div className={`text-6xl font-bold ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {getRankDisplay(card2.rank)}
          </div>
          <div className={`text-7xl ${card2.color === 'red' ? 'text-red-600' : 'text-gray-900'}`}>
            {card2.suit}
          </div>
        </div>
      </div>

      {/* ハンド表記 */}
      <div className="text-center text-gray-600 text-sm font-semibold mt-4 relative z-10">
        {hand}
      </div>
    </motion.div>
  );
}
