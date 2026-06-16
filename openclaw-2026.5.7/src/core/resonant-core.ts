/**
 * 谐振核心 (Resonant Core)
 * 水晶之心集成版本 - 直接调用Python子进程，无需MCP协议
 */

import { exec } from 'child_process';
import path from 'path';

const CRYSTAL_HEART = 'D:/luoxuejian000/new02/hermes-agent-main/hermes-agent-main';
const PYTHON = path.join(CRYSTAL_HEART, '.venv', 'Scripts', 'python.exe');
const BRIDGE_SCRIPT = path.join(CRYSTAL_HEART, 'diagnosis_bridge.py');

export interface HarmonyReport {
  U: number; D: number; A: number; H: number;
  verdict: string;
  drift_warnings: Array<{ term: string; consistency: number }>;
  suggestions: string[];
  timestamp: number;
}

export interface LambdaWeights { lambdaU: number; lambdaD: number; lambdaA: number; }

export const DEFAULT_LAMBDA: LambdaWeights = { lambdaU: 0.4, lambdaD: 0.4, lambdaA: 0.2 };

export const DOMAIN_PRESETS: Record<string, LambdaWeights> = {
  legal: { lambdaU: 0.6, lambdaD: 0.2, lambdaA: 0.2 },
  financial: { lambdaU: 0.3, lambdaD: 0.4, lambdaA: 0.3 },
  general: { lambdaU: 0.4, lambdaD: 0.4, lambdaA: 0.2 },
};

function simulateHarmony(text: string): HarmonyReport {
  const hasContradiction = /但是|然而|不过|可是/.test(text);
  let U = 0.5, D = 0.1, A = 0.1;
  if (hasContradiction) { D = 0.6; U = 0.4; }
  const H = Math.max(0, Math.min(1, U - D * 0.5 - A * 0.3));
  return {
    U, D, A, H,
    verdict: H >= 0.7 ? '推理质量良好' : H >= 0.5 ? '推理质量一般' : '推理质量较差',
    drift_warnings: [],
    suggestions: H < 0.7 ? ['建议检查论证一致性'] : [],
    timestamp: Date.now(),
  };
}

export class ResonantCore {
  private lambda: LambdaWeights;
  constructor(lambda?: LambdaWeights) { this.lambda = lambda || DEFAULT_LAMBDA; }
  setLambda(lambda: LambdaWeights): void { this.lambda = lambda; }
  setDomain(domain: string): void { if (DOMAIN_PRESETS[domain]) this.lambda = DOMAIN_PRESETS[domain]; }

  async computeHarmony(text: string): Promise<HarmonyReport> {
    if (!text || text.trim().length === 0) {
      return simulateHarmony(text);
    }
    return new Promise((resolve) => {
      const safeText = text.replace(/"/g, '\\"');
      const command = `"${PYTHON}" "${BRIDGE_SCRIPT}" "${safeText}"`;
      exec(command, { timeout: 30000 }, (err, stdout, stderr) => {
        if (err || !stdout.trim()) {
          resolve(simulateHarmony(text));
          return;
        }
        try {
          const result = JSON.parse(stdout.trim());
          resolve({ ...result, timestamp: Date.now() });
        } catch (e) {
          resolve(simulateHarmony(text));
        }
      });
    });
  }

  async computeGradient(currentText: string, actionResult: string): Promise<number> {
    const currentH = await this.computeHarmony(currentText);
    const nextH = await this.computeHarmony(actionResult);
    return nextH.H - currentH.H;
  }

  getLambda(): LambdaWeights { return { ...this.lambda }; }
}

export const resonantCore = new ResonantCore();
