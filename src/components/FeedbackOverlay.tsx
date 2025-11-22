/**
 * poker-gto-trainer - Feedback Overlay Component (v0.8.4)
 * 確率表示バグ修正
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { HandAction } from '../types';

interface FeedbackOverlayProps {
  isVisible: boolean;
  isCorrect: boolean;
  probability?: number;
  onNext: () => void;
  correctActions?: HandAction;
  userAction?: 'raise' | 'call' | 'fold' | 'allin';
}

export function FeedbackOverlay({ 
  isVisible, 
  isCorrect, 
  probability, 
  onNext,
  correctActions,
  userAction
}: FeedbackOverlayProps) {
  
  // 解説文を生成
  const getExplanation = () => {
    if (!correctActions || !userAction) return null;
    
    const actionLabels: Record<string, string> = {
      raise: 'Raise',
      call: 'Call',
      fold: 'Fold',
      allin: 'All-in'
    };
    
    // 正解アクションのリストを作成
    const validActions = (Object.keys(correctActions) as Array<keyof HandAction>)
      .filter(action => correctActions[action] > 0)
      .map(action => ({
        action,
        probability: correctActions[action]
      }))
      .sort((a, b) => b.probability - a.probability);
    
    if (validActions.length === 0) return null;
    
    // 最適アクションを判定
    const bestAction = validActions[0];
    const isBestAction = userAction === bestAction.action;
    
    if (isCorrect) {
      if (isBestAction) {
        return {
          title: '最適解です！',
          description: `${actionLabels[userAction]}は${Math.round(bestAction.probability)}%の確率で最も推奨されるアクションです。`,
          color: 'text-green-700'
        };
      } else {
        const userProb = correctActions[userAction] || 0;
        return {
          title: '正解です！',
          description: `${actionLabels[userAction]}は${Math.round(userProb)}%の確率で有効なアクションです。最適解は${actionLabels[bestAction.action]}（${Math.round(bestAction.probability)}%）です。`,
          color: 'text-green-700'
        };
      }
    } else {
      const userProb = correctActions[userAction] || 0;
      if (userProb === 0) {
        return {
          title: 'このハンドでは推奨されません',
          description: `${actionLabels[userAction]}はこのシチュエーションでは0%です。最適解は${actionLabels[bestAction.action]}（${Math.round(bestAction.probability)}%）を検討しましょう。`,
          color: 'text-red-700'
        };
      } else {
        return {
          title: '不正解',
          description: `${actionLabels[userAction]}の確率は${Math.round(userProb)}%でしたが、今回は外れました。最適解は${actionLabels[bestAction.action]}（${Math.round(bestAction.probability)}%）です。`,
          color: 'text-red-700'
        };
      }
    }
  };
  
  const explanation = getExplanation();
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onNext}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className={`
              rounded-2xl p-6 md:p-8 max-w-md mx-4 shadow-2xl
              ${isCorrect 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-red-400 to-red-600'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center text-white">
              <motion.div 
                className="text-5xl md:text-6xl mb-4"
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15,
                  delay: 0.1
                }}
              >
                {isCorrect ? '✅' : '❌'}
              </motion.div>
              
              <motion.div 
                className="text-2xl md:text-3xl font-bold mb-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {isCorrect ? '正解！' : '不正解'}
              </motion.div>
              
              {probability !== undefined && (
                <motion.div 
                  className="text-white text-opacity-90 text-sm mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  期待確率: {Math.round(probability * 100)}%
                </motion.div>
              )}
              
              {/* 解説セクション */}
              {explanation && (
                <motion.div
                  className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg text-left"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="font-bold text-base md:text-lg mb-2">
                    💡 {explanation.title}
                  </div>
                  <div className="text-xs md:text-sm text-white text-opacity-90 leading-relaxed">
                    {explanation.description}
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                className="text-white text-opacity-75 text-xs mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                タップまたは1.5秒後に次の問題へ
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
