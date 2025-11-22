/**
 * poker-gto-trainer - Training Setup Component (v0.8.4)
 * UI完全リニューアル: モダンでミニマルなデザイン
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
            学習設定
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            プリフロップGTO戦略をマスターしましょう
          </p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            
            {/* レンジ選択 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-slate-800">
                  レンジ選択
                </label>
                {selectedRange && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {Object.keys(selectedRange.hands).length} ハンド
                  </span>
                )}
              </div>
              
              <select
                value={selectedRangeId}
                onChange={(e) => setSelectedRangeId(e.target.value)}
                className="w-full px-4 py-4 text-base border-2 border-slate-200 rounded-2xl bg-slate-50 hover:bg-white hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all appearance-none cursor-pointer font-medium text-slate-700"
                style={{ 
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", 
                  backgroundPosition: "right 1rem center", 
                  backgroundRepeat: "no-repeat", 
                  backgroundSize: "1.25em 1.25em", 
                  paddingRight: "3rem" 
                }}
              >
                {ranges.map(range => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                    {range.description && ` - ${range.description}`}
                  </option>
                ))}
              </select>

              {selectedRange?.description && (
                <p className="text-sm text-slate-500 pl-1">
                  {selectedRange.description}
                </p>
              )}
            </div>

            {/* 出題範囲スライダー */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-bold text-slate-800">
                  出題範囲
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-emerald-600">{coverage}</span>
                  <span className="text-lg font-semibold text-slate-400">%</span>
                </div>
              </div>

              {/* カスタムスライダー */}
              <div className="relative pt-2 pb-4">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={coverage}
                  onChange={(e) => setCoverage(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer custom-slider"
                />
                <div className="flex justify-between text-xs font-medium text-slate-400 mt-3 px-1">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {selectedRange && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-slate-700">約</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {Math.floor((Object.keys(selectedRange.hands).length * coverage) / 100)}
                    </span>
                    <span className="text-slate-700">ハンドから</span>
                    <span className="text-2xl font-bold text-slate-800">50</span>
                    <span className="text-slate-700">問出題</span>
                  </div>
                </div>
              )}
            </div>

            {/* 判定モード選択 */}
            <div className="space-y-4">
              <label className="text-lg font-bold text-slate-800 block">
                判定モード
              </label>

              <div className="grid gap-3">
                {/* 確率的判定 */}
                <label 
                  className={`relative flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                    judgmentMode === 'probabilistic'
                      ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="judgmentMode"
                    value="probabilistic"
                    checked={judgmentMode === 'probabilistic'}
                    onChange={(e) => setJudgmentMode(e.target.value as JudgmentMode)}
                    className="sr-only"
                  />
                  
                  {/* カスタムラジオボタン */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 mt-0.5 transition-all ${
                    judgmentMode === 'probabilistic'
                      ? 'border-emerald-500 bg-emerald-500 shadow-sm'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {judgmentMode === 'probabilistic' && (
                      <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎲</span>
                      <span className="font-bold text-slate-900">確率的判定</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      各ハンドの混合戦略確率に基づいて判定します。
                      <span className="block mt-1 text-emerald-700 font-medium">
                        例：Raise 4%のハンドでRaiseを選択 → 4%の確率で正解
                      </span>
                    </p>
                  </div>
                </label>

                {/* 頻度表示判定 */}
                <label 
                  className={`relative flex items-start p-5 border-2 rounded-2xl cursor-pointer transition-all group ${
                    judgmentMode === 'frequency'
                      ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="judgmentMode"
                    value="frequency"
                    checked={judgmentMode === 'frequency'}
                    onChange={(e) => setJudgmentMode(e.target.value as JudgmentMode)}
                    className="sr-only"
                  />
                  
                  {/* カスタムラジオボタン */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 mt-0.5 transition-all ${
                    judgmentMode === 'frequency'
                      ? 'border-emerald-500 bg-emerald-500 shadow-sm'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}>
                    {judgmentMode === 'frequency' && (
                      <div className="w-full h-full rounded-full bg-white scale-[0.4]"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📈</span>
                      <span className="font-bold text-slate-900">頻度表示判定</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      50問全体でアクション頻度を追跡し、期待値との誤差で評価します。
                      <span className="block mt-1 text-emerald-700 font-medium">
                        より正確なGTO混合戦略の理解を目指します
                      </span>
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 開始ボタン */}
            <button
              onClick={handleStart}
              disabled={!selectedRange}
              className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              学習を開始する（50問）
            </button>
          </div>
        </div>

        {/* ヒントセクション */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-3xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="font-bold text-slate-800 text-lg">学習のヒント</h3>
          </div>
          
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-1 flex-shrink-0">✓</span>
              <span><strong className="text-slate-700">スワイプ操作：</strong>左（Call）、上（Fold）、右（Raise）</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-1 flex-shrink-0">✓</span>
              <span>PCではマウスドラッグまたはキーボード矢印キーで操作できます</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-1 flex-shrink-0">✓</span>
              <span>重複なしで50問出題されます</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-1 flex-shrink-0">✓</span>
              <span>混合戦略では複数のアクションが正解になる場合があります</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500 font-bold mt-1 flex-shrink-0">✓</span>
              <span>出題範囲を狭めることで特定のハンドに集中できます</span>
            </li>
          </ul>
        </div>
      </div>

      {/* カスタムスライダーのスタイル */}
      <style>{`
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          border: 3px solid white;
          transition: all 0.2s ease;
        }

        .custom-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
        }

        .custom-slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }

        .custom-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          border: 3px solid white;
          transition: all 0.2s ease;
        }

        .custom-slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
        }

        .custom-slider::-moz-range-thumb:active {
          transform: scale(1.05);
        }

        /* スライダートラックのグラデーション */
        .custom-slider {
          background: linear-gradient(
            to right,
            #cbd5e1 0%,
            #cbd5e1 ${(coverage - 10) / 0.9}%,
            #10b981 ${(coverage - 10) / 0.9}%,
            #10b981 100%
          );
        }
      `}</style>
    </div>
  );
}
