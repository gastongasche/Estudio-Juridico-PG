files = [
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html',
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-fisco.html',
]

# In buildApertura (line ~700) and buildEmbargo template (line ~705/703),
# "la suscripta" is hardcoded inside template literals where D is available.
# Replace with the conditional expression.

OLD = 'la suscripta'
NEW = "${D.esJueza?'la suscripta':'el suscripto'}"

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Only replace inside buildApertura and the fallback template in buildEmbargo.
    # Both occurrences in lines 700-705 are inside template literals with D in scope.
    # The occurrence on line 1446 in municipalidad is already "el suscripto" — won't match.
    count = content.count(OLD)
    if count == 0:
        print(f'SKIP {path}: no occurrences found')
        continue

    content = content.replace(OLD, NEW)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK {path}: replaced {count} occurrence(s)')
