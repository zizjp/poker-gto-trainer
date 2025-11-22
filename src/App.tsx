/**
 * poker-gto-trainer - Main App
 * Phase 1: カスタムレンジエディターのプロトタイプ
 */

import { useState, useEffect } from 'react';
import { RangeEditor } from './components/RangeEditor';
import { RangeCreationModal } from './components/RangeCreationModal';
import { SwipeableRangeCard } from './components/SwipeableRangeCard';
import { TrainingSetup } from './components/TrainingSetup';
import { TrainingSession } from './components/TrainingSession';
import { TrainingResultComponent } from './components/TrainingResult';
import type { 
  CustomRange, 
  Hand, 
  HandAction, 
  AppMode, 
  TrainingSettings,
  TrainingQuestion,
  TrainingResult,
  FrequencyTracker,
} from './types';
import { generateAllHands } from './utils/hands';
import { createEmptyHandAction } from './utils/validation';
import { saveCustomRange, loadAllCustomRanges, deleteCustomRange, exportAllData, importData } from './utils/storage';
import { 
  generateQuestions, 
  judgeProbabilistic, 
  initializeFrequencyTracker,
  recordFrequencyAnswer,
  calculateTrainingResult,
} from './utils/training';
import './App.css';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('debug');
  const [currentRange, setCurrentRange] = useState<CustomRange | null>(null);
  const [savedRanges, setSavedRanges] = useState<CustomRange[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);

  // 学習モード用の状態
  const [trainingSettings, setTrainingSettings] = useState<TrainingSettings | null>(null);
  const [trainingQuestions, setTrainingQuestions] = useState<TrainingQuestion[]>([]);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [frequencyTracker, setFrequencyTracker] = useState<FrequencyTracker | null>(null);
  const [trainingPhase, setTrainingPhase] = useState<'setup' | 'session' | 'result'>('setup');

  // 初期化: 保存されたレンジを読み込み
  useEffect(() => {
    const ranges = loadAllCustomRanges();
    setSavedRanges(ranges);
  }, []);

  // 新規レンジ作成モーダルを表示
  const handleCreateNewRange = () => {
    setShowCreationModal(true);
  };

  // レンジ作成を確定
  const handleConfirmCreation = (name: string, description: string, scenarioType?: '3bet' | '4bet' | 'preflop') => {
    const allHands = generateAllHands();
    const emptyHands: Record<Hand, HandAction> = {};
    
    allHands.forEach(hand => {
      emptyHands[hand] = createEmptyHandAction();
    });

    const newRange: CustomRange = {
      id: `range-${Date.now()}`,
      name,
      description,
      scenarioType,
      hands: emptyHands,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentRange(newRange);
    setShowCreationModal(false);
    setShowEditor(true);
  };

  // レンジ作成をキャンセル
  const handleCancelCreation = () => {
    setShowCreationModal(false);
  };

  // レンジを編集
  const handleEditRange = (range: CustomRange) => {
    setCurrentRange(range);
    setShowEditor(true);
  };

  // レンジを保存
  const handleSaveRange = () => {
    if (currentRange) {
      saveCustomRange(currentRange);
      const ranges = loadAllCustomRanges();
      setSavedRanges(ranges);
      setShowEditor(false);
      setCurrentRange(null);
    }
  };

  // レンジを更新
  const handleUpdateRange = (updatedRange: CustomRange) => {
    setCurrentRange(updatedRange);
  };

  // レンジを削除
  const handleDeleteRange = (rangeId: string) => {
    deleteCustomRange(rangeId);
    const ranges = loadAllCustomRanges();
    setSavedRanges(ranges);
  };

  // レンジを複製
  const handleDuplicateRange = (range: CustomRange) => {
    // 複製モーダルを表示する代わりに、直接複製を作成
    const duplicatedRange: CustomRange = {
      ...range,
      id: `range-${Date.now()}`,
      name: `${range.name} (コピー)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCustomRange(duplicatedRange);
    const ranges = loadAllCustomRanges();
    setSavedRanges(ranges);

    // 複製後、すぐに編集画面へ
    setCurrentRange(duplicatedRange);
    setShowEditor(true);
  };

  // エクスポート
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poker-gto-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 学習開始
  const handleStartTraining = (settings: TrainingSettings) => {
    const range = savedRanges.find(r => r.id === settings.rangeId);
    if (!range) return;

    const questions = generateQuestions(range, settings.coverage);
    setTrainingSettings(settings);
    setTrainingQuestions(questions);

    // 頻度表示モードの場合、トラッカーを初期化
    if (settings.judgmentMode === 'frequency') {
      const tracker = initializeFrequencyTracker(questions);
      setFrequencyTracker(tracker);
    } else {
      setFrequencyTracker(null);
    }

    setTrainingPhase('session');
  };

  // 学習完了
  const handleTrainingComplete = (
    answeredQuestions: TrainingQuestion[],
    tracker?: FrequencyTracker
  ) => {
    if (!trainingSettings) return;

    // 判定処理
    const judgedQuestions = answeredQuestions.map((q) => {
      if (!q.userAnswer) return q;

      if (trainingSettings.judgmentMode === 'probabilistic') {
        // 確率的判定
        const { isCorrect, probability } = judgeProbabilistic(
          q.correctActions,
          q.userAnswer
        );
        return { ...q, isCorrect, expectedProbability: probability };
      } else {
        // 頻度表示判定: 回答を記録
        if (tracker) {
          recordFrequencyAnswer(tracker, q.hand, q.userAnswer);
        }
        // 頻度表示モードでは個別のisCorrectは意味を持たない
        return { ...q, isCorrect: true };
      }
    });

    // 結果を計算
    const result = calculateTrainingResult(
      trainingSettings,
      judgedQuestions,
      trainingSettings.judgmentMode,
      tracker
    );

    setTrainingResult(result);
    setTrainingPhase('result');
  };

  // 学習をキャンセル
  const handleTrainingCancel = () => {
    setTrainingPhase('setup');
    setTrainingSettings(null);
    setTrainingQuestions([]);
    setTrainingResult(null);
    setFrequencyTracker(null);
  };

  // 学習を再開始
  const handleTrainingRestart = () => {
    if (!trainingSettings) return;
    handleStartTraining(trainingSettings);
  };

  // ホームに戻る
  const handleBackToHome = () => {
    setTrainingPhase('setup');
    setTrainingSettings(null);
    setTrainingQuestions([]);
    setTrainingResult(null);
    setFrequencyTracker(null);
  };

  // インポート
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonString = event.target?.result as string;
          importData(jsonString);
          const ranges = loadAllCustomRanges();
          setSavedRanges(ranges);
          alert('インポートに成功しました！');
        } catch (error) {
          alert('インポートに失敗しました。ファイルが破損している可能性があります。');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className={`app min-h-screen ${appMode === 'debug' ? 'bg-gray-50' : 'bg-green-50'}`}>
      {/* 学習セッション画面 */}
      {trainingPhase === 'session' && trainingSettings && trainingQuestions.length > 0 && (
        <TrainingSession
          settings={trainingSettings}
          questions={trainingQuestions}
          onComplete={handleTrainingComplete}
          onCancel={handleTrainingCancel}
          frequencyTracker={frequencyTracker || undefined}
        />
      )}

      {/* 学習結果画面 */}
      {trainingPhase === 'result' && trainingResult && (
        <TrainingResultComponent
          result={trainingResult}
          onRestart={handleTrainingRestart}
          onBackToHome={handleBackToHome}
        />
      )}

      {/* ホーム画面またはエディター画面 */}
      {trainingPhase === 'setup' && !showEditor ? (
        // ホーム画面
        <div className="home-screen max-w-screen-lg mx-auto p-6">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Poker GTO Trainer</h1>
            <p className="text-gray-600 mt-2">
              GTO混合戦略に基づくポーカー学習アプリ
            </p>
          </header>

          {/* モード切り替えタブ */}
          <div className="mode-tabs flex gap-2 mb-6">
            <button
              onClick={() => setAppMode('debug')}
              className={`
                flex-1 py-3 font-semibold rounded-lg transition-all shadow
                ${appMode === 'debug'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              デバッグモード
            </button>
            <button
              onClick={() => setAppMode('training')}
              className={`
                flex-1 py-3 font-semibold rounded-lg transition-all shadow
                ${appMode === 'training'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              学習モード
            </button>
          </div>

          {/* デバッグモードのコンテンツ */}
          {appMode === 'debug' && (
            <>
              {/* 新規作成ボタン */}
              <button
                onClick={handleCreateNewRange}
                className="w-full py-4 mb-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                + 新規レンジを作成
              </button>

              {/* インポート・エクスポートボタン */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow"
                >
                  インポート
                </button>
                <button
                  onClick={handleExport}
                  disabled={savedRanges.length === 0}
                  className={`
                    flex-1 py-3 font-semibold rounded-lg transition-colors shadow
                    ${savedRanges.length > 0
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  エクスポート
                </button>
              </div>

              {/* 保存済みレンジ一覧 */}
              <div className="saved-ranges">
                <h2 className="text-2xl font-bold mb-4">保存済みレンジ</h2>
                
                {savedRanges.length === 0 ? (
                  <div className="empty-state text-center py-12 text-gray-500">
                    <p>まだレンジが作成されていません</p>
                    <p className="text-sm mt-2">「新規レンジを作成」から始めましょう</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {savedRanges.map(range => (
                      <SwipeableRangeCard
                        key={range.id}
                        range={range}
                        onEdit={() => handleEditRange(range)}
                        onDelete={() => handleDeleteRange(range.id)}
                        onDuplicate={() => handleDuplicateRange(range)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 学習モードのコンテンツ */}
          {appMode === 'training' && (
            <div className="training-mode">
              {savedRanges.length === 0 ? (
                <div className="empty-state text-center py-12 text-gray-500">
                  <p>学習に使用できるレンジがありません</p>
                  <p className="text-sm mt-2">デバッグモードでレンジを作成してください</p>
                </div>
              ) : (
                <TrainingSetup
                  ranges={savedRanges}
                  onStartTraining={handleStartTraining}
                />
              )}
            </div>
          )}

          {/* フッター */}
          <footer className="mt-12 text-center text-sm text-gray-500">
            <p>{appMode === 'debug' ? 'Phase 1: カスタムレンジエディター' : 'Phase 3: 学習モード（開発中）'}</p>
            <p className="mt-1">Powered by GTO Wizard Data</p>
          </footer>
        </div>
      ) : trainingPhase === 'setup' && showEditor ? (
        // エディター画面
        currentRange && (
          <RangeEditor
            range={currentRange}
            onUpdate={handleUpdateRange}
            onSave={handleSaveRange}
          />
        )
      ) : null}

      {/* レンジ作成モーダル */}
      {showCreationModal && (
        <RangeCreationModal
          onConfirm={handleConfirmCreation}
          onCancel={handleCancelCreation}
        />
      )}
    </div>
  );
}

export default App;
