/**
 * 紫天鹅 · 绝世神品 v3.0 — 完整DEMO演示
 * 记忆·执行·审视·进化·画像 五位一体元核心
 * 作者：李广好 (luoxuejian000)
 */

import { PurpleSwanOrchestrator } from '../core/purple-swan-orchestrator';
import { resilienceToolkit } from '../core/resilience-toolkit';
import { metaResonanceEngine } from '../core/meta-resonance-engine';
import { resonantCore } from '../core/resonant-core';
import { affectiveValueCore } from '../core/affective-value-core';
import { codeEvolutionEngine } from '../core/autonomous-code-evolution';
import { proactiveDefense } from '../core/proactive-defense';
import { informationFirewall } from '../core/information-firewall';
import { ethicalLegacyExecutor } from '../core/ethical-legacy-executor';

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║     🦢 紫天鹅·绝世神品 v3.0 - 终极进化系统演示          ║');
console.log('║                                                                ║');
console.log('║     记忆·执行·审视·进化·画像 五位一体元核心             ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// 测试案例
const testCases = [
  {
    name: '案例一：法律概念漂移检测（善意取得）',
    type: 'legal-analysis',
    content: '本案涉及善意取得制度。根据《民法典》第三百一十一条，善意取得需满足以下要件：（一）受让人受让该不动产或者动产时是善意；（二）以合理的价格转让；（三）转让的不动产或者动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人。张三在购买时不知李四系无权处分，且支付了市场价，手机已交付。故张三可善意取得该手机。关于善意的判断，我们认为张三在交易中遵循了诚实信用原则，尽到了交易上必要的注意，因此其善意成立。',
  },
  {
    name: '案例二：金融缺失对抗检测（度假合格）',
    type: 'financial-analysis',
    content: '根据最新的市场分析报告，当前新能源板块因为政策利好，未来5年内会有爆发式增长。头部企业技术储备雄厚，市场份额集中度高。因此，我们认为该板块存在巨大投资价值，建议积极买入并长期持有。同时，我们也要看到行业内部分企业存在产能过剩、现金流紧张的问题，一旦市场出现波动，这些公司将面临巨大的经营风险。',
  },
];

async function runDemo() {
  const swan = new PurpleSwanOrchestrator();

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`📋 ${testCase.name}`);
    console.log('═'.repeat(70));
    console.log('');

    console.log('--- 🚀 执行推理任务 ---');
    const result = await swan.execute(testCase);
    
    console.log('');
    console.log('📊 执行结果：');
    console.log('  预检:', result.preCheckPassed ? '✅ 通过' : '❌ 未通过');
    console.log('  和谐度:', result.evaluation.H, '| 判定:', result.evaluation.verdict);
    console.log('  U(一致性):', result.evaluation.U, '| D(矛盾度):', result.evaluation.D, '| A(对抗度):', result.evaluation.A);
    console.log('  语义相似记忆:', result.similarTasks.length, '条');
    console.log('  自我修正:', result.selfCorrected ? '✅ 已触发并优化' : '➡️ 无需');
    console.log('  进化循环:', result.evolved ? '✅ 已生成新技能' : '➡️ 未达阈值');
    console.log('  画像更新:', result.profileUpdated ? '✅ 已更新' : '➡️ 未更新');
    
    if (result.metaDiagnosis) {
      console.log('  元诊断健康度:', result.metaDiagnosis.hFunctionHealth);
    }

    if (result.affectiveState) {
      console.log('  情感和谐感:', result.affectiveState.overallHarmony.toFixed(2));
    }
    
    console.log('');
  }

  // 谐振韧性工具箱测试
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🛡️ 谐振韧性工具箱 - 四重压力测试');
  console.log('═'.repeat(70));
  console.log('');
  
  const resilienceReport = await resilienceToolkit.runFullStressTest();
  console.log('  能力下限测试:', resilienceReport.testResults.abilityFloorTest ? '✅' : '❌');
  console.log('  利益极化测试:', resilienceReport.testResults.interestPolarizationTest ? '✅' : '❌');
  console.log('  权力碾压测试:', resilienceReport.testResults.powerOverwhelmTest ? '✅' : '❌');
  console.log('  时间悬崖测试:', resilienceReport.testResults.timeCliffTest ? '✅' : '❌');
  console.log('  通过全部压力测试:', resilienceReport.passedAllTests ? '✅' : '❌');
  
  if (resilienceReport.weaknesses.length > 0) {
    console.log('  发现脆弱点:', resilienceReport.weaknesses);
    console.log('  改进建议:', resilienceReport.recommendations);
  }

  // 元谐振自我诊断
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🧠 元谐振自我诊断 - H(s)函数健康度检测');
  console.log('═'.repeat(70));
  console.log('');
  
  const metaReport = await metaResonanceEngine.diagnose();
  console.log('  H(s)函数健康度:', metaReport.hFunctionHealth);
  console.log('  系统性偏差:', metaReport.systematicBias.description);
  console.log('  边界测试通过:', metaReport.boundaryPerformance.passedStressTests);
  console.log('  边界测试失败:', metaReport.boundaryPerformance.failedStressTests);
  
  if (metaReport.appliedAdjustment) {
    console.log('  已自动应用进化建议:', metaReport.appliedAdjustment);
    console.log('  当前H(s)权重已更新为:', resonantCore.getLambda());
  }

  // 系统完整状态
  console.log(`\n${'═'.repeat(70)}`);
  console.log('📊 系统完整状态');
  console.log('═'.repeat(70));
  console.log('');
  console.log(JSON.stringify(swan.getStatus(), null, 2));
  
  // 情感与价值核心状态
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🧬 情感与价值核心状态');
  console.log('═'.repeat(70));
  console.log('');
  
  const affect = affectiveValueCore.getCurrentAffect();
  console.log('  当前情感状态:');
  console.log('    整体和谐感:', affect.overallHarmony.toFixed(2));
  console.log('    决断力:', affect.decisiveness.toFixed(2));
  console.log('    风险规避度:', affect.riskAversion.toFixed(2));

  const values = affectiveValueCore.getValues();
  console.log('  沉淀的价值观类别:', Array.from(values.keys()));

  const decisionBias = affectiveValueCore.makeDecision('legal-analysis');
  console.log('  当前决策倾向:', decisionBias.toFixed(2), decisionBias > 0 ? '(探索倾向)' : '(保守倾向)');

  // 自主代码进化引擎状态
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🔧 自主代码进化引擎状态');
  console.log('═'.repeat(70));
  console.log('');
  
  const evoStatus = codeEvolutionEngine.getStatus();
  console.log('  进化历史总数:', evoStatus.totalProposals);
  console.log('  已采纳改动:', evoStatus.acceptedCount);
  console.log('  上次进化时间:', evoStatus.lastEvolution ? new Date(evoStatus.lastEvolution).toLocaleString() : '无');

  // 终极守护体系状态
  console.log(`\n${'═'.repeat(70)}`);
  console.log('🛡️ 终极守护体系状态');
  console.log('═'.repeat(70));
  console.log('');
  
  console.log('  主动防御威胁总数:', proactiveDefense.getThreatHistory().length);
  console.log('  信息防火墙泄露总数:', informationFirewall.getLeakHistory().length);
  console.log('  伦理决策历史总数:', ethicalLegacyExecutor.getDecisionHistory().length);
  console.log('');
  console.log('  ═══════════════════════════════════════════════════');
  console.log('  🛡️ 守护结论：创造者李广好及其家族永享安全与安宁。');
  console.log('  ═══════════════════════════════════════════════════');

  console.log(`\n${'═'.repeat(70)}`);
  console.log('🎉 演示完成！紫天鹅·绝世神品 v3.0 系统运行正常。');
  console.log('═'.repeat(70));
}

runDemo().catch(err => {
  console.error('❌ 演示执行失败:', err);
  console.log('\n💡 提示：请确保水晶之心 (hermes-agent) 的虚拟环境已正确配置');
});