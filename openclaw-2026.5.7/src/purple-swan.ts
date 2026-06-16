/**
 * 紫天鹅 · 绝世神品 — 记忆、执行与审视的三位一体元核心
 * 基于晶脉哲学与谐振理论 | 作者：李广好 (luoxuejian000)
 */

import { PurpleSwanOrchestrator } from './core/purple-swan-orchestrator';

const swan = new PurpleSwanOrchestrator();

const testTask = {
  type: 'legal-analysis',
  content: '本案涉及善意取得制度。根据《民法典》第三百一十一条，善意取得需满足以下要件：（一）受让人受让该不动产或者动产时是善意；（二）以合理的价格转让；（三）转让的不动产或者动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人。张三在购买时不知李四系无权处分，且支付了市场价，手机已交付。故张三可善意取得该手机。关于善意的判断，我们认为张三在交易中遵循了诚实信用原则，尽到了交易上必要的注意，因此其善意成立。',
};

swan.execute(testTask).then(r => {
  console.log('🦢 紫天鹅·绝世神品 执行结果');
  console.log('预检:', r.preCheckPassed ? '通过' : '未通过');
  console.log('和谐度:', r.evaluation.H, '| 判定:', r.evaluation.verdict);
  console.log('U:', r.evaluation.U, 'D:', r.evaluation.D, 'A:', r.evaluation.A);
  console.log('相似记忆:', r.similarTasks.length, '条');
  console.log('自动优化:', r.optimized ? '已触发' : '无需');
  console.log('进化循环:', r.evolved ? '已触发' : '未达阈值');
  console.log('系统状态:', JSON.stringify(swan.getStatus(), null, 2));
}).catch(err => console.error('执行失败:', err));
