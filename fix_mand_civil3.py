with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Old extraction block
old = (
    "  // Extraer párrafo del mandamiento: la resolución real que lo ordena\n"
    "  const mandRe = /l[ií]brese[^.]{0,80}mandamiento\\s+de\\s+intimaci[oó]n\\s+de\\s+pago/i;\n"
    "  const mandIdx = txt.search(mandRe);\n"
    "  if(mandIdx !== -1){\n"
    "    const beforeMand = txt.slice(0, mandIdx);\n"
    "    const lastNL = beforeMand.lastIndexOf('\\n');\n"
    "    const paraStart = lastNL !== -1 ? lastNL + 1 : 0;\n"
    "    const mandTxtFull = txt.slice(paraStart);\n"
    "    const mMandEnd = mandTxtFull.search(/\\n\\s*\\n/);\n"
    "    const mandTxt = (mMandEnd !== -1 ? mandTxtFull.slice(0, mMandEnd) : mandTxtFull).trim();\n"
    "    const partesMand = [];\n"
    "    if(cabecera) partesMand.push(cabecera);\n"
    "    if(mandTxt)  partesMand.push(mandTxt);\n"
    "    if(firma)    partesMand.push('(Fdo. '+firma+')');\n"
    "    d.textoMandamiento = partesMand.join('\\n\\n');\n"
    "  } else {\n"
    "    d.textoMandamiento = '';\n"
    "  }"
)

# New: regex covers both "ejecución" (Civil 3) and "intimación" (other juzgados)
# End detection: stops before judge name/firma section, not at first blank line
new = (
    "  // Extraer texto del mandamiento: cubre \"de ejecución\" (Juz.3) y \"de intimación de pago\"\n"
    "  const mandRe = /l[ií]brese[^.\\n]{0,80}mandamiento\\s+de\\s+(?:ejecuci[oó]n|intimaci[oó]n)/i;\n"
    "  const mandIdx = txt.search(mandRe);\n"
    "  if(mandIdx !== -1){\n"
    "    const beforeMand = txt.slice(0, mandIdx);\n"
    "    const lastNL = beforeMand.lastIndexOf('\\n');\n"
    "    const paraStart = lastNL !== -1 ? lastNL + 1 : 0;\n"
    "    const mandTxtFull = txt.slice(paraStart);\n"
    "    // Stop before firma/judge line, not at first blank line (Civil 3 has multi-párrafo)\n"
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
    "  }"
)

if old in content:
    content = content.replace(old, new, 1)
    print("OK: mandamiento extractor updated (Civil 3 + multi-párrafo)")
else:
    print("ERROR: old block not found")
    idx = content.find("Extraer párrafo del mandamiento")
    if idx != -1:
        print(repr(content[idx:idx+600]))
    import sys; sys.exit(1)

with open(r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
