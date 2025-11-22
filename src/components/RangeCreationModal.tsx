/**
 * RangeCreationModal Component
 * 新規レンジ作成時の名前・説明入力モーダル
 */

import { useState } from 'react';

interface RangeCreationModalProps {
  onConfirm: (name: string, description: string, scenarioType?: '3bet' | '4bet' | 'preflop') => void;
  onCancel: () => void;
}

export const RangeCreationModal: React.FC<RangeCreationModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scenarioType, setScenarioType] = useState<'3bet' | '4bet' | 'preflop' | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), description.trim(), scenarioType);
    }
  };

  const canSubmit = name.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">新規レンジを作成</h2>
          </div>

          {/* 入力フォーム */}
          <div className="px-6 py-4 space-y-4">
            {/* レンジ名 */}
            <div>
              <label htmlFor="range-name" className="block text-sm font-medium text-gray-700 mb-1">
                レンジ名 <span className="text-red-500">*</span>
              </label>
              <input
                id="range-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 3Bet vs UTG - GTO"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                {name.length} / 50 文字
              </p>
            </div>

            {/* シナリオタイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                シナリオタイプ（任意）
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScenarioType(scenarioType === '3bet' ? undefined : '3bet')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    scenarioType === '3bet'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  3Bet
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioType(scenarioType === '4bet' ? undefined : '4bet')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    scenarioType === '4bet'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  4Bet
                </button>
                <button
                  type="button"
                  onClick={() => setScenarioType(scenarioType === 'preflop' ? undefined : 'preflop')}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors ${
                    scenarioType === 'preflop'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Preflop
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                3Bet/4Betは自動計算が有効になります
              </p>
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="range-description" className="block text-sm font-medium text-gray-700 mb-1">
                説明（任意）
              </label>
              <textarea
                id="range-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例: BTNからのUTGオープンに対する3Betレンジ"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length} / 200 文字
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="px-6 py-4 bg-gray-50 flex gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                flex-1 px-4 py-2 font-medium rounded-lg transition-colors
                ${canSubmit
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
