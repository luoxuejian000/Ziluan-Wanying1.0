# 紫天鹅 · 绝世神品

记忆、执行与审视三位一体的元核心系统

## 概述

紫天鹅是基于晶脉哲学与谐振理论构建的智能协调系统，实现了：

1. **执行层** - 智能任务执行与协调
2. **记忆层** - 分层记忆系统（会话缓存 + SQLite持久化 + 技能提炼）
3. **审视层** - ThinkCheck 3.0 诊断引擎（通过诊断桥接连接水晶之心）

## 目录结构

```
src/
├── core/
│   └── purple-swan-orchestrator.ts  # 终极协调总线
├── tools/
│   ├── hierarchical-memory.ts       # 分层记忆系统
│   ├── evolution-engine.ts          # 自我进化引擎
│   └── diagnosis-bridge.ts          # 诊断桥接模块
└── purple-swan.ts                   # 入口示例
```

## 快速开始

### 1. 基本使用

```typescript
import { PurpleSwanOrchestrator } from "./library";

const swan = new PurpleSwanOrchestrator();

const task = {
  type: "legal-analysis",
  content: "本案涉及善意取得制度，张三在购买时不知李四系无权处分..."
};

const result = await swan.execute(task);
console.log("执行结果:", result);
```

### 2. 系统状态

```typescript
const status = swan.getStatus();
console.log("紫天鹅状态:", status);
/*
{
  version: 'ultimate',
  mode: 'trinity-core',
  memory: { ... },
  evolution: { ... }
}
*/
```

### 3. 直接使用诊断功能

```typescript
import { diagnoseText } from "./library";

const report = await diagnoseText("需要诊断的文本内容");
console.log("诊断报告:", report);
/*
{
  U: number,        // 不确定性
  D: number,        // 漂移度
  A: number,        // 矛盾度
  H: number,        // 和谐度
  verdict: string,   // 判定
  drift_warnings: [],
  suggestions: []
}
*/
```

### 4. 直接使用记忆系统

```typescript
import { memory } from "./library";

// 保存记忆
memory.save({
  id: "mem-001",
  content: "这是一条记忆内容",
  timestamp: Date.now(),
  harmonyScore: 0.8,
  tags: ["important", "reference"]
});

// 搜索记忆
const results = memory.search("关键词", 10);

// 获取统计
const stats = memory.getStats();
```

## 6阶段闭环流程

1. **行动前反思 (MIRROR)** - 预检查，和谐度 < 0.3 直接拒绝
2. **记忆检索** - 从历史中查找相似任务
3. **执行任务** - 生成推理输出
4. **执行后诊断** - ThinkCheck 3.0 全面评估
5. **记忆存储** - 将结果存入分层记忆系统
6. **进化循环** - 和谐度 >= 0.7 触发技能提炼

## 依赖

- TypeScript
- better-sqlite3 (记忆持久化)
- Node.js 20+
- 水晶之心 (hermes-agent) 的 ThinkCheck 3.0 引擎

## 作者

李广好 (luoxuejian000)

## 许可证

MIT
