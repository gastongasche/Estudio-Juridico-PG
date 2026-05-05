files = [
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-municipalidad.html',
    r'c:\Users\GG\OneDrive\Escritorio\GENERADOR 2\generador-fisco.html',
]

OLD_CSPARA = (
    "const csPara=D.cuentasSueldo?"
    "para([run('Hágasele saber que las cuentas permanecerán embargadas hasta que se acredite y transfiera el monto total cautelado; y que deberá abstenerse de ejecutar la presente medida en el caso de que los depósitos correspondan a '),run('\"Cuentas Sueldo\"',{bold:true}),run('. Las sumas retenidas deberán ser transferidas a la cuenta judicial de autos '),run('MONEDA PESOS N° '+(D.nroCuenta||'[COMPLETAR]')+' – CBU: '+(D.cbu||'[COMPLETAR]')+' – CUIT PODER JUDICIAL: 30-70721665-0',{bold:true}),run('.-')]):"
    "para([run('Las sumas retenidas deberán ser transferidas a la cuenta judicial de autos '),run('MONEDA PESOS N° '+(D.nroCuenta||'[COMPLETAR]')+' – CBU: '+(D.cbu||'[COMPLETAR]')+' – CUIT PODER JUDICIAL: 30-70721665-0',{bold:true}),run('.-')]);"
)

NEW_CSPARA = (
    # Juzgado 6 — no cuenta judicial: sumas quedan retenidas hasta orden del juez
    "const jNum6=parseInt(D.juzgadoNum)===6;"
    "const csPara=jNum6?"
      "(D.cuentasSueldo?"
        "para([run('Las referidas entidades, que deberán abstenerse de ejecutar la presente medida en el caso de que los depósitos correspondan a '),run('\"Cuentas Sueldo\"',{bold:true}),run('.- Dichas sumas deberán retenerse hasta que el Juzgado disponga sobre el destino de las mismas.')]):"
        "para([run('Dichas sumas deberán retenerse hasta que el Juzgado disponga sobre el destino de las mismas.')])):"
    # All other juzgados — existing cuenta judicial logic
      "D.cuentasSueldo?"
        "para([run('Hágasele saber que las cuentas permanecerán embargadas hasta que se acredite y transfiera el monto total cautelado; y que deberá abstenerse de ejecutar la presente medida en el caso de que los depósitos correspondan a '),run('\"Cuentas Sueldo\"',{bold:true}),run('. Las sumas retenidas deberán ser transferidas a la cuenta judicial de autos '),run('MONEDA PESOS N° '+(D.nroCuenta||'[COMPLETAR]')+' – CBU: '+(D.cbu||'[COMPLETAR]')+' – CUIT PODER JUDICIAL: 30-70721665-0',{bold:true}),run('.-')]):"
        "para([run('Las sumas retenidas deberán ser transferidas a la cuenta judicial de autos '),run('MONEDA PESOS N° '+(D.nroCuenta||'[COMPLETAR]')+' – CBU: '+(D.cbu||'[COMPLETAR]')+' – CUIT PODER JUDICIAL: 30-70721665-0',{bold:true}),run('.-')]);"
)

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if OLD_CSPARA in content:
        content = content.replace(OLD_CSPARA, NEW_CSPARA, 1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'OK: {path}')
    else:
        print(f'ERROR: old csPara not found in {path}')
        # show context
        idx = content.find('const csPara=')
        if idx != -1:
            print(repr(content[idx:idx+200]))
