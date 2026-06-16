/**
 * ThinkCheck 评估客户端 — 水晶之心的内嵌调用接口
 * 理论根基：晶脉哲学四重公理
 *   - 关系本体论 → U(统一性)：检测概念在关系网络中的语义一致性
 *   - 矛盾动力论 → D(发展性) + A(对抗性)：度量新信息引入节奏与内在矛盾密度
 *   - 实践介入论 → 评估报告透明化、权重可协商
 *   - 谐振调谐论 → H(和谐度) = λU·U + λD·D - λA·A
 */

import { exec } from 'child_process';
import path from 'path';

// 水晶之心项目根目录
const CRYSTAL_HEART_ROOT = 'D:/luoxuejian000/new02/hermes-agent-main/hermes-agent-main';
const PYTHON_EXE = path.join(CRYSTAL_HEART_ROOT, '.venv', 'Scripts', 'python.exe');

export interface ThinkCheckResult {
  U: number;
  D: number;
  A: number;
  H: number;
  verdict: string;
  drift_warnings: Array<{
    term: string;
    consistency: number;
    threshold: number;
    occurrences: number;
  }>;
  suggestions: string[];
  diagnosisDuration: number;
}

/**
 * 调用水晶之心的诊断工具
 * 通过本地子进程直接调用 Python，比 HTTP MCP 延迟更低、更可靠
 */
export async function diagnoseText(text: string): Promise<ThinkCheckResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(CRYSTAL_HEART_ROOT, 'mcp_tool.py');
    const command = `"${PYTHON_EXE}" -c "import sys; sys.path.insert(0, '${CRYSTAL_HEART_ROOT}'); from mcp_tool import evaluate_text; import json; result = evaluate_text(r'''${text.replace(/'/g, "\\'")}'''); print(json.dumps(result))"`;

    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`ThinkCheck 评估失败: ${stderr || error.message}`));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result as ThinkCheckResult);
      } catch (e) {
        reject(new Error(`解析评估结果失败: ${stdout}`));
      }
    });
  });
}
