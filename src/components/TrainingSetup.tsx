/**
 * poker-gto-trainer - Training Setup Component
 * 学習モード設定画面
 */

import { useState } from 'react';
import type { CustomRange, JudgmentMode, TrainingSettings } from '../types';

interface TrainingSetupProps {
  ranges: CustomRange[];
  onStartTraining: (settings: TrainingSettings) => void;
}

export function TrainingSetup({ ranges, onStartTraining }: TrainingSetupProps) {
  const [selectedRangeId, setSelectedRangeId] = useState<string>(ranges[0]?.id || '');
  const [coverage, setCoverage] = useState<number>(100);
  const [judgmentMode, setJudgmentMode] = useState<JudgmentMode>('probabilistic');

  const selectedRange = ranges.find(r => r.id === selectedRangeId);

  const handleStart = () => {
    if (!selectedRange) return;

    const settings: TrainingSettings = {
      rangeId: selectedRange.id,
      rangeName: selectedRange.name,
      coverage,
      judgmentMode,
      totalQuestions: 50,
    };

    onStartTraining(settings);
  };

  return (
    <div className="training-setup max-w-md mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">学習設定</h2>

        {/* レンジ選択 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            学習するレンジを選択
          </label>
          <select
            value={selectedRangeId}
            onChange={(e) => setSelectedRangeId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {ranges.map(range => (
              <option key={range.id} value={range.id}>
                {range.name}
                {range.description && ` - ${range.description}`}
              </option>
            ))}
          </select>
          {selectedRange && (
            <p className="text-sm text-gray-500 mt-2">
              {Object.keys(selectedRange.hands).length} ハンド登録済み
            </p>
          )}
        </div>

        {/* 出題範囲 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            出題範囲: {coverage}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          {selectedRange && (
            <p className="text-sm text-gray-600 mt-2">
              約 {Math.floor((Object.keys(selectedRange.hands).length * coverage) / 100)} ハンドから50問出題
            </p>
          )}
        </div>

        {/* 判定モード */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            判定モード
          </label>
          <div className="space-y-3">
            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="judgmentMode"
                value="probabilistic"
                checked={judgmentMode === 'probabilistic'}
                onChange={(e) => setJudgmentMode(e.target.value as JudgmentMode)}
                className="mt-1 mr-3 accent-green-600"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">確率的判定</div>
                <div className="text-sm text-gray-600 mt-1">
                  各ハンドの混合戦略確率に基づいて判定します。
                  例：Raise 4%のハンドでRaiseを選択した場合、4%の確率で正解。
                </div>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="judgmentMode"
                value="frequency"
                checked={judgmentMode === 'frequency'}
                onChange={(e) => setJudgmentMode(e.target.value as JudgmentMode)}
                className="mt-1 mr-3 accent-green-600"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">頻度表示判定</div>
                <div className="text-sm text-gray-600 mt-1">
                  50問全体でアクション頻度を追跡し、期待値との誤差で評価します。
                  より正確なGTO混合戦略の理解を目指します。
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 開始ボタン */}
        <button
          onClick={handleStart}
          disabled={!selectedRange}
          className="w-full py-4 bg-green-600 text-white font-semibold text-lg rounded-lg hover:bg-green-700 transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          学習を開始する（50問）
        </button>
      </div>

      {/* 説明 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 overflow-x-hidden">
        <h3 className="font-semibold text-blue-900 mb-2">📚 学習のヒント</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• スワイプ操作：上（Raise）、下（Fold）、左（Call）、右（Allin）</li>
          <li>• 重複なしで50問出題されます</li>
          <li>• 混合戦略では複数のアクションが正解になる場合があります</li>
          <li>• 出題範囲を狭めることで特定のハンドに集中できます</li>
        </ul>
      </div>
    </div>
  );
}
