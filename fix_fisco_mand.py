with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-fisco.html', 'r', encoding='utf-8') as f:
    content = f.read()

errors = []

# ── 1. Add textoMandamiento extractor in parsearProveido ──────────────────────
old_parser_end = (
    "  } else {\n"
    "    d.textoEmbargo = '';\n"
    "  }\n"
    "  }catch(e){console.warn('Parser error:',e);}\n"
    "  return d;\n"
    "}"
)
new_parser_end = (
    "  } else {\n"
    "    d.textoEmbargo = '';\n"
    "  }\n"
    "\n"
    "  // Extraer texto del mandamiento: cubre \"de ejecución\" (Juz.3) y \"de intimación de pago\"\n"
    "  const mandRe = /l[ií]brese[^.\\n]{0,80}mandamiento\\s+de\\s+(?:ejecuci[oó]n|intimaci[oó]n)/i;\n"
    "  const mandIdx = txt.search(mandRe);\n"
    "  if(mandIdx !== -1){\n"
    "    const beforeMand = txt.slice(0, mandIdx);\n"
    "    const lastNL = beforeMand.lastIndexOf('\\n');\n"
    "    const paraStart = lastNL !== -1 ? lastNL + 1 : 0;\n"
    "    const mandTxtFull = txt.slice(paraStart);\n"
    "    // Stop before firma/judge line, not at first blank line (some juzgados have multi-párrafo)\n"
    "    const mandFinRe = /\\n[ \\t]*N[ \\t]*\\n|\\nFdo\\.|\\n[A-ZÁÉÍÓÚÑ]{4,}(?:[ \\t]+[A-ZÁÉÍÓÚÑ]+){1,}[ \\t]*\\n[ \\t]*JUEZ/;\n"
    "    const mMandEnd = mandTxtFull.search(mandFinRe);\n"
    "    const mandTxt = (mMandEnd !== -1 ? mandTxtFull.slice(0, mMandEnd) : mandTxtFull).trim();\n"
    "    const partesMand = [];\n"
    "    if(cabecera) partesMand.push(cabecera);\n"
    "    if(mandTxt)  partesMand.push(mandTxt);\n"
    "    if(firma)    partesMand.push('(Fdo. '+firma+')');\n"
    "    d.textoMandamiento = partesMand.join('\\n\\n');\n"
    "  } else {\n"
    "    d.textoMandamiento = '';\n"
    "  }\n"
    "  }catch(e){console.warn('Parser error:',e);}\n"
    "  return d;\n"
    "}"
)
if old_parser_end in content:
    content = content.replace(old_parser_end, new_parser_end, 1)
    print("OK: textoMandamiento extractor added in parsearProveido")
else:
    errors.append("ERROR: parsearProveido end block not found")

# ── 2. Update fillForm ────────────────────────────────────────────────────────
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
    print("OK: fillForm updated")
else:
    errors.append("ERROR: fillForm end block not found")

# ── 3. Update getForm() ───────────────────────────────────────────────────────
old_getform = "textoOriginal:raw.textoOriginal||'',textoEmbargo:raw.textoEmbargo||''};"
new_getform = "textoOriginal:raw.textoOriginal||'',textoEmbargo:raw.textoEmbargo||'',textoMandamiento:(document.getElementById('f-texto-mand')||{}).value||raw.textoMandamiento||''};"
if old_getform in content:
    content = content.replace(old_getform, new_getform, 1)
    print("OK: getForm() updated")
else:
    errors.append("ERROR: getForm end not found")

# ── 4. Add textarea in HTML form ──────────────────────────────────────────────
old_html = '        <div class="slbl">Documentos a generar</div>'
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
    print("OK: textarea added in HTML")
else:
    errors.append("ERROR: 'Documentos a generar' slbl not found")

# ── 5. Update buildMandamiento to use textoMandamiento ───────────────────────
# Find the resMand line in fisco (it's a single const, no jNum5 logic)
old_res = '  const resMand=`"San Nicolás, ${D.fechaProveido}.-'
# We need to find the full line and replace it
import re
pattern = r'(  const resMand=`"San Nicolás,.*?`;\n)'
m = re.search(pattern, content, re.DOTALL)
if m:
    old_full = m.group(1)
    new_full = (
        old_full.rstrip('\n').replace('  const resMand=', '  const resMandPlantilla=') + '\n'
        '  const resMand = D.textoMandamiento ? `"${D.textoMandamiento.trim()}".-` : resMandPlantilla;\n'
    )
    content = content.replace(old_full, new_full, 1)
    print("OK: buildMandamiento updated to use textoMandamiento")
else:
    errors.append("ERROR: resMand line in buildMandamiento not found")

if errors:
    for e in errors:
        print(e)
    import sys; sys.exit(1)

with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-fisco.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done — generador-fisco.html saved")
