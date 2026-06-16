/**
 * 分层记忆系统 — 三层记忆架构，支持自动压缩与技能提炼
 * L1 会话缓存 / L2 内存持久化 / L3 技能记忆
 */

export interface MemoryRecord { id: string; content: string; timestamp: number; harmonyScore?: number; tags?: string[]; }
export interface SkillRecord { id: string; name: string; pattern: string; successCount: number; totalCount: number; createdAt: number; }

export class HierarchicalMemory {
  private records: MemoryRecord[] = [];

  save(record: MemoryRecord): void {
    const index = this.records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      this.records[index] = record;
    } else {
      this.records.push(record);
    }
    if (this.records.length > 500) {
      this.records.sort((a, b) => a.timestamp - b.timestamp);
      this.records = this.records.slice(-400);
    }
  }

  search(query: string, limit = 5): MemoryRecord[] {
    return this.records
      .filter(r => r.content.includes(query) || (r.tags && r.tags.some(t => query.includes(t))))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  extractSkills(minRate = 0.7, minSamples = 3): SkillRecord[] {
    const tagMap = new Map<string, { count: number; totalH: number }>();
    this.records.forEach(r => {
      r.tags?.forEach(tag => {
        const entry = tagMap.get(tag) || { count: 0, totalH: 0 };
        entry.count++;
        entry.totalH += r.harmonyScore || 0;
        tagMap.set(tag, entry);
      });
    });
    return Array.from(tagMap.entries())
      .filter(([, v]) => v.count >= minSamples && (v.totalH / v.count) >= 0.6)
      .map(([tag, v]) => ({
        id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: `auto-skill-${tag}`,
        pattern: tag,
        successCount: v.count,
        totalCount: v.count,
        createdAt: Date.now(),
      }));
  }

  getStats() {
    const total = this.records.length;
    const avgH = total > 0 ? this.records.reduce((sum, r) => sum + (r.harmonyScore || 0), 0) / total : 0;
    return { totalMemories: total, averageHarmony: avgH };
  }
}

export const memory = new HierarchicalMemory();
