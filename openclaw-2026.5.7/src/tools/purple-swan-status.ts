/**
 * 紫天鹅状态检查
 */

import { PurpleSwanOrchestrator } from './purple-swan-orchestrator.js';

const swan = new PurpleSwanOrchestrator();

console.log('='.repeat(60));
console.log('🦢 紫天鹅 (Purple Swan) - 系统状态');
console.log('='.repeat(60));
console.log();

const status = swan.getStatus();

console.log('📋 系统信息:');
console.log(`  版本: ${status.version}`);
console.log(`  模式: ${status.mode}`);
console.log();

console.log('🔧 组件状态:');
console.log(`  执行层: ${status.components.execution}`);
console.log(`  记忆层: ${status.components.memory}`);
console.log(`  评估层: ${status.components.review}`);
console.log();

console.log('📁 文件路径:');
console.log(`  ThinkCheck 客户端: src/tools/thinkcheck-client.ts');
console.log(`  记忆客户端: src/tools/memory-client.ts');
console.log(`  协调总线: src/tools/purple-swan-orchestrator.ts');
console.log(`  文档: docs/purple-swan.md');
console.log();

console.log('💡 使用说明:');
console.log('  pnpm purple-swan:example  - 运行示例');
console.log('  pnpm purple-swan:status   - 查看状态');
console.log();
console.log('='.repeat(60));
