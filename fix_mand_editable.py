with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html', 'r', encoding='utf-8') as f:
    content = f.read()

errors = []

# ── 1. Add editable textarea in the form (after the cuenta judicial grid) ─────
old_html = (
    '        <div class="slbl">Documentos a generar</div>'
)
new_html = (
    '        <div class="fg full" id="fg-texto-mand" style="display:none;margin-top:4px">\n'
    '          <label>Texto del auto <span style="font-weight:400;color:var(--t3);font-size:11px;text-transform:none;letter-spacing:0">'
    '— "El auto que lo ordena dice en lo pertinente:" — editable</span></label>\n'
    '          <textarea id="f-texto-mand" rows="5" style="resize:vertical;min-height:90px;border:1px solid var(--ln);'
    'border-radius:0;padding:8px 0;font-size:12px;line-height:1.6;margin-top:4px" placeholder="Se extrae automáticamente del proveído"></textarea>\n'
    '        </div>\n\n'
    '        <div class="slbl">Documentos a generar</div>'
)
if old_html in content:
    content = content.replace(old_html, new_html, 1)
    print("OK: textarea f-texto-mand added in HTML")
else:
    errors.append("ERROR: could not find 'Documentos a generar' slbl")

# ── 2. Update fillForm to populate the textarea ───────────────────────────────
old_fill = "  renderBancos(d.bancos||[]);updPrev();chkDom();\n}"
new_fill = (
    "  renderBancos(d.bancos||[]);updPrev();chkDom();\n"
    "  const _ftm=document.getElementById('f-texto-mand');\n"
    "  const _fgtm=document.getElementById('fg-texto-mand');\n"
    "  if(_ftm)_ftm.value=d.textoMandamiento||'';\n"
    "  if(_fgtm)_fgtm.style.display=d.textoMandamiento?'block':'none';\n"
    "}"
)
if old_fill in content:
    content = content.replace(old_fill, new_fill, 1)
    print("OK: fillForm updated to set textoMandamiento textarea")
else:
    errors.append("ERROR: could not find fillForm end block")

# ── 3. Add textoMandamiento to getForm() return object ───────────────────────
old_getform = "textoOriginal:raw.textoOriginal||'',textoEmbargo:raw.textoEmbargo||''};"
new_getform = "textoOriginal:raw.textoOriginal||'',textoEmbargo:raw.textoEmbargo||'',textoMandamiento:(document.getElementById('f-texto-mand')||{}).value||raw.textoMandamiento||''};"
if old_getform in content:
    content = content.replace(old_getform, new_getform, 1)
    print("OK: getForm() now includes textoMandamiento")
else:
    errors.append("ERROR: could not find getForm end")
    idx = content.find("textoEmbargo:raw.textoEmbargo")
    if idx != -1:
        print("  context:", repr(content[idx:idx+80]))

if errors:
    for e in errors:
        print(e)
    import sys; sys.exit(1)

with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done — generador-municipalidad.html saved")
