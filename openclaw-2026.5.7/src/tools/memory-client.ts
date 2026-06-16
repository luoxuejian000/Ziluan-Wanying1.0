/**
 * 记忆与进化客户端 — Hermes 能力的内嵌调用接口
 * 理论根基：矛盾动力论 & 实践介入论
 *   - 每一次成功的诊断与修正过程，都应被记录并最终固化为内部技能
 *   - 评估结果（U/D/A/H）作为进化信号，驱动技能提炼和策略优化
 */

import fs from 'fs';
import path from 'path';

// 记忆存储路径
const MEMORY_DIR = path.join(process.cwd(), 'data', 'memory');
const MEMORY_FILE = path.join(MEMORY_DIR, 'execution-history.json');
const SKILLS_DIR = path.join(process.cwd(), 'data', 'skills');

// 确保目录存在
if (!fs.existsSync(MEMORY_DIR)) fs.mkdirSync(MEMORY_DIR, { recursive: true });
if (!fs.existsSync(SKILLS_DIR)) fs.mkdirSync(SKILLS_DIR, { recursive: true });

export interface ExecutionRecord {
  id: string;
  timestamp: number;
  task: string;
  result: string;
  evaluation: {
    U: number;
    D: number;
    A: number;
    H: number;
    verdict: string;
  };
  success: boolean;
}

export interface LearnedSkill {
  name: string;
  description: string;
  pattern: string;
  successRate: number;
  createdAt: number;
}

/**
 * 保存执行记录
 */
export function saveExecutionRecord(record: ExecutionRecord): void {
  const records = loadAllRecords();
  records.push(record);
  // 只保留最近 1000 条记录
  if (records.length > 1000) records.shift();
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(records, null, 2));
}

/**
 * 加载所有历史执行记录
 */
export function loadAllRecords(): ExecutionRecord[] {
  if (!fs.existsSync(MEMORY_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * 根据当前任务，从历史记录中检索相似的成功案例
 * （简化版：基于关键词匹配）
 */
export function retrieveSimilarTasks(task: string, limit: number = 5): ExecutionRecord[] {
  const records = loadAllRecords();
  const keywords = task.split(/\s+/).filter(w => w.length > 1);
  const scored = records.map(r => {
    let score = 0;
    for (const kw of keywords) {
      if (r.task.includes(kw)) score += 1;
    }
    return { record: r, score };
  });
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.record);
}

/**
 * 从历史执行记录中提取高成功率模式，固化为可复用技能
 * （简化版：提取频繁出现的高成功任务类型）
 */
export function extractSkills(): LearnedSkill[] {
  const records = loadAllRecords();
  const patterns: Map<string, { count: number; successCount: number }> = new Map();
  
  for (const r of records) {
    // 用任务的前 20 个字符作为模式标识
    const pattern = r.task.substring(0, 20);
    const existing = patterns.get(pattern) || { count: 0, successCount: 0 };
    existing.count++;
    if (r.success) existing.successCount++;
    patterns.set(pattern, existing);
  }

  const skills: LearnedSkill[] = [];
  for (const [pattern, stats] of patterns) {
    const successRate = stats.count > 0 ? stats.successCount / stats.count : 0;
    if (stats.count >= 3 && successRate >= 0.7) {
      skills.push({
        name: `auto-skill-${Date.now()}`,
        description: `自动提炼的高成功率模式: ${pattern}`,
        pattern,
        successRate,
        createdAt: Date.now(),
      });
    }
  }
  return skills;
}

/**
 * 保存提炼出的技能
 */
export function saveSkill(skill: LearnedSkill): void {
  const skillFile = path.join(SKILLS_DIR, `${skill.name}.json`);
  fs.writeFileSync(skillFile, JSON.stringify(skill, null, 2));
}
