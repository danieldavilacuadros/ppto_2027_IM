import type { ReactNode } from 'react'

/** Manual del jefe comercial: cómo entrar, llenar FU-001 y entender de dónde sale cada número. */

const SECCIONES = [
  ['empezar', 'En 4 pasos'],
  ['entrar', 'Cómo entrar'],
  ['pantalla', 'La pantalla'],
  ['llenar', 'Llenar FU-001'],
  ['datos', 'De dónde llega cada dato'],
  ['calculo', 'Cómo calcula FU-001'],
  ['ife', 'Financiamiento y equipamiento'],
  ['historico', 'El histórico 2026'],
  ['ayuda', '¿Algo no sale?'],
  ['glosario', 'Glosario y checklist'],
] as const

const ir = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function Seccion({ id, n, titulo, children }: { id: string; n: number; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="ay-sec card">
      <h2><span className="ay-num">{n}</span>{titulo}</h2>
      {children}
    </section>
  )
}
const Tip = ({ children }: { children: ReactNode }) => <p className="ay-nota tip"><b>Tip</b><span>{children}</span></p>
const Ojo = ({ children }: { children: ReactNode }) => <p className="ay-nota ojo"><b>Ojo</b><span>{children}</span></p>

export default function Ayuda() {
  return (
    <div className="ayuda stack">
      <header className="ay-hero">
        <div>
          <p className="eyebrow">Manual del jefe comercial · Presupuesto 2027</p>
          <h1>¡Hola! Así armas tu presupuesto 2027</h1>
          <p>Tranquilo: tu hoja ya viene casi lista. Tú revisas, ajustas lo amarillo y el sistema hace las cuentas por ti. Todo se guarda solo.</p>
        </div>
        <nav className="ay-indice" aria-label="Secciones del manual">
          {SECCIONES.map(([id, t], i) => <button key={id} type="button" onClick={() => ir(id)}><span>{i + 1}</span>{t}</button>)}
        </nav>
      </header>

      <Seccion id="empezar" n={1} titulo="Tu presupuesto en 4 pasos">
        <div className="ay-pasos">
          <div><b>1</b><h3>Entra</h3><p>Con tu correo y la contraseña que te dio administración; luego cámbiala.</p></div>
          <div><b>2</b><h3>Elige tu marca</h3><p><i>Formatos → FU-001 · Unidades</i>, tu sede y tu marca.</p></div>
          <div><b>3</b><h3>Ajusta lo amarillo</h3><p>Unidades, ticket y supuestos. Lo demás se calcula solo.</p></div>
          <div><b>4</b><h3>Compara y listo</h3><p>Mira el histórico 2026, confirma que diga <i>Guardado</i> y pasa a la siguiente marca.</p></div>
        </div>
        <table className="tbl ay-tbl">
          <thead><tr><th>Formato</th><th>Qué es</th><th>Tú</th></tr></thead>
          <tbody>
            <tr><td><b>FU-001 · Unidades</b></td><td>Venta de autos de tu marca, mes a mes, hasta el Margen de Contribución</td><td><span className="tg e">llenas</span></td></tr>
            <tr><td>FU-001-A · IF&amp;E</td><td>Créditos, seguros, fondos, GPS, MOK, GLP y accesorios</td><td><span className="tg v">solo ves</span> lo prepara F&amp;I</td></tr>
            <tr><td>FU-001-B · Marketing</td><td>Gasto de marketing y lo que devuelve la marca</td><td><span className="tg v">solo ves</span> lo prepara Marketing</td></tr>
            <tr><td>Histórico 2026</td><td>Lo que realmente pasó de enero a agosto 2026, según contabilidad</td><td><span className="tg v">solo ves</span> para comparar</td></tr>
          </tbody>
        </table>
        <p className="ay-regla"><b>La regla de oro:</b> solo se escribe en las celdas <span className="ay-amarillo">amarillas</span>. Si un número blanco no te cuadra, se corrige en la celda amarilla que lo alimenta.</p>
        <p>Si además eres <b>jefe de sede</b> (Cusco, Juliaca, Ica, Trujillo o Piura), también ves las marcas de los otros jefes de tu sede. La hoja del consolidado de la sede se habilitará más adelante.</p>
        <Tip>Todo el presupuesto está en <b>dólares (US$), sin IGV</b>.</Tip>
      </Seccion>

      <Seccion id="entrar" n={2} titulo="Cómo entrar">
        <ol className="ay-lista">
          <li>Abre <b>danieldavilacuadros.github.io/ppto_2027_IM</b> en <b>Chrome</b> o Edge, mejor en computadora: la tabla es ancha.</li>
          <li>Deja marcado <b>Con contraseña</b>, escribe tu <b>correo de la empresa</b> y la <b>contraseña inicial</b> que te envió administración. Pulsa <i>Entrar</i>.</li>
          <li>La primera vez, la app te pide <b>crear tu propia contraseña</b> antes de seguir: escríbela dos veces y pulsa <i>Guardar mi nueva contraseña</i> (mínimo 8 caracteres). Si luego quieres cambiarla otra vez, haz clic en <b>tu nombre</b>, arriba a la derecha.</li>
          <li>Llegas a <b>Inicio</b>: te saluda y te muestra tus jefaturas y qué líneas <b>llenas</b> o <b>solo ves</b>.</li>
        </ol>
        <div className="ay-dos">
          <Ojo><i>“Invalid login credentials”</i>: el correo o la contraseña no coinciden. Revisa mayúsculas y que no haya espacios al copiarla.</Ojo>
          <Ojo>¿Olvidaste tu contraseña? Avisa a administración y te asigna una nueva. <i>“Tu usuario no tiene perfil”</i> o <i>“Usuario desactivado”</i>: también avisa.</Ojo>
        </div>
        <Tip>Tu sesión queda abierta en ese navegador. En una computadora compartida, sal siempre con el botón <b>Salir</b> de arriba a la derecha.</Tip>
      </Seccion>

      <Seccion id="pantalla" n={3} titulo="Conoce la pantalla">
        <p>Todo pasa en <b>Formatos</b>. De arriba hacia abajo:</p>
        <ol className="ay-lista">
          <li><b>Formato:</b> <i>FU-001 · Unidades</i>, <i>FU-001-A · IF&amp;E</i> y <i>FU-001-B · Marketing</i>. Tú trabajas en FU-001.</li>
          <li><b>Sede</b> y <b>Marca:</b> solo aparecen las tuyas. Cada sede + marca es una hoja distinta.</li>
          <li><b>Check IF&amp;E:</b> lo define administración. Hoy está en <i>Integrado</i>: el financiamiento y el equipamiento suman en tu hoja.</li>
          <li><b>Indicadores:</b> total 2027 de unidades, venta, MB 3, gastos y Margen de Contribución.</li>
          <li><b>Estado de guardado</b> y de dónde llegan los datos enlazados.</li>
          <li><b>Ver:</b> <i>Totales</i> para el resumen, <i>Todas las filas</i> para llenar.</li>
        </ol>
        <div className="ay-dos">
          <table className="tbl ay-tbl">
            <thead><tr><th>Columna</th><th>Qué tiene</th></tr></thead>
            <tbody>
              <tr><td>Rubro</td><td>Nombre de la fila. El número gris es su fila en el Excel; debajo, una ayuda.</td></tr>
              <tr><td>Supuesto</td><td>Un valor para todo el año. Amarillo = lo cambias; <i>fijo</i> = lo define la empresa.</td></tr>
              <tr><td>Ene … Dic</td><td>Los 12 meses de 2027.</td></tr>
              <tr><td>2027</td><td>La suma del año.</td></tr>
              <tr><td>Histórico 2026</td><td>Promedio mensual real de enero a agosto 2026.</td></tr>
            </tbody>
          </table>
          <table className="tbl ay-tbl ay-colores">
            <thead><tr><th>Se ve así</th><th>Significa</th></tr></thead>
            <tbody>
              <tr><td><span className="ay-m amarillo">123</span></td><td>La llenas tú</td></tr>
              <tr><td><span className="ay-m sec">VOLUMEN</span></td><td>Inicio de una sección</td></tr>
              <tr><td><span className="ay-m grp">Fletes</span></td><td>Grupo: suma lo sangrado debajo</td></tr>
              <tr><td><span className="ay-m sub">MB 1</span></td><td>Un margen: resultado hasta ahí</td></tr>
              <tr><td><span className="ay-m gop">Gastos</span></td><td>Total de gastos de operación</td></tr>
              <tr><td><span className="ay-m mc">MC</span></td><td>Margen de Contribución, el resultado final</td></tr>
              <tr><td><span className="src">FU-001-A</span></td><td>Llega de otro formato, no se escribe aquí</td></tr>
              <tr><td>(1,200)</td><td>Gasto o costo: resta</td></tr>
            </tbody>
          </table>
        </div>
        <p><b>Estados de guardado:</b> <span className="ay-est ok">Guardado</span> todo bien · <span className="ay-est">Guardando…</span> espera un segundo · <span className="ay-est err">No se pudo guardar</span> revisa tu internet y vuelve a escribir · <span className="ay-est">Solo lectura</span> puedes ver, no editar.</p>
      </Seccion>

      <Seccion id="llenar" n={4} titulo="Llena tu hoja FU-001, paso a paso">
        <p>Tu hoja <b>ya viene precargada</b> con unidades y ticket sugeridos, y con el financiamiento y equipamiento. Tú revisas y ajustas, <b>una marca a la vez</b>.</p>
        <ol className="ay-lista">
          <li>Entra a <b>Formatos → FU-001 · Unidades</b> y elige tu <b>sede</b> y tu <b>marca</b>.</li>
          <li>Mira la nota sobre la tabla: debe decir <i>IF&amp;E llega de FU-001-A</i>. Si dice <i>valores de ejemplo</i>, esa parte aún no se carga: puedes avanzar igual.</li>
          <li><b>Unidades (fila 8):</b> revisa las 12 cajitas. Para cambiar una, haz clic, escribe el número <b>entero</b> y pulsa <b>Enter</b>. Sin comas ni puntos de miles.</li>
          <li><b>Ticket (fila 10, columna Supuesto):</b> precio promedio de la unidad, <b>en US$, sin IGV ni accesorios</b>.</li>
          <li><b>Supuestos amarillos:</b> margen teórico, cortesías, fletes, bonos, comisiones, lavado, local, PDI, test drive e intereses.</li>
          <li><b>Unidades de test drive (fila 71)</b> y <b>Viajes (fila 81):</b> mes a mes.</li>
          <li>Compara con el <b>Histórico 2026</b> y los indicadores. Si algo se ve muy distinto, revisa el supuesto que lo alimenta.</li>
          <li>Confirma <span className="ay-est ok">Guardado</span> y pasa a la siguiente marca.</li>
        </ol>
        <div className="ay-dos">
          <Tip>Los <b>porcentajes</b> se escriben sin el símbolo: para 6 % escribe <b>6</b>; para −0.15 % escribe <b>-0.15</b>.</Tip>
          <Ojo>Los <b>gastos</b> van en <b>negativo</b>: escribe −125, no 125.</Ojo>
        </div>
        <div className="ay-ejemplo">
          <b>Ejemplo · Arequipa · Hyundai</b>
          <p>Enero viene con <b>263 unidades</b> y ticket <b>16,159</b> → venta 263 × 16,159 = <b>4,249,817</b>. Si lo cambias a <b>270</b>, la venta pasa a <b>4,362,930</b> y se mueven solos el costo, los márgenes, las comisiones, el financiamiento y el Margen de Contribución.</p>
        </div>
        <p><b>Lo que NO se escribe en FU-001</b> (aunque lo veas): intermediación, GPS, MOK, GLP y accesorios (vienen de FU-001-A); gasto y recobro de marketing (vienen de FU-001-B); y lo marcado <i>fijo</i>: flete al cliente, venta y costo de placa, sueldos básicos y equipos por vendedor.</p>
      </Seccion>

      <Seccion id="datos" n={5} titulo="De dónde llega cada dato">
        <p>Tú solo escribes en FU-001. Todo lo demás llega solo y se recalcula <b>al instante</b>.</p>
        <Diagrama />
        <ul className="ay-lista">
          <li><b>Precarga 2027:</b> administración dejó tus unidades y tu ticket sugeridos. Los puedes ajustar.</li>
          <li><b>FU-001-A · IF&amp;E:</b> toma tus unidades y tu ticket, les aplica las penetraciones de F&amp;I y devuelve intermediación y equipamiento a tus filas 26 a 37.</li>
          <li><b>FU-001-B · Marketing:</b> el gasto y el recobro de tu marca llegan a las filas 55 y 56. Mientras no se carguen, verás valores de ejemplo.</li>
          <li><b>Histórico 2026:</b> sale del Estado de Resultados contable y llena la última columna.</li>
          <li><b>Consolidado de la sede:</b> sumará las hojas de todas las marcas de tu sede (en preparación).</li>
        </ul>
      </Seccion>

      <Seccion id="calculo" n={6} titulo="Cómo calcula FU-001">
        <p>Cada mes sube en cuatro escalones: <span className="ay-esc">MB 1</span> → <span className="ay-esc">MB 2</span> → <span className="ay-esc">MB 3</span> → <span className="ay-esc mc">Margen de Contribución</span>. El ejemplo es un mes con <b>120 unidades</b> y ticket <b>16,251</b>. Abre cada escalón para ver el detalle.</p>
        <details className="ay-det" open>
          <summary>Volumen y MB 1 · margen teórico</summary>
          <Tabla filas={[
            ['8 Unidades', 'Lo escribes tú', '120'],
            ['10 Venta', 'Unidades × ticket', '120 × 16,251 = 1,950,120'],
            ['13 MB 1', 'Venta × % de margen teórico', '1,950,120 × 6 % = 117,007'],
            ['11 Costo', 'MB 1 − venta', '(1,833,113)'],
          ]} />
        </details>
        <details className="ay-det">
          <summary>MB 2 · con cortesías y fletes</summary>
          <Tabla filas={[
            ['16 Cortesías', 'Venta × % de cortesías', '1,950,120 × −0.15 % = (2,925)'],
            ['18 Flete cobrado al cliente', 'Unidades × monto fijo', '120 × 6.78 = 814'],
            ['19 Flete cobrado a la marca', 'Venta × % que paga la marca', '0'],
            ['20 Flete de compra', 'Venta × %', '0'],
            ['21 Flete interplaza', 'Venta × %', '1,950,120 × −0.03 % = (585)'],
            ['23 MB 2', 'MB 1 + cortesías + fletes', '117,007 − 2,925 + 229 = 114,311'],
          ]} />
        </details>
        <details className="ay-det">
          <summary>MB 3 · con financiamiento, equipamiento, bonos y placas</summary>
          <Tabla filas={[
            ['26 Intermediación financiera', 'Llega de FU-001-A (paso 7)', '30,000'],
            ['27 Equipamiento', 'Llega de FU-001-A: venta menos costo de GPS, MOK, GLP y accesorios', '14,072'],
            ['38 Bonos de marca', 'Costo × % de bonos (en positivo)', '1,833,113 × 2.5 % = 45,828'],
            ['40 y 41 Placas', 'Unidades × venta por placa − unidades × costo por placa', '11,186 − 9,661 = 1,525'],
            ['43 MB 3', 'MB 2 + intermediación + equipamiento + bonos + placas', '205,735'],
          ]} />
        </details>
        <details className="ay-det">
          <summary>Gastos de operación y Margen de Contribución</summary>
          <Tabla filas={[
            ['47 Headcount', 'Unidades ÷ ventas por vendedor', '120 ÷ 18 = 6.67'],
            ['49 Comisiones de unidades', 'MB 2 × % de comisión', '114,311 × −14 % = (16,003)'],
            ['50 Comisiones F&I y equipamiento', '(Intermediación + equipamiento) × %', '44,072 × −16 % = (7,051)'],
            ['51 Costo laboral', '(Sueldos + comisiones) × 40 %', '(9,222)'],
            ['52 Equipos y celular', 'Headcount × monto fijo', '6.67 × −55 = (367)'],
            ['55 y 56 Marketing', 'Llegan de FU-001-B: gasto y recobro', '(25,000) + 12,250'],
            ['57 Canal digital · Clicker', 'Venta × %', '1,950,120 × −1 % = (19,501)'],
            ['60 a 64 Gestión de tienda', 'Lavado y local por unidad; agua, seguridad y limpieza por mes', '(4,445)'],
            ['67 y 68 PDI', 'Venta × % de reparaciones, menos lo que recobra la marca', '(19,501) + 15,601 = (3,900)'],
            ['72 a 74 Test drive', 'Unidades de test drive × monto por unidad', '5 × (98 + 147 + 100) = (1,725)'],
            ['77 Interés por stock', 'Tasa ÷ 12 × unidades × stock (veces la venta) × ticket × % en sobrestadía', '(2,925)'],
            ['81 Viajes', 'Lo escribes tú, mes a mes', '(1,354)'],
            ['84 Gastos de operación', 'Suma de todos los gastos', '(79,245)'],
            ['87 Margen de Contribución', 'MB 3 + gastos de operación', '205,735 − 79,245 = 126,491'],
          ]} />
        </details>
        <Tip>Debajo de cada margen, la fila en cursiva muestra el <b>% sobre la venta</b>. En el ejemplo, el MC es <b>6.5 %</b>.</Tip>
      </Seccion>

      <Seccion id="ife" n={7} titulo="Financiamiento y equipamiento (IF&E)">
        <p>IF&amp;E se calcula en <b>FU-001-A</b> con <b>tus unidades y tu ticket de FU-001</b>, y vuelve a tu hoja en las filas 26 y 27. Así que <b>si cambias tus unidades, tu IF&amp;E cambia solo</b>. Las penetraciones las define F&amp;I.</p>
        <div className="ay-formula">N° de productos = unidades × penetración <small>(redondeado cada mes)</small> → N° × ganancia por producto</div>
        <table className="tbl ay-tbl">
          <thead><tr><th>Producto</th><th>Ganancia por cada uno (US$ sin IGV)</th><th>Arequipa · Hyundai, enero<br /><small>263 unidades · ticket 16,159</small></th></tr></thead>
          <tbody>
            <tr><td><b>Créditos</b></td><td>Ticket × 80 % financiado × 1.5 % = 193.91</td><td>17.7 % → 47 × 193.91 = <b>9,114</b></td></tr>
            <tr><td><b>Seguros</b></td><td>Prima neta (3.5 % del ticket) × 18 % = 101.80</td><td>9.9 % → 26 × 101.80 = <b>2,647</b></td></tr>
            <tr><td><b>Fondos colectivos</b></td><td>Ticket × 90 % financiado × 0.9 % = 130.89</td><td>1.2 % → 3 × 130.89 = <b>393</b></td></tr>
            <tr><td><b>GPS</b></td><td>Venta 300 / 1.18 − costo 213 / 1.18 = 73.73</td><td>37.3 % → 98 × 73.73 = <b>7,226</b></td></tr>
            <tr><td><b>MOK</b></td><td>Venta 140 / 1.18 − costo 70 / 1.18 = 59.32</td><td>25.5 % → 67 × 59.32 = <b>3,975</b></td></tr>
            <tr><td><b>GLP</b></td><td>50 / 1.18 = 42.37 · solo Hyundai y Geely, al 5 %</td><td>5 % → 13 × 42.37 = <b>551</b></td></tr>
            <tr><td><b>Accesorios</b></td><td>US$ por unidad × unidades; margen de 20 %</td><td>189 × 263 = 49,707 → margen <b>9,941</b></td></tr>
          </tbody>
        </table>
        <p>En tu hoja: <b>Intermediación (fila 26)</b> = créditos + seguros + fondos. <b>Equipamiento (fila 27)</b> = venta menos costo de GPS, MOK, GLP y accesorios. Tus vendedores ganan una comisión sobre ambas (fila 50).</p>
        <Tip>Con el check en <i>Integrado</i> (como hoy) todo suma en tu MB 3. Si pasa a <i>Independiente</i>, IF&amp;E se reporta aparte.</Tip>
      </Seccion>

      <Seccion id="historico" n={8} titulo="El histórico 2026, tu mejor referencia">
        <p>La última columna es lo que tu marca <b>realmente hizo en promedio cada mes</b> de enero a agosto 2026, según contabilidad. Si 2027 se aleja mucho, que haya una razón.</p>
        <div className="ay-ejemplo">
          <b>Ejemplo · Arequipa · Hyundai</b>
          <p>En 2026 vendió <b>190 unidades al mes</b>; enero 2027 viene con <b>263</b>: <b>+38 %</b>. Está bien si tienes con qué sostenerlo: stock, campañas y vendedores.</p>
        </div>
        <div className="ay-dos">
          <div>
            <h3>Qué mirar primero</h3>
            <ul className="ay-lista">
              <li><b>Unidades:</b> ¿el crecimiento es realista?</li>
              <li><b>% de MB 1 y MB 3:</b> un margen muy superior al real infla el resultado.</li>
              <li><b>Bonos, fletes y cortesías:</b> guíate del histórico.</li>
              <li><b>Gastos de operación:</b> que no queden muy por debajo de lo real sin razón.</li>
            </ul>
          </div>
          <div>
            <h3>Qué no comparar (no es error tuyo)</h3>
            <ul className="ay-lista">
              <li><b>Headcount y test drives:</b> salen con “–”, contabilidad no los registra.</li>
              <li><b>Intermediación y equipamiento:</b> “–” hasta cargar el histórico de F&amp;I.</li>
              <li><b>Alquileres, impuestos, seguros, honorarios y luz:</b> van al consolidado de la sede.</li>
              <li><b>Limpieza:</b> viene junto con seguridad, en la fila de seguridad.</li>
              <li><b>Marcas nuevas</b> (Maxus, BAIC, Chevrolet, Isuzu) o sin ventas en tu sede en 2026: no tienen histórico.</li>
            </ul>
          </div>
        </div>
        <Ojo>El histórico se <b>actualiza el 15 de diciembre</b> con el cierre a noviembre; ese día los números pueden moverse un poco.</Ojo>
      </Seccion>

      <Seccion id="ayuda" n={9} titulo="¿Algo no sale? Aquí la solución">
        <table className="tbl ay-tbl">
          <thead><tr><th>Me pasa esto</th><th>Haz esto</th></tr></thead>
          <tbody>
            <tr><td>No aparece una de mis marcas o sedes</td><td>Los permisos los asigna administración: avisa qué sede y marca te faltan.</td></tr>
            <tr><td>Las celdas no son amarillas</td><td>Esa hoja es <i>Solo lectura</i> para ti, o el dato llega de otro formato. Revisa el mensaje sobre la tabla.</td></tr>
            <tr><td>Escribí un número y volvió al anterior</td><td>Pulsa <b>Enter</b> o haz clic fuera. Si sale <i>No se pudo guardar</i>, revisa tu internet y vuelve a escribirlo.</td></tr>
            <tr><td>Un porcentaje salió gigante</td><td>Escríbelo sin el símbolo: para 6 % escribe <b>6</b>, no 0.06 ni 600.</td></tr>
            <tr><td>Un gasto sumó en vez de restar</td><td>Los gastos van en <b>negativo</b>.</td></tr>
            <tr><td>La página quedó en blanco o con datos raros</td><td>Recarga con <b>Ctrl + Shift + R</b>. Si sigue, avisa a administración.</td></tr>
            <tr><td>La intermediación dice <i>valores de ejemplo</i></td><td>Aún no se carga IF&amp;E de esa marca. Puedes avanzar; avisa a F&amp;I.</td></tr>
            <tr><td>No estoy de acuerdo con las penetraciones</td><td>No las cambias tú: conversa con F&amp;I, que ajusta FU-001-A.</td></tr>
            <tr><td>¿Unidades con decimales?</td><td>No: las unidades son <b>enteras</b>.</td></tr>
            <tr><td>¿Dólares o soles?</td><td>Todo en <b>dólares, sin IGV</b>.</td></tr>
            <tr><td>Borré algo por error</td><td>Vuelve a escribir el valor; el histórico te da una referencia. Administración puede ayudarte.</td></tr>
            <tr><td>Entro desde otra computadora</td><td>Funciona igual: tus datos están en el sistema, no en tu equipo.</td></tr>
          </tbody>
        </table>
        <Tip>¿Otra duda? Escribe a <b>Daniel Dávila</b> (administración del presupuesto) con la <b>sede</b>, la <b>marca</b> y una captura de pantalla.</Tip>
      </Seccion>

      <Seccion id="glosario" n={10} titulo="Glosario y checklist final">
        <div className="ay-glosario">
          {([
            ['Ticket', 'Precio promedio de venta de una unidad, sin IGV y sin accesorios'],
            ['MB 1 · Margen teórico', 'Lo que deja la unidad antes de cualquier gasto: venta menos costo'],
            ['MB 2', 'MB 1 menos cortesías y fletes'],
            ['MB 3', 'MB 2 más financiamiento, equipamiento, bonos de marca y placas'],
            ['Gastos de operación', 'Personal, marketing, tienda, PDI, test drive, intereses y viajes'],
            ['Margen de Contribución', 'MB 3 menos gastos: lo que la marca aporta a la sede'],
            ['IF&E', 'Intermediación financiera (créditos, seguros, fondos) y equipamiento (GPS, MOK, GLP, accesorios)'],
            ['Penetración', 'De cada 100 unidades vendidas, cuántas llevan ese producto'],
            ['PDI', 'Preparación antes de entregar: pulidos, reparaciones y no conformidades'],
            ['Bonos de marca', 'Dinero que la marca devuelve por descuentos o por cumplir metas'],
            ['Recobro de marca', 'Parte del gasto de marketing o PDI que paga la marca'],
            ['Sobrestadía', 'Unidades más de 90 días en stock, que generan intereses'],
            ['Histórico 2026', 'Promedio mensual real de enero a agosto 2026, según contabilidad'],
            ['Check IF&E', 'Integrado: suma en la hoja de la marca. Independiente: se reporta aparte'],
          ] as const).map(([t, d]) => <div key={t}><b>{t}</b><span>{d}</span></div>)}
        </div>
        <h3 className="ay-check-t">Antes de dar por terminada cada marca</h3>
        <ul className="ay-check">
          <li>Las unidades de los 12 meses son las que puedes vender, en enteros</li>
          <li>El ticket está en dólares, sin IGV ni accesorios</li>
          <li>Los supuestos amarillos se parecen al histórico, o tienen una razón para cambiar</li>
          <li>Los gastos están en negativo</li>
          <li>Llenaste test drive y viajes mes a mes</li>
          <li>La nota dice <i>IF&amp;E llega de FU-001-A</i></li>
          <li>El Margen de Contribución 2027 tiene sentido frente al histórico</li>
          <li>El estado dice <i>Guardado</i></li>
        </ul>
        <p className="ay-fin">¡Listo! Gracias por tu tiempo: con tu hoja armamos el presupuesto 2027 de toda la empresa.</p>
      </Seccion>
    </div>
  )
}

function Tabla({ filas }: { filas: [string, string, string][] }) {
  return (
    <table className="tbl ay-tbl">
      <thead><tr><th>Fila</th><th>Cómo se calcula</th><th>Ejemplo</th></tr></thead>
      <tbody>{filas.map(([a, b, c]) => <tr key={a}><td><b>{a}</b></td><td>{b}</td><td className="mono-n">{c}</td></tr>)}</tbody>
    </table>
  )
}

/** Diagrama: de dónde llega cada dato de FU-001. */
function Diagrama() {
  const caja = (cx: number, cy: number, w: number, t: string, s: string, main = false) => (
    <g>
      <rect x={cx - w / 2} y={cy - 28} width={w} height={56} rx={10} fill={main ? 'var(--ay-sub)' : 'var(--card)'} stroke={main ? 'var(--oro)' : 'var(--gris-2)'} strokeWidth={main ? 2 : 1.25} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontWeight={600} fontSize={13} fill="var(--ink)">{t}</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize={11.5} fill="var(--muted)">{s}</text>
    </g>
  )
  const lbl = (x: number, y: number, t: string, end = false) => <text x={x} y={y} fontSize={11.5} fill="var(--oro-texto)" textAnchor={end ? 'end' : 'start'}>{t}</text>
  return (
    <svg className="ay-diagrama" viewBox="0 0 760 540" role="img" aria-label="Tú llenas FU-001; lo demás llega solo">
      <defs><marker id="ay-flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--grafito-muted)" /></marker></defs>
      <text x={24} y={30} fontSize={15} fontWeight={700} fill="var(--ink)">Tú llenas FU-001; lo demás llega solo</text>
      <g fill="none" stroke="var(--grafito-muted)" strokeWidth={1.4}>
        <path d="M150 108V200H238" markerEnd="url(#ay-flecha)" />
        <path d="M610 108V200H522" markerEnd="url(#ay-flecha)" />
        <path d="M300 228V314" markerEnd="url(#ay-flecha)" />
        <path d="M250 316V230" markerEnd="url(#ay-flecha)" />
        <path d="M480 316V230" markerEnd="url(#ay-flecha)" />
        <path d="M380 228V458" markerEnd="url(#ay-flecha)" />
      </g>
      {caja(150, 80, 200, 'Precarga 2027', 'administración')}
      {caja(610, 80, 200, 'Histórico contable 2026', 'contabilidad, enero a agosto')}
      {caja(380, 200, 280, 'FU-001 · tu hoja (sede × marca)', 'llenas: unidades, ticket y supuestos', true)}
      {caja(200, 344, 240, 'FU-001-A · IF&E', 'penetraciones de F&I')}
      {caja(560, 344, 240, 'FU-001-B · Marketing', 'gasto y recobro de la marca')}
      {caja(380, 488, 240, 'Consolidado de la sede', 'en preparación')}
      {lbl(158, 150, 'unidades y ticket')}
      {lbl(602, 150, 'columna Histórico 2026', true)}
      {lbl(308, 266, 'unidades')}
      {lbl(308, 282, 'y ticket')}
      {lbl(242, 276, 'IF&E, filas 26 a 37', true)}
      {lbl(488, 276, 'marketing, filas 55 y 56')}
      {lbl(388, 420, 'tu resultado')}
    </svg>
  )
}
