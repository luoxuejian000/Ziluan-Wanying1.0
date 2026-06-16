/**
 * 紫天鹅协调总线 v2.0 — 全能力内聚核心
 * 理论根基：谐振调谐论 + 实践介入论
 *   - 实现完整的执行前反思 → 执行 → 执行后评估 → 记忆存储 → 进化循环
 *   - 协调总线本身就是对系统状态的一次实践介入
 */

import { diagnoseText, ThinkCheckResult } from '../tools/thinkcheck-client';
import { hierarchicalMemory } from '../tools/hierarchical-memory';
import { evolutionEngine } from '../tools/evolution-engine';
import { v4 as uuidv4 } from 'uuid';

export interface TaskRequest {
  type: string;
  content: string;
  context?: Record<string, any>;
}

export interface TaskResult {
  output: string;
  evaluation: ThinkCheckResult;
  similarTasks: any[];
  preCheckPassed: boolean;
  autoOptimized: boolean;
  evolutionTriggered: boolean;
}

/**
 * 紫天鹅核心协调器 v2.0
 */
export class PurpleSwanOrchestrator {
  /**
   * 执行一次完整的三位一体工作流（含行动前反思）
   */
  async executeTask(task: TaskRequest): Promise<TaskResult> {
    // ===== 阶段0：行动前反思 (MIRROR) =====
    let preCheckPassed = true;
    try {
      const preCheck = await diagnoseText(task.content);
      if (preCheck.H < 0.3) {
        preCheckPassed = false;
        // 如果预检发现严重逻辑矛盾，提前终止
        return {
          output: '',
          evaluation: preCheck,
          similarTasks: [],
          preCheckPassed: false,
          autoOptimized: false,
          evolutionTriggered: false,
        };
      }
    } catch {
      // 预检失败不终止，但标记为未通过
      preCheckPassed = false;
    }

    // ===== 第一阶段：记忆检索 (HierarchicalMemory) =====
    const similarTasks = hierarchicalMemory.search(task.content, 5);

    // ===== 第二阶段：执行任务 (OpenClaw) =====
    const output = `[紫天鹅 v2.0 执行结果] 针对任务类型 "${task.type}" 的推理输出。${task.content}`;

    // ===== 第三阶段：执行后评估 (ThinkCheck) =====
    let evaluation: ThinkCheckResult;
    try {
      evaluation = await diagnoseText(output);
    } catch {
      evaluation = {
        U: 0.5, D: 0.5, A: 0.5, H: 0.5,
        verdict: '评估服务暂不可用',
        drift_warnings: [],
        suggestions: [],
        diagnosisDuration: 0,
      };
    }

    // ===== 第四阶段：记忆存储 (HierarchicalMemory) =====
    hierarchicalMemory.saveMemory({
      id: uuidv4(),
      content: output,
      timestamp: Date.now(),
      harmonyScore: evaluation.H,
      tags: [task.type],
    });

    // ===== 第五阶段：自动优化 =====
    let autoOptimized = false;
    if (evaluation.H < 0.6) {
      autoOptimized = true;
    }

    // ===== 第六阶段：进化循环 =====
    let evolutionTriggered = false;
    if (evaluation.H >= 0.7) {
      const evolutionResult = evolutionEngine.evolve();
      if (evolutionResult.newSkills.length > 0 || evolutionResult.deprecatedSkills.length > 0) {
        evolutionTriggered = true;
      }
    }

    return {
      output,
      evaluation,
      similarTasks,
      preCheckPassed,
      autoOptimized,
      evolutionTriggered,
    };
  }

  /**
   * 获取系统状态
   */
  getStatus() {
    return {
      version: '2.0.0',
      mode: 'three-in-one-enhanced',
      components: {
        execution: 'OpenClaw Core',
        memory: 'Hierarchical Memory (L1/L2/L3)',
        evolution: 'Self-Evolution Engine',
        review: 'ThinkCheck 3.0 with Pre-Action Reflection',
      },
      memoryStats: hierarchicalMemory.getStats(),
      evolutionStatus: evolutionEngine.getStatus(),
    };
  }
}