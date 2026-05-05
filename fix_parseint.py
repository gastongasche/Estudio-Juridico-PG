import re

files = [
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html',
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-fisco.html',
]

OLD = 'parseInt(D.juzgadoNum)'
NEW = "parseInt((D.juzgadoNum||'').replace(/[^0-9]/g,''))"

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    count = content.count(OLD)
    if count == 0:
        print(f'SKIP {path}: not found')
        continue
    content = content.replace(OLD, NEW)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK {path}: replaced {count} occurrence(s)')
