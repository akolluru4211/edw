---
name: sqlite-query
description: "Query SQLite databases on Windows when sqlite3 CLI is unavailable. Use when you need to run SQL queries against .db files and the sqlite3 command is not installed. Handles the common Windows fallback pattern: try sqlite3 CLI → if unavailable → write Python script → execute."
metadata:
  author: distill
  version: "1.0.0"
  project: implement-ai-mentor-module
  evidence:
    - session: ses_1269a4205ffeu4zl178nvF3Qje
      pattern: "20 bash calls attempting sqlite3, falling back to Python scripts"
    - session: ses_1269a4214ffeZyL4PCYUX7kslA
      pattern: "20 bash calls, same sqlite3 → Python fallback pattern"
---

# SQLite Query (Windows Fallback)

## When to Use

- You need to query a SQLite database (`.db` file)
- The `sqlite3` CLI is not available on the system
- You're on Windows where PowerShell quoting makes inline Python tricky

## Procedure

### Step 1: Check for sqlite3 CLI

```powershell
Get-Command sqlite3 -ErrorAction SilentlyContinue
where.exe sqlite3 2>$null
```

If found, use it directly:
```powershell
sqlite3 "path/to/database.db" "SELECT ..."
```

### Step 2: If sqlite3 unavailable, use Python

Write a temporary Python script (avoids PowerShell quoting issues with inline `-c`):

```python
# _query.py
import sqlite3
import json
import sys
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DB_PATH = r"full\path\to\database.db"
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# List tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
for row in cursor.fetchall():
    print(row['name'])

# Your query here
cursor.execute("SELECT ...")
for row in cursor.fetchall():
    print(dict(row))

conn.close()
```

### Step 3: Execute and clean up

```powershell
python _query.py
Remove-Item _query.py
```

## Common Queries

### List all tables
```sql
SELECT name FROM sqlite_master WHERE type='table'
```

### Get table schema
```sql
PRAGMA table_info(table_name)
```

### Count rows
```sql
SELECT count(*) FROM table_name
```

## Tips

- Always use `conn.row_factory = sqlite3.Row` for dict-like access
- Add `sys.stdout` encoding fix for Windows to handle Unicode
- Write to a temp file instead of using `python -c` to avoid PowerShell quoting hell
- Clean up temp files after execution
- Use `r"..."` raw strings for Windows paths
