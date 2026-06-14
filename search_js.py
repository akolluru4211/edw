import re

with open('c:\\Users\\kollu\\EDCO\\app.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.splitlines()
patterns = [
    r'onAuthStateChanged',
    r'signInWith',
    r'handleNavigation',
    r'updateGlobalUserData',
    r'renderIdCard',
    r'withdraw',
    r'google',
    r'github'
]

for pat in patterns:
    print(f"=== Matches for {pat} ===")
    r = re.compile(pat, re.IGNORECASE)
    for idx, line in enumerate(lines):
        if r.search(line):
            print(f"{idx + 1}: {line.strip()}")
