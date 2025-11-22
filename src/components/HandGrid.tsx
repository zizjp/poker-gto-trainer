/**
 * HandGrid Component
 * 13x13のポーカーハンドグリッド表示
 */

import React from 'react';
import { gridPositionToHand } from '../utils/hands';
import type { Hand, HandAction } from '../types';

interface HandGridProps {
  selectedHand: Hand | null;
  onHandSelect: (hand: Hand) => void;
  rangeData?: Record<Hand, HandAction>;
  colorMode?: 'action' | 'frequency';
}

export const HandGrid: React.FC<HandGridProps> = ({
  selectedHand,
  onHandSelect,
  rangeData,
  colorMode = 'frequency',
}) => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  /**
   * ハンドの背景色を取得
   */
  const getHandColor = (hand: Hand): string => {
    if (!rangeData || !rangeData[hand]) {
      return 'bg-gray-100';
    }

    const action = rangeData[hand];
    
    if (colorMode === 'action') {
      // 最も頻度が高いアクションで色分け
      const maxAction = Math.max(action.allin, action.raise, action.call, action.fold);
      
      if (action.allin === maxAction && action.allin > 0) return 'bg-red-500 text-white';
      if (action.raise === maxAction && action.raise > 0) return 'bg-orange-500 text-white';
      if (action.call === maxAction && action.call > 0) return 'bg-green-500 text-white';
      return 'bg-gray-200';
    } else {
      // 総アクション頻度（fold以外）で濃淡
      const actionFrequency = action.allin + action.raise + action.call;
      
      if (actionFrequency >= 90) return 'bg-red-600 text-white';
      if (actionFrequency >= 70) return 'bg-red-500 text-white';
      if (actionFrequency >= 50) return 'bg-orange-500 text-white';
      if (actionFrequency >= 30) return 'bg-yellow-500 text-white';
      if (actionFrequency >= 10) return 'bg-green-500 text-white';
      return 'bg-gray-200';
    }
  };

  return (
    <div className="hand-grid">
      <div className="grid grid-cols-13 gap-1 max-w-screen-md mx-auto">
        {ranks.map((_, row) => (
          ranks.map((__, col) => {
            const hand = gridPositionToHand(row, col);
            const isSelected = selectedHand === hand;
            const colorClass = getHandColor(hand);

            return (
              <button
                key={hand}
                onClick={() => onHandSelect(hand)}
                className={`
                  hand-cell
                  aspect-square
                  flex items-center justify-center
                  text-xs sm:text-sm font-semibold
                  border-2 transition-all
                  ${isSelected ? 'border-blue-600 scale-110 z-10' : 'border-gray-300'}
                  ${colorClass}
                  hover:scale-105 hover:z-10
                  active:scale-95
                `}
              >
                {hand}
              </button>
            );
          })
        ))}
      </div>

      {/* 凡例 */}
      <div className="legend mt-4 flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 border border-gray-300"></div>
          <span>90%+ アクション</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-500 border border-gray-300"></div>
          <span>50-70%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 border border-gray-300"></div>
          <span>10-30%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300"></div>
          <span>Fold</span>
        </div>
      </div>
    </div>
  );
};
