#!/usr/bin/env python3
"""完整闭环演示：CSI模拟 → 特征提取 → 翻转点预警"""
import sys, time, datetime
sys.path.insert(0, ".")
from aegis.src.aegis_daemon import AegisDaemon
from aegis.src.crystalmind_integration import AegisFlipPointBridge

def main():
    print("+==========================================================+")
    print("|   Aegis Node v0.1  -- 完整闭环演示（模拟模式）          |")
    print("|   晶脉哲学 x WiFi感知 x 翻转点预警                      |")
    print("+==========================================================+")
    aegis = AegisDaemon(mode="simulate", interval=0.3)
    aegis.start()
    bridge = AegisFlipPointBridge(window_size=20)
    alert_count = 0
    try:
        for cycle in range(100):
            time.sleep(0.35)
            snap = aegis.step()
            if snap is None:
                continue
            alert = bridge.feed(snap)
            ts = datetime.datetime.now().strftime("%H:%M:%S")
            flag = "[OK]" if snap.get("H_proxy", 0) > 0.35 else "[!!]"
            print("[%s] #%03d  exist=%.3f  stab=%.3f  A=%.3f  H=%.3f  %s" % (ts, cycle, snap['existence'], snap['stability'], snap['A_proxy'], snap['H_proxy'], flag), end="")
            if alert:
                alert_count += 1
                print("  <<< FLIP ALERT #%d >>>" % alert_count)
                print("       Paths: %s, A_proxy=%s, H_proxy=%s" % (alert['paths'], alert['A_proxy'], alert['H_proxy']))
            else:
                print()
    except KeyboardInterrupt:
        pass
    finally:
        aegis.stop()
        print("\n[Aegis] Stopped. Total flip alerts: %d" % alert_count)

if __name__ == "__main__":
    main()