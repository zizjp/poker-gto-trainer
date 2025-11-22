/**
 * FrequencyEditor Component
 * インライン頻度編集UI（100%検証付き）
 */

import React, { useState, useEffect } from 'react';
import type { HandAction } from '../types';
import { validateFrequencies, parseFrequencyInput } from '../utils/validation';

interface FrequencyEditorProps {
  hand: string;
  initialAction: HandAction;
  onSave: (action: HandAction) => void;
  onCancel: () => void;
}

export const FrequencyEditor: React.FC<FrequencyEditorProps> = ({
  hand,
  initialAction,
  onSave,
  onCancel,
}) => {
  const [action, setAction] = useState<HandAction>(initialAction);
  const [validation, setValidation] = useState(validateFrequencies(initialAction));

  useEffect(() => {
    setValidation(validateFrequencies(action));
  }, [action]);

  const handleInputChange = (field: keyof HandAction, value: string) => {
    const parsed = parseFrequencyInput(value);
    if (parsed !== null) {
      setAction(prev => ({
        ...prev,
        [field]: parsed,
      }));
    }
  };

  const handleQuickSet = (field: keyof HandAction, value: number) => {
    setAction(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (validation.isValid) {
      onSave(action);
    }
  };

  const canSave = validation.isValid;

  return (
    <div className="frequency-editor bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{hand}</h3>
        <div className={`text-sm font-semibold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
          {validation.isValid ? '✓ 合計: 100%' : validation.error}
        </div>
      </div>

      {/* 入力フィールド */}
      <div className="space-y-3">
        {/* All-in */}
        <div className="flex items-center gap-2">
          <label className="w-16 text-sm font-medium text-red-700">All-in</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={action.allin}
            onChange={(e) => handleInputChange('allin', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <span className="w-8 text-sm text-gray-600">%</span>
          <button
            onClick={() => handleQuickSet('allin', 0)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            0%
          </button>
          <button
            onClick={() => handleQuickSet('allin', 100)}
            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded"
          >
            100%
          </button>
        </div>

        {/* Raise */}
        <div className="flex items-center gap-2">
          <label className="w-16 text-sm font-medium text-orange-700">Raise</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={action.raise}
            onChange={(e) => handleInputChange('raise', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <span className="w-8 text-sm text-gray-600">%</span>
          <button
            onClick={() => handleQuickSet('raise', 0)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            0%
          </button>
          <button
            onClick={() => handleQuickSet('raise', 100)}
            className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded"
          >
            100%
          </button>
        </div>

        {/* Call */}
        <div className="flex items-center gap-2">
          <label className="w-16 text-sm font-medium text-green-700">Call</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={action.call}
            onChange={(e) => handleInputChange('call', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <span className="w-8 text-sm text-gray-600">%</span>
          <button
            onClick={() => handleQuickSet('call', 0)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            0%
          </button>
          <button
            onClick={() => handleQuickSet('call', 100)}
            className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded"
          >
            100%
          </button>
        </div>

        {/* Fold */}
        <div className="flex items-center gap-2">
          <label className="w-16 text-sm font-medium text-gray-700">Fold</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={action.fold}
            onChange={(e) => handleInputChange('fold', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <span className="w-8 text-sm text-gray-600">%</span>
          <button
            onClick={() => handleQuickSet('fold', 0)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            0%
          </button>
          <button
            onClick={() => handleQuickSet('fold', 100)}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            100%
          </button>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`
            flex-1 py-2 rounded font-semibold transition-colors
            ${canSave 
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {canSave ? '保存' : '100%にしてください'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-semibold transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};
