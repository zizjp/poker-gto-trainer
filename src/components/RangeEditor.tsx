/**
 * RangeEditor Component
 * カスタムレンジエディターのメインコンポーネント（アコーディオン式リスト）
 * パフォーマンス最適化済み
 */

import { useCallback, useMemo, useState } from 'react';
import { HandList } from './HandList';
import type { Hand, HandAction, CustomRange } from '../types';
import { generateAllHands } from '../utils/hands';
import { createEmptyHandAction } from '../utils/validation';

interface RangeEditorProps {
  range: CustomRange;
  onUpdate: (range: CustomRange) => void;
  onSave: () => void;
}

export const RangeEditor: React.FC<RangeEditorProps> = ({
  range,
  onUpdate,
  onSave,
}) => {
  const allHands = useMemo(() => generateAllHands(), []);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(range.name);
  const [editDescription, setEditDescription] = useState(range.description || '');

  // レンジ情報を編集
  const handleSaveInfo = useCallback(() => {
    onUpdate({
      ...range,
      name: editName.trim() || range.name,
      description: editDescription.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditingInfo(false);
  }, [range, editName, editDescription, onUpdate]);

  const handleCancelEditInfo = useCallback(() => {
    setEditName(range.name);
    setEditDescription(range.description || '');
    setIsEditingInfo(false);
  }, [range]);

  // ショートカット: 全クリア
  const handleClearAll = useCallback(() => {
    if (!confirm('全てのハンドを100% Foldにリセットしますか？')) {
      return;
    }

    const clearedHands: Record<Hand, HandAction> = {};
    allHands.forEach(hand => {
      clearedHands[hand] = createEmptyHandAction();
    });

    onUpdate({
      ...range,
      hands: clearedHands,
      updatedAt: new Date().toISOString(),
    });
  }, [allHands, range, onUpdate]);

  // ショートカット: 全Fold
  const handleSetAllFold = useCallback(() => {
    const foldHands: Record<Hand, HandAction> = {};
    allHands.forEach(hand => {
      foldHands[hand] = { allin: 0, raise: 0, call: 0, fold: 100 };
    });

    onUpdate({
      ...range,
      hands: foldHands,
      updatedAt: new Date().toISOString(),
    });
  }, [allHands, range, onUpdate]);

  // 統計情報の計算（メモ化）
  const stats = useMemo(() => {
    let totalAction = 0;
    let totalHands = 0;

    Object.values(range.hands).forEach(action => {
      totalHands++;
      totalAction += (action.allin + action.raise + action.call);
    });

    const vpip = totalHands > 0 ? (totalAction / totalHands) : 0;

    return {
      vpip: vpip.toFixed(1),
      totalHands,
    };
  }, [range.hands]);

  return (
    <div className="range-editor min-h-screen bg-gray-50 pb-20">
      {/* 固定ヘッダー */}
      <div className="header sticky top-0 bg-white shadow-md z-10 px-4 py-4">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            {!isEditingInfo ? (
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{range.name}</h2>
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    編集
                  </button>
                </div>
                {range.description && (
                  <p className="text-xs text-gray-600 mt-1">{range.description}</p>
                )}
              </div>
            ) : (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-2 py-1 text-lg font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="説明（任意）"
                  className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveInfo}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelEditInfo}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow ml-4"
            >
              保存して終了
            </button>
          </div>

          {/* 統計情報 */}
          <div className="flex gap-4 text-xs text-gray-700">
            <span>平均VPIP: <strong>{stats.vpip}%</strong></span>
          </div>
        </div>
      </div>

      {/* ショートカットボタン */}
      <div className="shortcuts max-w-screen-lg mx-auto px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={handleSetAllFold}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            全て Fold
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            全クリア
          </button>
        </div>
      </div>

      {/* ハンドリスト */}
      <div className="max-w-screen-lg mx-auto px-4 mt-4">
        <HandList
          range={range}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};
