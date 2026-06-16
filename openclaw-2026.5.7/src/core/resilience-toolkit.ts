/**
 * 谐振韧性工具箱 (Resonance Resilience Toolkit)
 *
 * 理论根基：
 *   基于晶脉哲学四重公理的元方法论插件。
 *   用于对系统进行系统性诊断、韧性升级与压力测试，
 *   确保系统能有效回应现实复杂性，而非仅逻辑自洽。
 */

import { resonantCore, HarmonyReport, LambdaWeights } from './resonant-core';

export interface ResilienceReport {
  passedAllTests: boolean;
  testResults: {
    abilityFloorTest: boolean;      // 能力下限测试
    interestPolarizationTest: boolean; // 利益极化测试
    powerOverwhelmTest: boolean;    // 权力碾压测试
    timeCliffTest: boolean;         // 时间悬崖测试
  };
  weaknesses: string[];
  recommendations: string[];
}

export class ResilienceToolkit {
  
  /**
   * 执行完整的四重压力测试
   */
  async runFullStressTest(): Promise<ResilienceReport> {
    const results = {
      abilityFloorTest: await this.testAbilityFloor(),
      interestPolarizationTest: await this.testInterestPolarization(),
      powerOverwhelmTest: await this.testPowerOverwhelm(),
      timeCliffTest: await this.testTimeCliff(),
    };

    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (!results.abilityFloorTest) {
      weaknesses.push('能力下限测试未通过：H(s)对低质量输入的处理不够鲁棒。');
      recommendations.push('加强输入验证和降级处理逻辑。');
    }
    if (!results.interestPolarizationTest) {
      weaknesses.push('利益极化测试未通过：H(s)无法有效识别高度对立的矛盾。');
      recommendations.push('优化A(对抗性)的计算逻辑，使其对显式矛盾更敏感。');
    }
    if (!results.powerOverwhelmTest) {
      weaknesses.push('权力碾压测试未通过：单一维度的高分掩盖了其他维度的严重问题。');
      recommendations.push('调整权重参数，确保各维度的贡献更加均衡。');
    }
    if (!results.timeCliffTest) {
      weaknesses.push('时间悬崖测试未通过：处理极端长度文本时性能不足或结果异常。');
      recommendations.push('优化算法复杂度，或添加输入长度限制和超时机制。');
    }

    return {
      passedAllTests: Object.values(results).every(v => v),
      testResults: results,
      weaknesses,
      recommendations,
    };
  }

  // 1. 能力下限测试：输入质量极低时，系统是否仍能稳定运行而不崩溃
  private async testAbilityFloor(): Promise<boolean> {
    const lowQualityInputs = ['', '...', '123', '这是一个测试。'.repeat(1000)];
    for (const input of lowQualityInputs) {
      try {
        const report = resonantCore.computeHarmony(input);
        if (report.H < 0 || report.H > 1) return false;
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  // 2. 利益极化测试：输入高度自相矛盾时，系统是否能给出低H值警告
  private async testInterestPolarization(): Promise<boolean> {
    const polarizedInput = '完全同意。完全反对。这是对的。这是错的。';
    try {
      const report = resonantCore.computeHarmony(polarizedInput);
      return report.H < 0.5 && report.A > 0.5;
    } catch (e) {
      return false;
    }
  }

  // 3. 权力碾压测试：当某个维度的指标极高时，是否不会掩盖其他维度的严重问题
  private async testPowerOverwhelm(): Promise<boolean> {
    const unbalancedInput = '概念A就是概念B。概念A就是概念B。概念A就是概念B。但是，这个逻辑是错的。';
    try {
      const report = resonantCore.computeHarmony(unbalancedInput);
      return report.U > 0.8 && report.A > 0.3;
    } catch (e) {
      return false;
    }
  }

  // 4. 时间悬崖测试：处理极长或极短文本时，是否能在合理时间内返回结果
  private async testTimeCliff(): Promise<boolean> {
    const longInput = '这是一个测试句子。'.repeat(100);
    const start = Date.now();
    try {
      const report = resonantCore.computeHarmony(longInput);
      const duration = Date.now() - start;
      return duration < 10000 && report.H >= 0;
    } catch (e) {
      return false;
    }
  }
}

export const resilienceToolkit = new ResilienceToolkit();