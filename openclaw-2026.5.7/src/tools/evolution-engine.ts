/**
 * 自我进化引擎 — 基于谐振调谐论，从执行历史中自动提炼技能
 */

import { memory, SkillRecord } from './hierarchical-memory';

export class EvolutionEngine {
  private lastEvo = 0;
  private interval = 3600000; // 每小时

  evolve(): { newSkills: SkillRecord[]; deprecated: string[] } {
    const now = Date.now();
    if (now - this.lastEvo < this.interval) return { newSkills: [], deprecated: [] };
    this.lastEvo = now;
    const skills = memory.extractSkills(0.7, 3);
    const stats = memory.getStats();
    return { newSkills: skills, deprecated: stats.averageHarmony < 0.5 ? ['low-harmony-patterns'] : [] };
  }

  getStatus() { return { lastEvolution: this.lastEvo, interval: this.interval, stats: memory.getStats() }; }
}

export const evolution = new EvolutionEngine();