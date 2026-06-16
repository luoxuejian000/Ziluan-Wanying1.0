#!/usr/bin/env node
/**
 * 诊断桥接模块测试脚本
 */

const { exec } = require('child_process');
const path = require('path');

const CRYSTAL_HEART = 'D:/luoxuejian000/new02/hermes-agent-main/hermes-agent-main';

function findPythonPath() {
  const possiblePaths = [
    path.join(CRYSTAL_HEART, '.venv', 'Scripts', 'python.exe'),
    path.join(CRYSTAL_HEART, '.venv', 'bin', 'python'),
    'python3',
    'python',
    'py'
  ];
  for (const p of possiblePaths) {
    try {
      require('fs').accessSync(p, require('fs').constants.X_OK);
      return p;
    } catch (e) {
      if (!p.includes('/') && !p.includes('\\')) {
        return p;
      }
    }
  }
  return 'python';
}

const PYTHON = findPythonPath();
console.log(`使用 Python: ${PYTHON}`);

const testText = "紫天鹅是一个智能协调系统，能够集成记忆、执行和审视能力。";
const safeText = testText
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r')
  .replace(/\t/g, '\\t');

const script = `
import sys
import json
sys.path.insert(0, r'${CRYSTAL_HEART.replace(/\\/g, '\\\\')}')
try:
    from mcp_tool import evaluate_text
    result = evaluate_text(r'''${safeText}''')
    print(json.dumps(result, ensure_ascii=False, indent=2))
except Exception as e:
    print(json.dumps({
        'U': 0.5, 'D': 0.5, 'A': 0.5, 'H': 0.5,
        'verdict': '诊断引擎异常：' + str(e),
        'drift_warnings': [],
        'suggestions': [],
        'error': str(e)
    }, ensure_ascii=False, indent=2))
`;

console.log('测试文本:', testText);
console.log('正在调用 ThinkCheck 3.0 引擎...');

exec(`${PYTHON} -c "${script.replace(/"/g, '\\"')}"`, { timeout: 30000 }, (err, stdout, stderr) => {
  if (stderr) {
    console.log('Stderr:', stderr);
  }
  if (err && !stdout.trim()) {
    console.error('错误:', err);
    return;
  }
  try {
    const result = JSON.parse(stdout.trim());
    console.log('\n诊断结果:');
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('解析失败:', e);
    console.log('原始输出:', stdout);
  }
});
