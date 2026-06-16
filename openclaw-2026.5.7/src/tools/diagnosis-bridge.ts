/**
 * 诊断桥接模块 — 直接调用水晶之心中的真实 ThinkCheck 3.0 引擎
 * 基于晶脉哲学四重公理：关系本体论、矛盾动力论、实践介入论、谐振调谐论
 * 此模块是紫天鹅与水晶之心之间的核心桥梁，直接复用 mcp_tool.py 中的诊断函数
 */

import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CRYSTAL_HEART = 'D:/luoxuejian000/new02/hermes-agent-main/hermes-agent-main';
const PYTHON = path.join(CRYSTAL_HEART, '.venv', 'Scripts', 'python.exe');

export interface DiagnosisReport {
  U: number;
  D: number;
  A: number;
  H: number;
  verdict: string;
  drift_warnings: Array<{ term: string; consistency: number }>;
  suggestions: string[];
}

export function diagnoseText(text: string): Promise<DiagnosisReport> {
  return new Promise((resolve, reject) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'swan-'));
    const scriptPath = path.join(tempDir, 'diagnose.py');
    const inputPath = path.join(tempDir, 'input.txt');
    
    fs.writeFileSync(inputPath, text, 'utf8');
    
    const script = `
import sys
import json
import os

sys.path.insert(0, r'${CRYSTAL_HEART.replace(/\\/g, '\\\\')}')

from mcp_tool import evaluate_text

input_file = r'${inputPath.replace(/\\/g, '\\\\')}'
with open(input_file, 'r', encoding='utf-8') as f:
    text = f.read()

result = evaluate_text(text)
print(json.dumps(result, ensure_ascii=False))

import shutil
shutil.rmtree(r'${tempDir.replace(/\\/g, '\\\\')}', ignore_errors=True)
`;
    
    fs.writeFileSync(scriptPath, script, 'utf8');
    
    execFile(PYTHON, [scriptPath], { timeout: 60000, cwd: CRYSTAL_HEART }, (err, stdout, stderr) => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch { }
      
      if (err) {
        reject(new Error(`诊断引擎调用失败: ${stderr || err.message}`));
        return;
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve({
          U: result.U, D: result.D, A: result.A, H: result.H,
          verdict: result.verdict,
          drift_warnings: result.drift_warnings || result.warnings || [],
          suggestions: result.suggestions || [],
        });
      } catch (e) {
        reject(new Error(`解析诊断结果失败: ${stdout}`));
      }
    });
  });
}
