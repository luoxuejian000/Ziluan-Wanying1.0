/**
 * 相位检测器 (Phase Detector)
 * 
 * 检测系统当前处于进化周期的哪个阶段
 */

export type EvolutionPhase = 'initialization' | 'exploration' | 'consolidation' | 'optimization' | 'stagnation';

export interface PhaseInfo {
  phase: EvolutionPhase;
  characteristics: string[];
  suggestedActions: string[];
  confidence: number;
}

export class PhaseDetector {
  private history: { timestamp: number; harmony: number }[] = [];

  detectPhase(harmonyHistory: number[]): PhaseInfo {
    const recentH = harmonyHistory.slice(-10);
    const avgH = recentH.reduce((a, b) => a + b, 0) / recentH.length;
    const variance = recentH.reduce((sum, h) => sum + Math.pow(h - avgH, 2), 0) / recentH.length;

    let phase: EvolutionPhase;
    let characteristics: string[];
    let suggestedActions: string[];
    let confidence: number;

    if (harmonyHistory.length < 5) {
      phase = 'initialization';
      characteristics = ['数据积累阶段', '系统正在学习', '模式尚未稳定'];
      suggestedActions = ['继续收集数据', '建立基线度量', '初始化记忆系统'];
      confidence = 0.8;
    } else if (variance > 0.05 && avgH < 0.6) {
      phase = 'exploration';
      characteristics = ['高探索性', '频繁尝试新方案', '波动较大'];
      suggestedActions = ['尝试不同策略', '记录失败案例', '积累经验'];
      confidence = 0.7;
    } else if (variance < 0.02 && avgH > 0.7) {
      phase = 'consolidation';
      characteristics = ['稳定期', '高一致性', '最佳实践形成'];
      suggestedActions = ['固化成功模式', '建立标准操作流程', '优化效率'];
      confidence = 0.85;
    } else if (variance < 0.01 && avgH > 0.6) {
      phase = 'optimization';
      characteristics = ['优化阶段', '微调参数', '精细调整'];
      suggestedActions = ['优化权重参数', '微调阈值', '提升效率'];
      confidence = 0.8;
    } else {
      phase = 'stagnation';
      characteristics = ['停滞期', '缺乏进步', '需要新刺激'];
      suggestedActions = ['引入新数据', '尝试激进变革', '重启探索'];
      confidence = 0.75;
    }

    return { phase, characteristics, suggestedActions, confidence };
  }

  getStatus() {
    return { historyLength: this.history.length };
  }
}

export const phaseDetector = new PhaseDetector();