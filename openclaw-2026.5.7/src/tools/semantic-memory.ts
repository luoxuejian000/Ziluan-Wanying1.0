import path from 'path';
import fs from 'fs';

const MEM_DIR = path.join(process.cwd(), 'data', 'semantic-memory');
if (!fs.existsSync(MEM_DIR)) fs.mkdirSync(MEM_DIR, { recursive: true });

const memories: SemanticMemory[] = [];

let embedder: any = null;
async function getEmbedder() {
  if (!embedder) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch {
      embedder = null;
    }
  }
  return embedder;
}

export interface SemanticMemory {
  id: string;
  content: string;
  embedding: number[];
  timestamp: number;
  harmonyScore?: number;
  tags?: string[];
  category?: string;
}

export class SemanticMemoryStore {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
  }

  async embed(text: string): Promise<number[]> {
    const model = await getEmbedder();
    if (!model) {
      return [];
    }
    const result = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(result.data);
  }

  async save(memory: SemanticMemory): Promise<void> {
    await this.init();
    if (!memory.embedding) {
      memory.embedding = await this.embed(memory.content);
    }
    memories.push(memory);
  }

  async search(query: string, limit: number = 5): Promise<SemanticMemory[]> {
    await this.init();
    // 简单的关键词匹配
    const results = memories.filter(m => 
      m.content.includes(query) || 
      m.tags?.some(t => t.includes(query)) ||
      m.category?.includes(query)
    );
    return results.slice(0, limit);
  }

  async getStats() {
    return { totalMemories: memories.length, storagePath: path.join(MEM_DIR, 'in-memory') };
  }
}

export const semanticMemory = new SemanticMemoryStore();
