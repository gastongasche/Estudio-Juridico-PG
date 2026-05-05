files = [
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html',
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-fisco.html',
]

# ── 1. HTML: add warning inside fg-texto-mand, before the textarea ────────────
OLD_HTML = (
    '          <textarea id="f-texto-mand" rows="5" style="resize:vertical;min-height:90px;'
    'border:1px solid var(--ln);border-radius:0;padding:8px 0;font-size:12px;line-height:1.6;'
    'margin-top:4px" placeholder="Se extrae automáticamente del proveído"></textarea>'
)
NEW_HTML = (
    '          <div class="alert al-warn" id="mand-text-warn" style="display:none;margin-bottom:6px">'
    'No se detectó el texto del auto en el proveído — completalo manualmente en el campo de abajo.</div>\n'
    '          <textarea id="f-texto-mand" rows="5" style="resize:vertical;min-height:90px;'
    'border:1px solid var(--ln);border-radius:0;padding:8px 0;font-size:12px;line-height:1.6;'
    'margin-top:4px" placeholder="Se extrae automáticamente del proveído"></textarea>'
)

# ── 2. JS: update fillForm to show warning when proveído analyzed but no text found ──
OLD_FILL = (
    "  if(_ftm)_ftm.value=d.textoMandamiento||'';\n"
    "  if(_fgtm)_fgtm.style.display=d.textoMandamiento?'block':'none';"
)
NEW_FILL = (
    "  if(_ftm)_ftm.value=d.textoMandamiento||'';\n"
    "  const _mandParsedEmpty=!d.textoMandamiento&&!!d.textoOriginal;\n"
    "  if(_fgtm)_fgtm.style.display=(d.textoMandamiento||_mandParsedEmpty)?'block':'none';\n"
    "  const _mwarn=document.getElementById('mand-text-warn');\n"
    "  if(_mwarn)_mwarn.style.display=_mandParsedEmpty?'block':'none';"
)

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    ok1 = ok2 = False

    if OLD_HTML in content:
        content = content.replace(OLD_HTML, NEW_HTML, 1)
        ok1 = True
    else:
        print(f'ERROR HTML: not found in {path}')

    if OLD_FILL in content:
        content = content.replace(OLD_FILL, NEW_FILL, 1)
        ok2 = True
    else:
        print(f'ERROR JS fillForm: not found in {path}')

    if ok1 and ok2:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'OK: {path}')
