/**
 * poker-gto-trainer - Training Setup Component
 * 学習モード設定画面（改善版）
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
    <div className="training-setup w-full h-full flex flex-col overflow-hidden">
      <div className="bg-white rounded-lg shadow-lg p-6 flex-1 flex flex-col overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">🎯 学習設定</h2>

        {/* レンジ選択 */}
        <div className="mb-8">
          <label className="block text-base font-bold text-gray-800 mb-3">
            📚 学習するレンジを選択
          </label>
          <div className="relative">
            <select
              value={selectedRangeId}
              onChange={(e) => setSelectedRangeId(e.target.value)}
              className="w-full px-4 py-4 text-base border-2 border-gray-300 rounded-xl bg-white shadow-sm appearance-none cursor-pointer hover:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
            >
              {ranges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.name}
                  {range.description && ` - ${range.description}`}
                </option>
              ))}
            </select>
          </div>
          {selectedRange && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="font-semibold text-green-600">
                ✓ {Object.keys(selectedRange.hands).length} ハンド
              </span>
              <span className="text-gray-400">|</span>
              <span>登録済み</span>
            </div>
          )}
        </div>

        {/* 出題範囲 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-base font-bold text-gray-800">
              📊 出題範囲
            </label>
            <span className="text-2xl font-bold text-green-600">{coverage}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-green-200 to-green-500 rounded-full appearance-none cursor-pointer slider"
            style={{
              WebkitAppearance: 'none',
              outline: 'none',
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
            <span className="font-semibold">10%</span>
            <span className="font-semibold">50%</span>
            <span className="font-semibold">100%</span>
          </div>
          {selectedRange && (
            <div className="mt-3 text-center bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <span className="text-sm text-green-800 font-semibold">
                約 {Math.floor((Object.keys(selectedRange.hands).length * coverage) / 100)} ハンドから
              </span>
              <span className="text-lg text-green-600 font-bold mx-2">50問</span>
              <span className="text-sm text-green-800 font-semibold">出題されます</span>
            </div>
          )}
        </div>

        {/* 判定モード */}
        <div className="mb-8">
          <label className="block text-base font-bold text-gray-800 mb-4">
            ⚖️ 判定モード
          </label>
          <div className="space-y-3">
            <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
              judgmentMode === 'probabilistic' 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="judgmentMode"
                value="probabilistic"
                checked={judgmentMode === 'probabilistic'}
                onChange={(e) => setJudgmentMode(e.target.value as JudgmentMode)}
                className="mt-1 mr-4 w-5 h-5 accent-green-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🎲</span>
                  <span className="font-bold text-gray-900 text-lg">確率的判定</span>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  各ハンドの混合戦略確率に基づいて判定します。<br/>
                  <span className="text-green-700 font-semibold">例：Raise 4%のハンドでRaiseを選択 → 4%の確率で正解</span>
                </div>
              </div>
            </label>

            <label className={`flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all ${
              judgmentMode === 'frequency' 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="judgmentMode"
                value="frequency"
                checked={judgmentMode === 'frequency'}
                onChange={(e) => setJudgmentMode(e.target.value as JudgmentMode)}
                className="mt-1 mr-4 w-5 h-5 accent-green-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">📈</span>
                  <span className="font-bold text-gray-900 text-lg">頻度表示判定</span>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  50問全体でアクション頻度を追跡し、期待値との誤差で評価します。<br/>
                  <span className="text-green-700 font-semibold">より正確なGTO混合戦略の理解を目指します。</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* 開始ボタン */}
        <button
          onClick={handleStart}
          disabled={!selectedRange}
          className="w-full py-5 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-xl rounded-xl hover:from-green-700 hover:to-green-600 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          🚀 学習を開始する（50問）
        </button>
      </div>

      {/* 説明 */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-md flex-shrink-0">
        <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">💡</span>
          学習のヒント
        </h3>
        <ul className="text-sm text-blue-800 space-y-2 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span><strong>スワイプ操作：</strong>上（Raise）、下（Fold）、左（Call）、右（Allin）</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span>重複なしで50問出題されます</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span>混合戦略では複数のアクションが正解になる場合があります</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span>出題範囲を狭めることで特定のハンドに集中できます</span>
          </li>
        </ul>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 3px solid white;
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #16a34a;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          border: 3px solid white;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #15803d;
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb:hover {
          background: #15803d;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
