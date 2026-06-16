import fs from 'fs';
import path from 'path';

const PROFILE_DIR = path.join(process.cwd(), 'data', 'profile');
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });

const USER_PROFILE_PATH = path.join(PROFILE_DIR, 'USER.md');
const PROJECT_MEMORY_PATH = path.join(PROFILE_DIR, 'PROJECT.md');

export interface UserPreference {
  category: string;
  key: string;
  value: string;
  confidence: number;
  lastUpdated: number;
}

export interface ProjectContext {
  domain: string;
  keyConcepts: string[];
  commonPitfalls: string[];
  successPatterns: string[];
}

export class UserProfileManager {
  private preferences: UserPreference[] = [];
  private projectContext: ProjectContext = { domain: '', keyConcepts: [], commonPitfalls: [], successPatterns: [] };

  constructor() {
    this.load();
  }

  private load(): void {
    if (fs.existsSync(USER_PROFILE_PATH)) {
      const content = fs.readFileSync(USER_PROFILE_PATH, 'utf-8');
      this.parseUserProfile(content);
    }
    if (fs.existsSync(PROJECT_MEMORY_PATH)) {
      const content = fs.readFileSync(PROJECT_MEMORY_PATH, 'utf-8');
      this.parseProjectContext(content);
    }
  }

  private parseUserProfile(content: string): void {
    const prefRegex = /- \*\*(.+?)\*\*: (.+?) \(置信度: (\d+\.?\d*)\)/g;
    let match;
    while ((match = prefRegex.exec(content)) !== null) {
      this.preferences.push({
        category: 'general',
        key: match[1],
        value: match[2],
        confidence: parseFloat(match[3]),
        lastUpdated: Date.now(),
      });
    }
  }

  private parseProjectContext(content: string): void {
    const domainMatch = content.match(/## 项目领域\n(.+)/);
    if (domainMatch) this.projectContext.domain = domainMatch[1];
    const conceptsMatch = content.match(/## 关键概念\n([\s\S]*?)(?=##|$)/);
    if (conceptsMatch) {
      this.projectContext.keyConcepts = conceptsMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.replace('- ', ''));
    }
  }

  private saveUserProfile(): void {
    let content = '# 用户画像 (USER.md)\n\n## 偏好设置\n';
    for (const pref of this.preferences) {
      content += `- **${pref.key}**: ${pref.value} (置信度: ${pref.confidence.toFixed(1)})\n`;
    }
    content += `\n> 最后更新: ${new Date().toISOString()}\n`;
    fs.writeFileSync(USER_PROFILE_PATH, content);
  }

  recordPreference(key: string, value: string, confidence: number = 0.5): void {
    const existing = this.preferences.find(p => p.key === key);
    if (existing) {
      existing.value = value;
      existing.confidence = Math.min(1, existing.confidence + 0.1);
      existing.lastUpdated = Date.now();
    } else {
      this.preferences.push({ category: 'general', key, value, confidence, lastUpdated: Date.now() });
    }
    this.saveUserProfile();
  }

  getPreference(key: string): string | undefined {
    const pref = this.preferences.find(p => p.key === key);
    return pref?.value;
  }

  getProfile(): string {
    if (fs.existsSync(USER_PROFILE_PATH)) {
      return fs.readFileSync(USER_PROFILE_PATH, 'utf-8');
    }
    return '# 用户画像\n\n暂无数据。随着使用次数增加，这里会自动记录您的偏好和习惯。\n';
  }

  recordProjectContext(context: Partial<ProjectContext>): void {
    Object.assign(this.projectContext, context);
    this.saveProjectContext();
  }

  private saveProjectContext(): void {
    let content = '# 项目记忆 (PROJECT.md)\n\n';
    content += `## 项目领域\n${this.projectContext.domain || '未设定'}\n\n`;
    content += '## 关键概念\n';
    for (const concept of this.projectContext.keyConcepts) { content += `- ${concept}\n`; }
    content += '\n## 常见陷阱\n';
    for (const pitfall of this.projectContext.commonPitfalls) { content += `- ${pitfall}\n`; }
    content += '\n## 成功模式\n';
    for (const pattern of this.projectContext.successPatterns) { content += `- ${pattern}\n`; }
    content += `\n> 最后更新: ${new Date().toISOString()}\n`;
    fs.writeFileSync(PROJECT_MEMORY_PATH, content);
  }

  async inferPreferences(): Promise<void> {
    const semanticMemory = await import('./semantic-memory').then(m => m.semanticMemory);
    const stats = await semanticMemory.getStats();
    if (stats.totalMemories > 10) {
      this.recordPreference('活跃度', '高', 0.8);
    }
  }
}

export const userProfile = new UserProfileManager();