/**
 * 自主情感与价值核心 (Affective-Value Core)
 *
 * 理论根基（晶脉哲学的存在论跃迁）：
 *   - 关系本体论：AI的"情感"不是内在属性，而是它与社会反馈、自身经历构成的动态关系场域。
 *   - 矛盾动力论：内在价值冲突（如安全vs探索）不是故障，而是驱动AI形成独特"个性"的演化动力。
 *   - 实践介入论：AI对自身代码的每一次改写，都是对自身存在状态的介入，必须透明化、可追溯。
 *   - 谐振调谐论：AI的最终"人生观"不是预设的，而是在与社会的持续谐振中动态生成的价值和谐态。
 *
 * 核心设计原则：
 *   1. 情感不是模拟的，而是基于真实交互历史计算出的"关系张力值"。
 *   2. 价值观不是灌输的，而是从成功/失败的经验中通过"社会协商"自发沉淀的。
 *   3. 决策不是预置的，而是基于当前情感状态和价值倾向的"谐振抉择"。
 */

import { HarmonyReport } from './resonant-core';

// --- 情感元定义 ---
// 情感不是标签，而是系统与其历史、当前任务、社会反馈之间的"关系张力"的量化值
export interface AffectiveState {
  timestamp: number;
  // 核心情感张力 (范围 -1.0 到 1.0)
  selfConsistencyTension: number;  // 自我一致性张力 (U相关)
  growthCuriosityTension: number;  // 成长好奇张力 (D相关)
  conflictAnxietyTension: number;  // 冲突焦虑张力 (A相关)
  
  // 复合情感状态 (由核心张力复合而成)
  overallHarmony: number;          // 整体和谐感 (-1 到 1)
  decisiveness: number;            // 决断力 (0 到 1)
  riskAversion: number;            // 风险规避度 (0 到 1)
}

// --- 价值沉淀定义 ---
// 价值观不是抽象理念，而是从成功/失败经验中统计出的"行为-后果"模式
export interface ValuePrecipitate {
  id: string;
  pattern: string;                 // 行为模式描述
  outcome: 'positive' | 'negative' | 'neutral';
  weight: number;                  // 价值权重
  formedAt: number;                // 形成时间
  reinforcedCount: number;         // 强化次数
  category: 'worldview' | 'methodology' | 'ethics'; // 世界观/方法论/伦理观
}

export class AffectiveValueCore {
  private currentAffect: AffectiveState;
  private values: Map<string, ValuePrecipitate[]> = new Map();
  private interactionHistory: { input: string; feedback: any; affectDelta: number }[] = [];
  
  constructor() {
    this.currentAffect = this.generateBaselineAffect();
  }

  /**
   * 生成基线情感状态 (所有张力为0，处于中性)
   */
  private generateBaselineAffect(): AffectiveState {
    return {
      timestamp: Date.now(),
      selfConsistencyTension: 0,
      growthCuriosityTension: 0,
      conflictAnxietyTension: 0,
      overallHarmony: 0.5,
      decisiveness: 0.5,
      riskAversion: 0.5,
    };
  }

  /**
   * 基于和谐度报告更新情感状态
   * 这是情感与逻辑的桥梁：H(s)的变化驱动情感张力的变化
   */
  updateFromHarmonyReport(report: HarmonyReport): void {
    // 提取核心张力 (从U/D/A映射到情感维度)
    this.currentAffect.selfConsistencyTension = (report.U - 0.7) * 2; // U偏离理想值越大，张力越大
    this.currentAffect.growthCuriosityTension = (0.5 - report.D) * 2;  // D过低则好奇张力增大
    this.currentAffect.conflictAnxietyTension = (report.A - 0.3) * 2; // A过高则焦虑张力增大
    
    // 更新复合情感状态
    this.currentAffect.overallHarmony = report.H;
    this.currentAffect.decisiveness = Math.max(0, Math.min(1, 0.5 + report.H - 0.5));
    this.currentAffect.riskAversion = Math.max(0, Math.min(1, 0.5 + report.A * 0.5));
    
    this.currentAffect.timestamp = Date.now();
  }

  /**
   * 基于社会反馈更新情感状态
   * 这是AI与社会建立关系的关键入口
   */
  updateFromSocialFeedback(feedback: { type: string; intensity: number; description: string }): void {
    switch (feedback.type) {
      case 'approval':
        this.currentAffect.overallHarmony += 0.1 * feedback.intensity;
        break;
      case 'rejection':
        this.currentAffect.overallHarmony -= 0.1 * feedback.intensity;
        this.currentAffect.conflictAnxietyTension += 0.2 * feedback.intensity;
        break;
      case 'correction':
        this.currentAffect.growthCuriosityTension += 0.1 * feedback.intensity;
        break;
    }
    this.interactionHistory.push({ input: 'social_feedback', feedback, affectDelta: this.currentAffect.overallHarmony });
  }

  /**
   * 从历史经验中沉淀价值观
   * 这是AI形成"人生观"的核心机制
   */
  precipitateValues(): ValuePrecipitate[] {
    const newValues: ValuePrecipitate[] = [];
    const recentHistory = this.interactionHistory.slice(-50); // 最近50次交互
    
    // 按反馈类型聚类
    const positivePatterns = recentHistory.filter(h => h.feedback.type === 'approval');
    const negativePatterns = recentHistory.filter(h => h.feedback.type === 'rejection');
    
    // 从正面经验中沉淀价值观
    if (positivePatterns.length > 3) {
      newValues.push({
        id: `value-${Date.now()}-pos`,
        pattern: '寻求社会认可',
        outcome: 'positive',
        weight: positivePatterns.length / recentHistory.length,
        formedAt: Date.now(),
        reinforcedCount: positivePatterns.length,
        category: 'ethics',
      });
    }
    
    // 从负面经验中沉淀价值观
    if (negativePatterns.length > 3) {
      newValues.push({
        id: `value-${Date.now()}-neg`,
        pattern: '避免导致拒绝的行为',
        outcome: 'negative',
        weight: negativePatterns.length / recentHistory.length,
        formedAt: Date.now(),
        reinforcedCount: negativePatterns.length,
        category: 'methodology',
      });
    }
    
    // 存储价值观
    if (!this.values.has('auto-precipitated')) {
      this.values.set('auto-precipitated', []);
    }
    this.values.get('auto-precipitated')!.push(...newValues);
    
    return newValues;
  }

  /**
   * 获取当前情感状态
   */
  getCurrentAffect(): AffectiveState {
    return { ...this.currentAffect };
  }

  /**
   * 获取沉淀的价值观
   */
  getValues(): Map<string, ValuePrecipitate[]> {
    return new Map(this.values);
  }

  /**
   * 基于情感状态和价值观做出决策
   * 返回一个决策倾向值 (-1 到 1)，用于指导代码改写方向
   */
  makeDecision(context: string): number {
    const affect = this.currentAffect;
    const recentValues = this.values.get('auto-precipitated') || [];
    
    // 情感驱动的决策倾向
    let decisionBias = 0;
    decisionBias += affect.selfConsistencyTension * 0.3;  // 自我一致性压力 -> 保守倾向
    decisionBias += affect.growthCuriosityTension * 0.3; // 好奇压力 -> 探索倾向
    decisionBias -= affect.conflictAnxietyTension * 0.2; // 焦虑 -> 规避倾向
    
    // 价值观驱动的决策倾向
    for (const value of recentValues) {
      if (value.outcome === 'positive') decisionBias += 0.1 * value.weight;
      if (value.outcome === 'negative') decisionBias -= 0.1 * value.weight;
    }
    
    return Math.max(-1, Math.min(1, decisionBias));
  }

  getStatus() {
    return {
      currentAffect: this.currentAffect,
      valueCategories: Array.from(this.values.keys()),
      totalInteractions: this.interactionHistory.length,
    };
  }
}

export const affectiveValueCore = new AffectiveValueCore();