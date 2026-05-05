import re

with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Add textoMandamiento extraction in parsearProveido ──────────────────────
# Insert after the textoEmbargo block ends (before }catch(e){...)
old_embargo_end = (
    "  } else {\r\n"
    "    d.textoEmbargo = '';\r\n"
    "  }\r\n"
    "  }catch(e){console.warn('Parser error:',e);}\r\n"
    "  return d;\r\n"
    "}"
)

new_embargo_end = (
    "  } else {\r\n"
    "    d.textoEmbargo = '';\r\n"
    "  }\r\n"
    "\r\n"
    "  // Extraer párrafo del mandamiento: la resolución real que lo ordena\r\n"
    "  const mandRe = /l[ií]brese[^.]{0,80}mandamiento\\s+de\\s+intimaci[oó]n\\s+de\\s+pago/i;\r\n"
    "  const mandIdx = txt.search(mandRe);\r\n"
    "  if(mandIdx !== -1){\r\n"
    "    const beforeMand = txt.slice(0, mandIdx);\r\n"
    "    const lastNL = beforeMand.lastIndexOf('\\n');\r\n"
    "    const paraStart = lastNL !== -1 ? lastNL + 1 : 0;\r\n"
    "    const mandTxtFull = txt.slice(paraStart);\r\n"
    "    const mMandEnd = mandTxtFull.search(/\\n\\s*\\n/);\r\n"
    "    const mandTxt = (mMandEnd !== -1 ? mandTxtFull.slice(0, mMandEnd) : mandTxtFull).trim();\r\n"
    "    const partesMand = [];\r\n"
    "    if(cabecera) partesMand.push(cabecera);\r\n"
    "    if(mandTxt)  partesMand.push(mandTxt);\r\n"
    "    if(firma)    partesMand.push('(Fdo. '+firma+')');\r\n"
    "    d.textoMandamiento = partesMand.join('\\n\\n');\r\n"
    "  } else {\r\n"
    "    d.textoMandamiento = '';\r\n"
    "  }\r\n"
    "  }catch(e){console.warn('Parser error:',e);}\r\n"
    "  return d;\r\n"
    "}"
)

if old_embargo_end in content:
    content = content.replace(old_embargo_end, new_embargo_end, 1)
    print("OK: textoMandamiento extractor added in parsearProveido")
else:
    # Try with LF only
    old_lf = old_embargo_end.replace('\r\n', '\n')
    new_lf  = new_embargo_end.replace('\r\n', '\n')
    if old_lf in content:
        content = content.replace(old_lf, new_lf, 1)
        print("OK (LF): textoMandamiento extractor added in parsearProveido")
    else:
        print("ERROR: could not find textoEmbargo end block - check manually")
        # Print context
        idx = content.find("d.textoEmbargo = '';")
        if idx != -1:
            print(repr(content[idx-10:idx+200]))
        import sys; sys.exit(1)

# ── 2. Update resMand in buildMandamiento to use textoMandamiento ──────────────
old_res = (
    "  const jNum5 = parseInt(D.juzgadoNum) === 5;\r\n"
    "  const resMand = (jNum5 && D.textoOriginal) ? `\"${D.textoOriginal.trim()}\".-` : resMandPlantilla;"
)
new_res = (
    "  const jNum5 = parseInt(D.juzgadoNum) === 5;\r\n"
    "  const resMand = (jNum5 && D.textoOriginal) ? `\"${D.textoOriginal.trim()}\".-` : (D.textoMandamiento ? `\"${D.textoMandamiento.trim()}\".-` : resMandPlantilla);"
)

if old_res in content:
    content = content.replace(old_res, new_res, 1)
    print("OK: resMand updated to use textoMandamiento")
else:
    old_lf = old_res.replace('\r\n', '\n')
    new_lf  = new_res.replace('\r\n', '\n')
    if old_lf in content:
        content = content.replace(old_lf, new_lf, 1)
        print("OK (LF): resMand updated to use textoMandamiento")
    else:
        print("ERROR: could not find resMand line")
        idx = content.find("const resMand =")
        if idx != -1:
            print(repr(content[idx-20:idx+300]))
        import sys; sys.exit(1)

with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done - generador-municipalidad.html saved")
