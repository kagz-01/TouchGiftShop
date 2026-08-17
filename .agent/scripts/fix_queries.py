import os
import re
import glob

# Find all ts files in database/models/
files = glob.glob('database/models/*.ts')

def extract_params(sql):
    params = []
    # Replace ${param} with $1, $2, etc. and collect param
    count = [1]
    def repl(m):
        params.append(m.group(1))
        res = f"${count[0]}"
        count[0] += 1
        return res
    new_sql = re.sub(r'\$\{([^}]+)\}', repl, sql)
    return new_sql, params

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # regex to match conn.queryObject<T>`...` or conn.queryObject`...`
    # and conn.query`...`
    pattern = r'(conn\.query(Object)?(?:<[^>]+>)?)\s*`([^`]*)`'
    
    def replacer(m):
        func_call = m.group(1)
        func_call = re.sub(r'<[^>]+>', '', func_call) # remove generic <T> because of string overload issue
        sql_content = m.group(3)
        
        new_sql, params = extract_params(sql_content)
        
        if params:
            params_str = ", ".join(params)
            return f'{func_call}(\n      `{new_sql}`,\n      [{params_str}]\n    )'
        else:
            return f'{func_call}(\n      `{new_sql}`\n    )'

    new_content = re.sub(pattern, replacer, content)
    
    # Fix the literal \n issue in user.ts
    new_content = new_content.replace('// @ts-ignore: Mock DB\\n    const result', '// @ts-ignore: Mock DB\n    const result')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for f in files:
    process_file(f)

