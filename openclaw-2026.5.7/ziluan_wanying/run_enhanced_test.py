#!/usr/bin/env python3
"""
场域感知增强模块——levax29-ai崩溃案例精细复测
"""
import sys
sys.path.insert(0, '.')
import json
import csv
import os

from enhanced_sensors import tick, SelfCorrectionLogger, detect_A_inert, detect_sigmaD_trend, detect_U_peak_reversal


def main():
    history = []
    with open('../thinkcheck-agent-v6/test_b_pure_multidim.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            history.append({
                'U': float(row['U']),
                'D': float(row['D']),
                'A': float(row['A']),
                'H': float(row['H']),
            })

    logger = SelfCorrectionLogger()
    all_signals = []

    for i in range(len(history)):
        result = tick(history, i, extra_tags={'test': 'levax29_crash'})
        if result['detected_signals']:
            all_signals.append({
                'step': i,
                'signals': result['detected_signals'],
                'U': history[i]['U'],
                'A': history[i]['A'],
                'H': history[i]['H'],
                'D': history[i]['D'],
                'details': {
                    'A_inert': result.get('A_inert'),
                    'sigmaD_trend': result.get('sigmaD_trend'),
                    'U_peak_reversal': result.get('U_peak_reversal'),
                }
            })

    print('=' * 70)
    print('  ThinkCheck增强感知模块——levax29-ai崩溃案例精细复测')
    print('=' * 70)
    print(f'\n  测试数据: thinkcheck-agent-v6/test_b_pure_multidim.csv')
    print(f'  总采样点数: {len(history)}')
    print(f'  检测到增强信号的步数: {len(all_signals)}')

    u_vals = [h['U'] for h in history]
    a_vals = [h['A'] for h in history]
    h_vals = [h['H'] for h in history]
    
    print(f'\n  U值范围: [{min(u_vals):.3f}, {max(u_vals):.3f}]')
    print(f'  A值范围: [{min(a_vals):.3f}, {max(a_vals):.3f}]')
    print(f'  H值范围: [{min(h_vals):.3f}, {max(h_vals):.3f}]')

    print('\n' + '=' * 70)
    print('  增强信号详细列表')
    print('=' * 70)
    
    u_peak_count = 0
    a_inert_count = 0
    sigma_d_count = 0
    
    for entry in all_signals:
        print(f'\n  Step {entry["step"]:03d}')
        print(f'    U={entry["U"]:.4f} A={entry["A"]:.4f} D={entry["D"]:.4f} H={entry["H"]:.4f}')
        print(f'    检测信号: {entry["signals"]}')
        
        for sig in entry['signals']:
            if sig == 'U_PEAK_REVERSAL':
                u_peak_count += 1
                detail = entry['details']['U_peak_reversal']
                if detail:
                    print(f'      → peak_U={detail["peak_U"]}, now_U={detail["now_U"]}, ΔU={detail["delta_U"]}')
            elif sig == 'A_INERT':
                a_inert_count += 1
                detail = entry['details']['A_inert']
                if detail:
                    print(f'      → sigma_A={detail["sigma_A"]}, boundary={detail["boundary"]}')
            elif sig == 'SIGMA_D_TREND':
                sigma_d_count += 1

    print('\n' + '=' * 70)
    print('  信号类型统计')
    print('=' * 70)
    print(f'  U_PEAK_REVERSAL（U值峰值反转）: {u_peak_count} 次')
    print(f'  A_INERT（A值活性丧失）: {a_inert_count} 次')
    print(f'  SIGMA_D_TREND（场域不确定性收敛）: {sigma_d_count} 次')

    print('\n' + '=' * 70)
    print('  崩溃前兆分析')
    print('=' * 70)

    print('\n  [Bug 1] 身份退化分析:')
    u_peak_steps = [e['step'] for e in all_signals if 'U_PEAK_REVERSAL' in e['signals']]
    print(f'    U_PEAK_REVERSAL信号出现在步数: {u_peak_steps}')
    if u_peak_steps:
        print(f'    最早出现在第 {min(u_peak_steps)} 步')

    print('\n  [Bug 2] 语义漂移分析:')
    a_inert_steps = [e['step'] for e in all_signals if 'A_INERT' in e['signals']]
    print(f'    A_INERT信号出现在步数: {a_inert_steps}')
    if a_inert_steps:
        print(f'    最早出现在第 {min(a_inert_steps)} 步')

    print('\n  [Bug 3] 虚假自信分析:')
    combo_steps = [e['step'] for e in all_signals if ('A_INERT' in e['signals'] and 'U_PEAK_REVERSAL' in e['signals'])]
    print(f'    A_INERT+U_PEAK_REVERSAL组合信号出现在步数: {combo_steps}')

    print('\n  [Bug 5] 长上下文失效分析:')
    sigma_steps = [e['step'] for e in all_signals if 'SIGMA_D_TREND' in e['signals']]
    print(f'    SIGMA_D_TREND信号出现在步数: {sigma_steps}')
    if sigma_steps:
        print(f'    最早出现在第 {min(sigma_steps)} 步')

    print('\n' + '=' * 70)
    print('  信号组合分析')
    print('=' * 70)
    
    print('\n  多信号同时出现的步数:')
    for entry in all_signals:
        if len(entry['signals']) > 1:
            print(f'    Step {entry["step"]:03d}: {entry["signals"]}')

    with open('enhanced_detection_report.json', 'w', encoding='utf-8') as f:
        json.dump(all_signals, f, indent=2, ensure_ascii=False)

    print('\n' + '=' * 70)
    print('  完整报告已保存至 enhanced_detection_report.json')
    print('=' * 70)


if __name__ == '__main__':
    import sys
    main()
