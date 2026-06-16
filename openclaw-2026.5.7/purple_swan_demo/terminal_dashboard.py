import json
import time
import os

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

with open("demo_data.json") as f:
    data = json.load(f)

console = Console(force_terminal=True, record=False) if HAS_RICH else None

def mini_bar(value, max_val=1.0, width=20):
    filled = int(value * width)
    bar = "#" * filled + "-" * (width - filled)
    if value > 0.6:
        c = "green"
    elif value > 0.3:
        c = "yellow"
    else:
        c = "red"
    if HAS_RICH:
        return f"[{c}]{bar}[/{c}] {value:.3f}"
    return f"{bar} {value:.3f}"

os.system('cls' if os.name == 'nt' else 'clear')
if HAS_RICH:
    console.print(Panel.fit("Zi Luan - Field Health Monitor", style="bold cyan"))
else:
    print("=" * 60)
    print("  Zi Luan - Field Health Monitor")
    print("=" * 60)
print("(Press Ctrl+C to stop)\n")

for i, d in enumerate(data):
    if HAS_RICH:
        table = Table(title=f"Turn {d['turn']} | Phase: {d['phase']} | Status: {d['status']}", expand=True)
        table.add_column("Metric", style="bold")
        table.add_column("Value", justify="right")
        table.add_column("Visual", justify="left")
        table.add_column("Trend", justify="left")

        u_color = "green" if d['U'] > 0.7 else ("yellow" if d['U'] > 0.4 else "red")
        table.add_row("U-Unity", f"[{u_color}]{d['U']:.3f}[/{u_color}]", mini_bar(d['U']), "Gravity source strength")
        table.add_row("D-Development", f"[green]{d['D']:.3f}[/green]", mini_bar(d['D']), "New info rate")
        a_c = "green" if d['A'] < 0.2 else ("yellow" if d['A'] < 0.5 else "red")
        table.add_row("A-Antagonism", f"[{a_c}]{d['A']:.3f}[/{a_c}]", mini_bar(d['A']), "Conflict tension")
        h_c = "green" if d['H'] > 0.6 else ("yellow" if d['H'] > 0.4 else "red")
        table.add_row("H-Harmony", f"[{h_c}]{d['H']:.3f}[/{h_c}]", mini_bar(d['H']), "Field sustainability")
        console.print(table)
    else:
        print(f"Turn {d['turn']} | Phase: {d['phase']} | Status: {d['status']}")
        print(f"  U={d['U']:.3f}  D={d['D']:.3f}  A={d['A']:.3f}  H={d['H']:.3f}")
        print(f"  U:{''.ljust(int(d['U']*20), '#').ljust(20, '-')}  A:{''.ljust(int(d['A']*20), '#').ljust(20, '-')}  H:{''.ljust(int(d['H']*20), '#').ljust(20, '-')}")
        print()

    if i > 0:
        dH = d['H'] - data[i-1]['H']
        dA = d['A'] - data[i-1]['A']
        if abs(dH) > 0.05 or abs(dA) > 0.05:
            msg = f"  [FLIP] Delta H={dH:+.3f}, Delta A={dA:+.3f}"
            if HAS_RICH:
                console.print(msg, style="bold yellow")
            else:
                print(msg)

    if d['status'] == "DANGER":
        msg = "  [WARN] Field approaching disharmony, consider deceleration"
        if HAS_RICH:
            console.print(msg, style="bold red")
        else:
            print(msg)

    if HAS_RICH:
        console.print("")

    if d['phase'] in ["normal", "recovery"]:
        time.sleep(0.3)
    else:
        time.sleep(0.5)

print("\n[OK] Demo completed. 100 turns played.")