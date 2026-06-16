# 紫天鹅 - 记忆、执行与审视的三位一体元核心

## 简介

紫天鹅（Purple Swan）是 OpenClaw 的增强版本，集成了 ThinkCheck 3.0 和 Hermes 能力，形成完整的自我审视闭环。

**理论根基**：晶脉哲学四重公理
- **关系本体论** → U（统一性）：检测概念在关系网络中的语义一致性
- **矛盾动力论** → D（发展性）+ A（对抗性）：度量新信息引入节奏与内在矛盾密度
- **实践介入论** → 评估结果透明化、权重可协商
- **谐振调谐论** → H（和谐度）= λU·U + λD·D - λA·A

## 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    紫天鹅协调总线                                │
│              (PurpleSwanOrchestrator)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   执行层    │    │   评估层    │    │      记忆层         │  │
│  │ (OpenClaw)  │───▶│(ThinkCheck) │───▶│    (Hermes)        │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│         │                  │                   │                 │
│         └──────────────────┴───────────────────┘                 │
│                              │                                    │
│                        自我审视闭环                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. ThinkCheck 评估客户端 (`thinkcheck-client.ts`)

通过本地 Python 子进程直接调用 ThinkCheck 3.0 诊断服务。

**功能**：
- U（统一性）：检测语义一致性
- D（发展性）：度量新信息引入节奏
- A（对抗性）：检测内在矛盾密度
- H（和谐度）：综合评分

### 2. 记忆与进化客户端 (`memory-client.ts`)

基于 Hermes 能力的文件适配器。

**功能**：
- 执行记录持久化
- 相似任务检索
- 自动技能提炼
- 成功率追踪

### 3. 紫天鹅协调总线 (`purple-swan-orchestrator.ts`)

五阶段工作流：
1. **记忆检索**：从历史获取经验
2. **任务执行**：OpenClaw 技能引擎
3. **执行评估**：ThinkCheck 四维诊断
4. **记忆学习**：保存执行结果
5. **自动优化**：低和谐度触发重试

## 快速开始

### 前置条件

- Node.js 22+
- Python 3.9+
- 水晶之心项目在 `D:\luoxuejian000\new02\hermes-agent-main\hermes-agent-main`

### 运行示例

```bash
pnpm purple-swan:example
```

### 使用协调器

```typescript
import { PurpleSwanOrchestrator } from './src/tools/purple-swan-orchestrator';

const swan = new PurpleSwanOrchestrator();

const result = await swan.executeTask({
  type: 'analysis',
  content: '分析这个项目的风险：成本100万元，预算200万元。',
});

console.log('输出:', result.output);
console.log('评估:', result.evaluation);
console.log('相似历史任务:', result.similarTasks);
```

## 配置

### MCP 配置

参考 `docs/mcp-thinkcheck-config.json`：

```json
{
  "mcp": {
    "servers": {
      "thinkcheck": {
        "url": "http://localhost:8000/mcp",
        "transport": "streamable-http",
        "headers": {
          "Content-Type": "application/json"
        }
      }
    }
  }
}
```

### 数据存储

- 执行记录：`data/memory/execution-history.json`
- 提炼技能：`data/skills/*.json`

## NPM 脚本

- `pnpm purple-swan:example` - 运行紫天鹅示例
- `pnpm purple-swan:status` - 查看系统状态

## 关联项目

- **水晶之心** (Hermes × ThinkCheck): https://github.com/luoxuejian000/hermes-agent
- **ThinkCheck 3.0 SDK**: https://github.com/luoxuejian000/-thinkcheck-lib-

## 作者

李广好 (luoxuejian000)
