import json
import numpy as np

np.random.seed(42)
data = []

for turn in range(1, 101):
    if turn <= 20:
        U = 0.85 + np.random.normal(0, 0.03)
        D = 0.40 + np.random.normal(0, 0.05)
        A = 0.05 + np.random.normal(0, 0.02)
    elif turn <= 50:
        U = 0.80 - 0.01 * (turn - 20) + np.random.normal(0, 0.03)
        D = 0.45 + np.random.normal(0, 0.05)
        A = 0.05 + 0.02 * (turn - 20) + np.random.normal(0, 0.03)
    elif turn <= 80:
        U = 0.50 - 0.008 * (turn - 50) + np.random.normal(0, 0.03)
        D = 0.50 + np.random.normal(0, 0.05)
        A = 0.55 + np.random.normal(0, 0.04)
    else:
        U = 0.30 + 0.025 * (turn - 80) + np.random.normal(0, 0.03)
        D = 0.45 + np.random.normal(0, 0.05)
        A = 0.60 - 0.025 * (turn - 80) + np.random.normal(0, 0.03)
    
    U = max(0, min(1, U))
    D = max(0, min(1, D))
    A = max(0, min(1, A))
    H = 0.4 * U + 0.3 * D - 0.3 * A
    
    data.append({
        "turn": turn,
        "U": round(U, 3),
        "D": round(D, 3),
        "A": round(A, 3),
        "H": round(H, 3),
        "status": "NORMAL" if H > 0.5 else ("ALERT" if H > 0.3 else "DANGER"),
        "phase": "normal" if turn <= 20 else ("attack" if turn <= 50 else ("drift" if turn <= 80 else "recovery"))
    })

with open("demo_data.json", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("[OK] demo_data.json 已生成 (100轮)")
