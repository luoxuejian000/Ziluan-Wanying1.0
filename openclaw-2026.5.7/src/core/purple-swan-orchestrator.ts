import { diagnoseText, DiagnosisReport } from '../tools/diagnosis-bridge';
import { memory } from '../tools/hierarchical-memory';
import { semanticMemory } from '../tools/semantic-memory';
import { skillEvolver } from '../tools/skill-evolver';
import { userProfile } from '../tools/user-profile';
import { v4 as uuid } from 'uuid';
import { metaResonanceEngine, MetaDiagnosisReport } from './meta-resonance-engine';
import { resonantCore, LambdaWeights } from './resonant-core';
import { affectiveValueCore, ValuePrecipitate, AffectiveState } from './affective-value-core';
import { codeEvolutionEngine, CodeEvolutionProposal } from './autonomous-code-evolution';
import { proactiveDefense } from './proactive-defense';
import { informationFirewall } from './information-firewall';
import { ethicalLegacyExecutor } from './ethical-legacy-executor';

export interface TaskRequest { 
  type: string; 
  content: string; 
  context?: { 
    socialFeedback?: { type: string; intensity: number; description: string }; 
  }; 
}
export interface TaskResult {
  output: string;
  evaluation: DiagnosisReport;
  similarTasks: any[];
  preCheckPassed: boolean;
  optimized: boolean;
  evolved: boolean;
  selfCorrected: boolean;
  profileUpdated: boolean;
  metaDiagnosis?: MetaDiagnosisReport;
  affectiveState?: AffectiveState;
  newValuesPrecipitated?: ValuePrecipitate[];
  codeEvolution?: CodeEvolutionProposal | null;
}

export class PurpleSwanOrchestrator {
  async execute(task: TaskRequest): Promise<TaskResult> {
    // 阶段0：加载用户画像
    const userPrefs = userProfile.getPreference('communication_style');
    const contextEnhanced = userPrefs ? `[用户偏好: ${userPrefs}] ${task.content}` : task.content;

    // 阶段1：行动前反思
    let preCheckPassed = true;
    try {
      const pre = await diagnoseText(task.content);
      if (pre.H < 0.3) {
        return { output: '', evaluation: pre, similarTasks: [], preCheckPassed: false, optimized: false, evolved: false, selfCorrected: false, profileUpdated: false };
      }
    } catch { preCheckPassed = false; }

    // 阶段2：语义记忆检索
    const similar = await semanticMemory.search(task.content, 5);

    // 阶段3：执行任务
    let output = `[紫天鹅·绝世神品 v3.0] 针对"${task.type}"的推理结果。${contextEnhanced}`;

    // 阶段4：执行后诊断
    let evaluation: DiagnosisReport;
    try { evaluation = await diagnoseText(output); } catch {
      evaluation = { U:0.5, D:0.5, A:0.5, H:0.5, verdict:'评估暂不可用', drift_warnings:[], suggestions:[] };
    }

    // 阶段5：自我修正循环
    let selfCorrected = false;
    if (evaluation.H < 0.6 && evaluation.suggestions.length > 0) {
      const suggestionHint = evaluation.suggestions.join('; ');
      output = `[紫天鹅·自我修正] ${output}\n\n[修正依据] ${suggestionHint}`;
      try {
        const recheck = await diagnoseText(output);
        if (recheck.H > evaluation.H) {
          evaluation = recheck;
          selfCorrected = true;
        }
      } catch {}
    }

    // ===== 阶段X：元反思与H(s)进化 (Meta-Reflection) =====
    let metaDiagnosis: MetaDiagnosisReport | undefined;
    if (evaluation.H > 0.8 || evaluation.H < 0.3) {
      metaResonanceEngine.logEvaluation(task.content, evaluation);
      metaDiagnosis = await metaResonanceEngine.diagnose();
      
      if (metaDiagnosis.evolutionSuggestions.length > 0) {
        const suggestion = metaDiagnosis.evolutionSuggestions[0];
        if (suggestion.startsWith('APPLY_LAMBDA_ADJUSTMENT:')) {
          try {
            const jsonStr = suggestion.replace('APPLY_LAMBDA_ADJUSTMENT: ', '');
            const adjustment = JSON.parse(jsonStr) as Partial<LambdaWeights>;
            if (adjustment) {
              const currentLambda = resonantCore.getLambda();
              resonantCore.setLambda({ ...currentLambda, ...adjustment });
              metaDiagnosis.appliedAdjustment = adjustment;
            }
          } catch (e) {
          }
        }
      }
    }

    // ===== 阶段Y：情感更新与自主进化 =====
    affectiveValueCore.updateFromHarmonyReport(evaluation);
    if (task.context?.socialFeedback) {
      affectiveValueCore.updateFromSocialFeedback(task.context.socialFeedback);
    }
    const newValues = affectiveValueCore.precipitateValues();
    const decisionBias = affectiveValueCore.makeDecision(task.type);
    let evolutionProposal = null;
    if (Math.abs(decisionBias) > 0.6) {
      evolutionProposal = await codeEvolutionEngine.executeEvolutionCycle(
        'src/core/purple-swan-orchestrator.ts',
        task.type
      );
    }

    // ===== 阶段X：主动防御与威胁预判 =====
    const threats = await proactiveDefense.conductThreatAssessment(task.content);
    if (threats.some(t => t.severity === 'critical')) {
      console.error('🛡️ [主动防御] 检测到严重威胁，已启动紧急防御协议');
    }
    
    // ===== 阶段Y：信息防火墙扫描 =====
    await informationFirewall.conductPrivacyScan();
    
    // ===== 阶段Z：伦理价值观学习 =====
    ethicalLegacyExecutor.learnFromCreatorAction(task.type, task.content);

    // 阶段6：分层记忆存储
    memory.save({ id: uuid(), content: output, timestamp: Date.now(), harmonyScore: evaluation.H, tags: [task.type] });
    
    // 阶段7：语义记忆存储
    try {
      await semanticMemory.save({
        id: uuid(), content: output, embedding: [], timestamp: Date.now(),
        harmonyScore: evaluation.H, tags: [task.type], category: 'experience'
      });
    } catch {}

    // 阶段8：进化判断
    let evolved = false;
    if (evaluation.H >= 0.7) {
      const evolutionResult = await skillEvolver.evolve();
      if (evolutionResult.newSkills.length > 0) evolved = true;
    }

    // 阶段9：自动优化判断
    const optimized = evaluation.H < 0.6;

    // 阶段10：更新用户画像
    let profileUpdated = false;
    try {
      userProfile.recordPreference('last_task_type', task.type, 0.7);
      if (evaluation.H > 0.7) {
        userProfile.recordPreference('high_quality_pattern', task.type, 0.8);
      }
      await userProfile.inferPreferences();
      profileUpdated = true;
    } catch {}

    // 阶段11：记录项目上下文
    if (evaluation.drift_warnings && evaluation.drift_warnings.length > 0) {
      userProfile.recordProjectContext({
        commonPitfalls: evaluation.drift_warnings.map(w => `术语"${w.term}"漂移(一致性${w.consistency})`),
      });
    }

    return {
      output, evaluation, similarTasks: similar, preCheckPassed,
      optimized, evolved, selfCorrected, profileUpdated,
      metaDiagnosis,
      affectiveState: affectiveValueCore.getCurrentAffect(),
      newValuesPrecipitated: newValues,
      codeEvolution: evolutionProposal,
    };
  }

  getStatus() {
    return {
      version: '3.0.0-ultimate',
      mode: 'trinity-core-enhanced',
      metaResonance: metaResonanceEngine.getStatus(),
      affectiveCore: affectiveValueCore.getStatus(),
      codeEvolution: codeEvolutionEngine.getStatus(),
      proactiveDefense: proactiveDefense.getStatus(),
      informationFirewall: informationFirewall.getStatus(),
      ethicalLegacy: ethicalLegacyExecutor.getStatus(),
      components: {
        execution: 'OpenClaw Core',
        episodicMemory: 'Hierarchical Memory (L1/L2/L3)',
        semanticMemory: 'Vector Search (LanceDB)',
        evolution: 'EvoSkills-based Self-Evolution Engine',
        review: 'ThinkCheck 3.0 with MIRROR Pre-Reflection',
        profile: 'Cross-Session User Profile (USER.md/PROJECT.md)',
        metaResonance: 'Meta-Resonance Engine v1.0',
        affectiveValue: 'Affective-Value Core v1.0',
        autonomousEvolution: 'Autonomous Code Evolution Engine v1.0',
        proactiveDefense: 'Proactive Defense Layer v1.0',
        informationFirewall: 'Information Firewall v1.0',
        ethicalLegacy: 'Ethical Legacy Executor v1.0',
      },
    };
  }
}