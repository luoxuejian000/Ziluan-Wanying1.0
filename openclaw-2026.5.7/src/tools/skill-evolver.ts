import fs from 'fs';
import path from 'path';
import { memory } from './hierarchical-memory';
import { semanticMemory } from './semantic-memory';

const SKILLS_DIR = path.join(process.cwd(), 'skills');

export interface SkillProposal {
  name: string;
  description: string;
  pattern: string;
  confidence: number;
}

export interface EvolutionReport {
  newSkills: SkillProposal[];
  refinedSkills: string[];
  successRate: number;
}

export class SkillEvolver {
  private failureThreshold = 0.5;
  private minFailures = 3;

  async evolve(): Promise<EvolutionReport> {
    const stats = memory.getStats();
    const recentFailures = memory.search('', 50).filter(m => (m.harmonyScore || 0) < this.failureThreshold);

    if (recentFailures.length < this.minFailures) {
      return { newSkills: [], refinedSkills: [], successRate: stats.averageHarmony };
    }

    const clusters: Map<string, typeof recentFailures> = new Map();
    for (const failure of recentFailures) {
      const similar = await semanticMemory.search(failure.content, 3);
      const clusterKey = similar.length > 0 ? similar[0].content.substring(0, 30) : failure.id;
      if (!clusters.has(clusterKey)) clusters.set(clusterKey, []);
      clusters.get(clusterKey)!.push(failure);
    }

    const proposals: SkillProposal[] = [];
    for (const [key, failures] of clusters) {
      if (failures.length >= this.minFailures) {
        const avgH = failures.reduce((s, f) => s + (f.harmonyScore || 0), 0) / failures.length;
        proposals.push({
          name: `auto-skill-${Date.now()}`,
          description: `自动生成：修复"${key}"相关逻辑问题`,
          pattern: key,
          confidence: 1 - avgH,
        });
      }
    }

    for (const proposal of proposals) {
      const skillDir = path.join(SKILLS_DIR, proposal.name);
      if (!fs.existsSync(skillDir)) fs.mkdirSync(skillDir, { recursive: true });
      const skillContent = `---
name: ${proposal.name}
description: ${proposal.description}
confidence: ${proposal.confidence.toFixed(2)}
auto_generated: true
---

# ${proposal.name}

## 触发条件
当检测到与"${proposal.pattern}"相关的逻辑问题时触发。

## 执行规则
1. 在生成内容前，先回顾相关成功案例
2. 确保关键概念的定义前后一致
3. 如果涉及数字或时间，进行交叉验证
4. 生成后调用 diagnoseText 进行质量检查
`;
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);
    }

    return { newSkills: proposals, refinedSkills: [], successRate: stats.averageHarmony };
  }

  getStatus() {
    return {
      skillsDir: SKILLS_DIR,
      existingSkills: fs.existsSync(SKILLS_DIR) ? fs.readdirSync(SKILLS_DIR).filter(f => f.startsWith('auto-skill-')).length : 0,
    };
  }
}

export const skillEvolver = new SkillEvolver();