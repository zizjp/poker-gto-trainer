/**
 * HandListItem Component
 * アコーディオン式の各ハンド行（3Bet/4Bet最適化版）
 */

import { useState, useEffect } from 'react';
import type { Hand, HandAction } from '../types';
import { validateFrequencies, parseFrequencyInput } from '../utils/validation';

interface HandListItemProps {
  hand: Hand;
  action: HandAction;
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (action: HandAction) => void;
  scenarioType?: '3bet' | '4bet' | 'preflop';
}

export const HandListItem: React.FC<HandListItemProps> = ({
  hand,
  action: initialAction,
  isExpanded,
  onToggle,
  onSave,
  scenarioType,
}) => {
  const [action, setAction] = useState<HandAction>(initialAction);
  const validation = validateFrequencies(action);

  // 3Bet/4Betモードでは自動計算
  const is3BetOr4Bet = scenarioType === '3bet' || scenarioType === '4bet';

  useEffect(() => {
    if (is3BetOr4Bet) {
      // Allinは常に0
      setAction(prev => ({ ...prev, allin: 0 }));
    }
  }, [is3BetOr4Bet]);

  const handleInputChange = (field: keyof HandAction, value: string) => {
    const parsed = parseFrequencyInput(value);
    if (parsed !== null) {
      const newAction = { ...action, [field]: parsed };

      // 3Bet/4Betモードでも、入力中は自動計算しない
      if (is3BetOr4Bet) {
        newAction.allin = 0;
      }

      setAction(newAction);
    }
  };

  // フォーカスが外れた時に自動計算
  const handleBlur = () => {
    if (!is3BetOr4Bet) return;

    const { raise, call, fold } = action;
    const total = raise + call + fold;

    // すでに100%なら何もしない
    if (Math.abs(total - 100) < 0.01) return;

    // 2つ以上入力されている場合、残りを自動計算
    const filledCount = [raise, call, fold].filter(v => v > 0).length;
    
    if (filledCount >= 2) {
      const newAction = { ...action, allin: 0 };
      
      // 0のフィールドを自動計算
      if (raise === 0) {
        newAction.raise = Math.max(0, 100 - call - fold);
      } else if (call === 0) {
        newAction.call = Math.max(0, 100 - raise - fold);
      } else if (fold === 0) {
        newAction.fold = Math.max(0, 100 - raise - call);
      }
      
      setAction(newAction);
    }
  };

  const handleQuickSet = (field: keyof HandAction, value: number) => {
    const newAction = { ...action, [field]: value };

    // 3Bet/4Betモードの自動計算
    if (is3BetOr4Bet) {
      newAction.allin = 0;
      
      const { raise, call, fold } = newAction;
      
      // 100%ボタンを押した場合、他を0にする
      if (value === 100) {
        if (field === 'raise') {
          newAction.call = 0;
          newAction.fold = 0;
        } else if (field === 'call') {
          newAction.raise = 0;
          newAction.fold = 0;
        } else if (field === 'fold') {
          newAction.raise = 0;
          newAction.call = 0;
        }
      } else {
        // 0%ボタンまたは通常入力の場合、残りを調整
        const filledCount = [raise, call, fold].filter(v => v > 0).length;
        
        if (filledCount >= 2) {
          if (field !== 'raise' && raise === 0) {
            newAction.raise = Math.max(0, 100 - call - fold);
          } else if (field !== 'call' && call === 0) {
            newAction.call = Math.max(0, 100 - raise - fold);
          } else if (field !== 'fold' && fold === 0) {
            newAction.fold = Math.max(0, 100 - raise - call);
          }
        }
      }
    }

    setAction(newAction);
  };

  const handleSave = () => {
    if (validation.isValid) {
      onSave(action);
      // 保存後に折りたたむが、スクロール位置は維持
      onToggle();
    }
  };

  const handleCancel = () => {
    setAction(initialAction); // 元に戻す
    onToggle();
  };

  // サマリー表示（折りたたみ時）
  const isEdited = initialAction.fold < 100 || initialAction.allin > 0 || initialAction.raise > 0 || initialAction.call > 0;
  const summary = isEdited
    ? is3BetOr4Bet
      ? `R:${initialAction.raise}% C:${initialAction.call}% F:${initialAction.fold}%`
      : `A:${initialAction.allin}% R:${initialAction.raise}% C:${initialAction.call}% F:${initialAction.fold}%`
    : '未設定';

  return (
    <div className="hand-list-item border-b border-gray-200">
      {/* ヘッダー（常に表示） */}
      <div
        onClick={onToggle}
        className="hand-header flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="hand-name text-lg font-bold text-gray-900 w-12">{hand}</span>
          {!isExpanded && (
            <span className={`hand-summary text-sm ${isEdited ? 'text-gray-700' : 'text-gray-400'}`}>
              {summary}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xl">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>

      {/* 編集UI（展開時のみ表示） */}
      {isExpanded && (
        <div className="hand-editor bg-gray-50 px-4 py-4">
          {/* 検証メッセージ */}
          <div className={`text-sm font-semibold mb-3 ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.isValid ? '✓ 合計: 100%' : validation.error}
          </div>

          {/* 入力フィールド */}
          <div className="space-y-3">
            {/* All-in（3Bet/4Betでは非表示） */}
            {!is3BetOr4Bet && (
              <div className="flex items-center gap-2">
                <label className="w-14 text-sm font-medium text-red-700">Allin</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={action.allin}
                  onChange={(e) => handleInputChange('allin', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <span className="w-6 text-sm text-gray-600">%</span>
                <button
                  onClick={() => handleQuickSet('allin', 0)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  0
                </button>
                <button
                  onClick={() => handleQuickSet('allin', 100)}
                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded"
                >
                  100
                </button>
              </div>
            )}

            {/* Raise */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-sm font-medium text-orange-700">Raise</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={action.raise}
                onChange={(e) => handleInputChange('raise', e.target.value)}
                onBlur={handleBlur}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="w-6 text-sm text-gray-600">%</span>
              <button
                onClick={() => handleQuickSet('raise', 0)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                0
              </button>
              <button
                onClick={() => handleQuickSet('raise', 100)}
                className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded"
              >
                100
              </button>
            </div>

            {/* Call */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-sm font-medium text-green-700">Call</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={action.call}
                onChange={(e) => handleInputChange('call', e.target.value)}
                onBlur={handleBlur}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <span className="w-6 text-sm text-gray-600">%</span>
              <button
                onClick={() => handleQuickSet('call', 0)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                0
              </button>
              <button
                onClick={() => handleQuickSet('call', 100)}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded"
              >
                100
              </button>
            </div>

            {/* Fold */}
            <div className="flex items-center gap-2">
              <label className="w-14 text-sm font-medium text-gray-700">Fold</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={action.fold}
                onChange={(e) => handleInputChange('fold', e.target.value)}
                onBlur={handleBlur}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
              <span className="w-6 text-sm text-gray-600">%</span>
              <button
                onClick={() => handleQuickSet('fold', 0)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                0
              </button>
              <button
                onClick={() => handleQuickSet('fold', 100)}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                100
              </button>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={!validation.isValid}
              className={`
                flex-1 py-2 rounded font-semibold transition-colors
                ${validation.isValid 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {validation.isValid ? '保存' : '100%にしてください'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
