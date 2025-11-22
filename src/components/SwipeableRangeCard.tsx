/**
 * SwipeableRangeCard Component
 * スワイプで削除ボタンが表示されるレンジカード
 */

import { useState, useRef, useEffect } from 'react';
import type { CustomRange } from '../types';

interface SwipeableRangeCardProps {
  range: CustomRange;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const SwipeableRangeCard: React.FC<SwipeableRangeCardProps> = ({
  range,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const DELETE_BUTTON_WIDTH = 80;
  const SWIPE_THRESHOLD = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = offset;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const deltaX = e.touches[0].clientX - startX.current;
    const newOffset = currentX.current + deltaX;

    // 左スワイプ（削除）と右スワイプ（複製）
    if (newOffset >= -DELETE_BUTTON_WIDTH && newOffset <= DELETE_BUTTON_WIDTH) {
      setOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    // 左スワイプ: 削除ボタン
    if (offset < -SWIPE_THRESHOLD) {
      setOffset(-DELETE_BUTTON_WIDTH);
    // 右スワイプ: 複製ボタン
    } else if (offset > SWIPE_THRESHOLD) {
      setOffset(DELETE_BUTTON_WIDTH);
    } else {
      setOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = offset;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSwiping) return;

    const deltaX = e.clientX - startX.current;
    const newOffset = currentX.current + deltaX;

    if (newOffset >= -DELETE_BUTTON_WIDTH && newOffset <= DELETE_BUTTON_WIDTH) {
      setOffset(newOffset);
    }
  };

  const handleMouseUp = () => {
    setIsSwiping(false);

    if (offset < -SWIPE_THRESHOLD) {
      setOffset(-DELETE_BUTTON_WIDTH);
    } else if (offset > SWIPE_THRESHOLD) {
      setOffset(DELETE_BUTTON_WIDTH);
    } else {
      setOffset(0);
    }
  };

  useEffect(() => {
    if (isSwiping) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSwiping, offset]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`「${range.name}」を削除しますか？\nこの操作は取り消せません。`)) {
      onDelete();
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate();
    setOffset(0);
  };

  const handleCardClick = () => {
    if (offset === 0) {
      onEdit();
    } else {
      setOffset(0);
    }
  };

  return (
    <div className="swipeable-card-container relative overflow-hidden">
      {/* 複製ボタン（左側背景） */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-blue-600 rounded-l-lg overflow-hidden"
        style={{ width: `${DELETE_BUTTON_WIDTH}px` }}
      >
        <button
          onClick={handleDuplicate}
          className="h-full w-full text-white font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          複製
        </button>
      </div>

      {/* 削除ボタン（右側背景） */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-600 rounded-r-lg overflow-hidden"
        style={{ width: `${DELETE_BUTTON_WIDTH}px` }}
      >
        <button
          onClick={handleDelete}
          className="h-full w-full text-white font-semibold hover:bg-red-700 active:bg-red-800 transition-colors"
        >
          削除
        </button>
      </div>

      {/* レンジカード（スライド） */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onClick={handleCardClick}
        className="range-card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer relative"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <h3 className="text-xl font-semibold">{range.name}</h3>
        {range.description && (
          <p className="text-sm text-gray-600 mt-1">{range.description}</p>
        )}
        <div className="text-xs text-gray-500 mt-2">
          最終更新: {new Date(range.updatedAt).toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  );
};
