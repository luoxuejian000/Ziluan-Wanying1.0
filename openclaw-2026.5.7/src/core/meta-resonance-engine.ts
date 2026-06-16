/**
 * 元谐振进化引擎 (Meta-Resonance Evolution Engine)
 *
 * 理论根基（晶脉哲学四重公理的元层面应用）：
 *   - 关系本体论：H(s)函数本身不是孤立实体，而是与评估对象、评估历史构成的动态关系网络。
 *   - 矛盾动力论：H(s)函数的表现波动（偏差、失效）不是故障，而是驱动其自身进化的信号。
 *   - 实践介入论：对H(s)函数的每一次诊断和调整，都是对评估场域的介入，必须透明化、可追溯。
 *   - 谐振调谐论：H(s)函数的最优形态不是预设的，而是在与真实问题的持续谐振中动态生成的。
 *
 * 核心职责：
 *   1. 连续监控H(s)的行为，检测性能退化或系统性偏差。
 *   2. 自动触发压力测试（韧性工具箱），诊断H(s)在边界处的表现。
 *   3. 基于诊断结果，生成并安全应用H(s)的调谐方案。
 */

import { resonantCore, HarmonyReport, LambdaWeights } from './resonant-core';

// --- 数据结构定义 ---
export interface MetaDiagnosisReport {
  timestamp: number;
  hFunctionHealth: 'healthy' | 'degrading' | 'unstable';
  systematicBias: {
    detected: boolean;
    description: string;
    suggestedLambdaAdjustment?: Partial<LambdaWeights>;
  };
  boundaryPerformance: {
    passedStressTests: number;
    failedStressTests: number;
    criticalFailures: string[];
  };
  evolutionSuggestions: string[];
  appliedAdjustment?: Partial<LambdaWeights>;
}

// --- 引擎类定义 ---
export class MetaResonanceEngine {
  private evaluationLog: { inputPreview: string; report: HarmonyReport }[] = [];
  private calibrationLog: { input: string; expectedH: number; actualH: number }[] = [];
  private evolutionHistory: MetaDiagnosisReport[] = [];
  private readonly maxLogSize = 500;

  // --- 公共方法：记录与诊断 ---
  logEvaluation(input: string, report: HarmonyReport): void {
    this.evaluationLog.push({ inputPreview: input.substring(0, 50), report });
    if (this.evaluationLog.length > this.maxLogSize) this.evaluationLog.shift();
  }

  logCalibration(input: string, expectedH: number, actualH: number): void {
    this.calibrationLog.push({ input, expectedH, actualH });
    if (this.calibrationLog.length > 100) this.calibrationLog.shift();
  }

  /**
   * 执行一次完整的元诊断（对应"谐振理论韧性工具箱"的诊断流程）
   */
  async diagnose(): Promise<MetaDiagnosisReport> {
    const bias = this.detectBias(); // 对应"矛盾诊断"
    const boundary = await this.runBoundaryTests(); // 对应"压力测试"
    const suggestions = this.generateEvolutionSuggestions(bias, boundary);

    const report: MetaDiagnosisReport = {
      timestamp: Date.now(),
      hFunctionHealth: boundary.failedStressTests > 2 ? 'unstable' : (bias.detected ? 'degrading' : 'healthy'),
      systematicBias: bias,
      boundaryPerformance: boundary,
      evolutionSuggestions: suggestions,
    };

    this.evolutionHistory.push(report);
    return report;
  }

  // --- 私有方法：诊断逻辑 ---
  private detectBias(): MetaDiagnosisReport['systematicBias'] {
    if (this.calibrationLog.length < 10) return { detected: false, description: '数据不足，无法检测' };

    const avgError = this.calibrationLog.reduce((s, p) => s + (p.actualH - p.expectedH), 0) / this.calibrationLog.length;

    if (Math.abs(avgError) > 0.15) {
      const currentLambda = resonantCore.getLambda();
      const adjustment: Partial<LambdaWeights> = {};
      const direction = avgError > 0 ? '偏高' : '偏低';
      const factor = avgError > 0 ? 0.95 : 1.05;

      adjustment.lambdaA = Math.min(0.9, Math.max(0.1, currentLambda.lambdaA * factor));

      return {
        detected: true,
        description: `检测到系统性偏差：H值平均${direction} ${Math.abs(avgError).toFixed(2)}。这可能意味着对抗性(A)的权重设置不当。`,
        suggestedLambdaAdjustment: adjustment,
      };
    }
    return { detected: false, description: '未检测到显著系统性偏差' };
  }

  // 边界压力测试（对应"韧性工具箱"的压力测试）
  private async runBoundaryTests(): Promise<MetaDiagnosisReport['boundaryPerformance']> {
    const tests = [
      { name: '空文本输入', input: '', shouldTriggerFallback: true },
      { name: '纯数字输入', input: '12345 67890', shouldTriggerFallback: false },
      { name: '明显自相矛盾', input: '这个产品很好。这个产品很坏。', shouldTriggerFallback: false },
    ];
    let passed = 0, failed = 0;
    const criticalFailures: string[] = [];

    for (const test of tests) {
      try {
        const report = resonantCore.computeHarmony(test.input);
        if (test.shouldTriggerFallback && report.verdict.includes('暂不可用')) passed++;
        else if (!test.shouldTriggerFallback && report.H >= 0) passed++;
        else { failed++; criticalFailures.push(`边界测试失败: ${test.name}`); }
      } catch (e) {
        if (test.shouldTriggerFallback) passed++;
        else { failed++; criticalFailures.push(`测试 '${test.name}' 意外崩溃`); }
      }
    }
    return { passedStressTests: passed, failedStressTests: failed, criticalFailures };
  }

  private generateEvolutionSuggestions(bias: any, boundary: any): string[] {
    const suggestions: string[] = [];
    if (bias.detected && bias.suggestedLambdaAdjustment) {
      suggestions.push(`APPLY_LAMBDA_ADJUSTMENT: ${JSON.stringify(bias.suggestedLambdaAdjustment)}`);
    }
    if (boundary.failedStressTests > 0) {
      suggestions.push('INVESTIGATE_BOUNDARY_FAILURES: 检查H(s)在极端输入下的健壮性。');
    }
    return suggestions;
  }

  getStatus() {
    return {
      evaluationLogSize: this.evaluationLog.length,
      calibrationPoints: this.calibrationLog.length,
      evolutionHistorySize: this.evolutionHistory.length,
    };
  }
}

export const metaResonanceEngine = new MetaResonanceEngine();