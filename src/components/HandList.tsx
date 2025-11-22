/**
 * HandList Component
 * 169ハンドのアコーディオン式リスト
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { HandListItem } from './HandListItem';
import type { Hand, HandAction, CustomRange } from '../types';
import { generateAllHands } from '../utils/hands';

interface HandListProps {
  range: CustomRange;
  onUpdate: (range: CustomRange) => void;
}

export const HandList: React.FC<HandListProps> = ({
  range,
  onUpdate,
}) => {
  const [expandedHand, setExpandedHand] = useState<Hand | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const allHands = useMemo(() => generateAllHands(), []);

  const handleToggle = (hand: Hand) => {
    // 展開時に現在のスクロール位置を保存
    if (expandedHand !== hand && listContainerRef.current) {
      setScrollPosition(listContainerRef.current.scrollTop);
    }
    setExpandedHand(expandedHand === hand ? null : hand);
  };

  // 折りたたみ時にスクロール位置を復元
  useEffect(() => {
    if (!expandedHand && listContainerRef.current && scrollPosition > 0) {
      listContainerRef.current.scrollTop = scrollPosition;
    }
  }, [expandedHand, scrollPosition]);

  const handleSave = (hand: Hand, action: HandAction) => {
    const updatedHands = {
      ...range.hands,
      [hand]: action,
    };

    onUpdate({
      ...range,
      hands: updatedHands,
      updatedAt: new Date().toISOString(),
    });
  };

  // 進捗計算
  const editedCount = useMemo(() => {
    return Object.values(range.hands).filter(
      action => action.fold < 100 || action.allin > 0 || action.raise > 0 || action.call > 0
    ).length;
  }, [range.hands]);

  return (
    <div className="hand-list">
      {/* 進捗表示 */}
      <div className="progress-bar mb-4 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">入力進捗</span>
          <span className="text-sm font-bold text-blue-600">
            {editedCount} / 169 ハンド
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(editedCount / 169) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ハンドリスト */}
      <div 
        ref={listContainerRef}
        className="hand-list-container bg-white rounded-lg shadow overflow-auto"
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {allHands.map(hand => (
          <HandListItem
            key={hand}
            hand={hand}
            action={range.hands[hand]}
            isExpanded={expandedHand === hand}
            onToggle={() => handleToggle(hand)}
            onSave={(action) => handleSave(hand, action)}
            scenarioType={range.scenarioType}
          />
        ))}
      </div>
    </div>
  );
};
