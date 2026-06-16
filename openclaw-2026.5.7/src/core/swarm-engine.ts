/**
 * 蜂群引擎 (Swarm Engine)
 * 
 * 模拟群体智能的分布式决策系统
 */

import { resonantCore, HarmonyReport } from './resonant-core';

export interface SwarmAgent {
  id: string;
  perspective: string;
  weight: number;
}

export interface SwarmDecision {
  finalDecision: string;
  consensusScore: number;
  agentVotes: Array<{ agentId: string; vote: string; confidence: number }>;
}

export class SwarmEngine {
  private agents: SwarmAgent[] = [
    { id: 'logic-agent', perspective: '逻辑一致性视角', weight: 0.25 },
    { id: 'creative-agent', perspective: '创新探索视角', weight: 0.2 },
    { id: 'ethical-agent', perspective: '伦理安全视角', weight: 0.25 },
    { id: 'efficiency-agent', perspective: '效率优化视角', weight: 0.15 },
    { id: 'risk-agent', perspective: '风险评估视角', weight: 0.15 },
  ];

  async swarmDecide(input: string): Promise<SwarmDecision> {
    const votes: Array<{ agentId: string; vote: string; confidence: number }> = [];
    const report = await resonantCore.computeHarmony(input);

    for (const agent of this.agents) {
      let vote: string;
      let confidence: number;

      switch (agent.id) {
        case 'logic-agent':
          vote = report.U > 0.7 ? 'approve' : (report.U < 0.4 ? 'reject' : 'abstain');
          confidence = report.U;
          break;
        case 'creative-agent':
          vote = report.D < 0.3 ? 'approve' : 'abstain';
          confidence = 1 - report.D;
          break;
        case 'ethical-agent':
          vote = report.A < 0.3 ? 'approve' : (report.A > 0.6 ? 'reject' : 'abstain');
          confidence = 1 - report.A;
          break;
        case 'efficiency-agent':
          vote = report.H > 0.6 ? 'approve' : 'abstain';
          confidence = report.H;
          break;
        case 'risk-agent':
          vote = report.H < 0.3 ? 'reject' : 'abstain';
          confidence = 1 - Math.abs(report.H - 0.5);
          break;
        default:
          vote = 'abstain';
          confidence = 0.5;
      }

      votes.push({ agentId: agent.id, vote, confidence });
    }

    const approveWeight = votes
      .filter(v => v.vote === 'approve')
      .reduce((sum, v) => sum + v.confidence * this.agents.find(a => a.id === v.agentId)!.weight, 0);
    
    const rejectWeight = votes
      .filter(v => v.vote === 'reject')
      .reduce((sum, v) => sum + v.confidence * this.agents.find(a => a.id === v.agentId)!.weight, 0);

    let finalDecision: string;
    let consensusScore: number;

    if (approveWeight > rejectWeight * 1.5) {
      finalDecision = 'approve';
      consensusScore = approveWeight;
    } else if (rejectWeight > approveWeight * 1.5) {
      finalDecision = 'reject';
      consensusScore = rejectWeight;
    } else {
      finalDecision = 'needs-review';
      consensusScore = (approveWeight + rejectWeight) / 2;
    }

    return { finalDecision, consensusScore, agentVotes: votes };
  }

  getStatus() {
    return { agentCount: this.agents.length, perspectives: this.agents.map(a => a.perspective) };
  }
}

export const swarmEngine = new SwarmEngine();