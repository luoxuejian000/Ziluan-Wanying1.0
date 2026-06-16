/**
 * 谐振决策引擎 (Resonant Decision Engine)
 * 
 * 基于U/D/A三维评估体系做出最终决策
 */

import { resonantCore, HarmonyReport, LambdaWeights } from './resonant-core';

export interface DecisionOutput {
  action: 'execute' | 'reject' | 'review';
  confidence: number;
  reasoning: string;
  harmonyReport: HarmonyReport;
}

export class ResonantDecisionEngine {
  private thresholds = {
    execute: 0.7,
    reject: 0.3,
  };

  async makeDecision(input: string): Promise<DecisionOutput> {
    const report = await resonantCore.computeHarmony(input);
    
    let action: DecisionOutput['action'];
    let reasoning: string;

    if (report.H >= this.thresholds.execute) {
      action = 'execute';
      reasoning = `和谐度(${report.H.toFixed(2)})达到执行阈值，决策可执行。`;
    } else if (report.H <= this.thresholds.reject) {
      action = 'reject';
      reasoning = `和谐度(${report.H.toFixed(2)})低于拒绝阈值，决策被拒绝。`;
    } else {
      action = 'review';
      reasoning = `和谐度(${report.H.toFixed(2)})处于灰色区域，需要人工复核。`;
    }

    return {
      action,
      confidence: report.H,
      reasoning,
      harmonyReport: report,
    };
  }

  getStatus() {
    return { thresholds: this.thresholds };
  }
}

export const resonantDecision = new ResonantDecisionEngine();