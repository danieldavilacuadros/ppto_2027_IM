const FORMATOS = [
  ['FU-001', 'Unidades · sede × marca', 'Validado'],
  ['FU-001-A', 'IF&E · marca, sede y Corporativo', 'Validado'],
  ['FU-001-B', 'Marketing · sede × marca y total', 'Validado'],
  ['FU-002', 'Posventa', 'Falta Excel'],
  ['FU-002-A', 'Posventa por subnegocio', 'Falta Excel'],
  ['FU-004-S', 'Seminuevos', 'Falta Excel'],
  ['FU-005-C', 'Canal Corporativo', 'Falta Excel'],
  ['FU-006-L', 'Lubricantes', 'Falta Excel'],
  ['FU-003', 'Empresa', 'Falta Excel'],
]

/** Por ahora, lista de formatos. Las hojas de llenado se agregan en la siguiente etapa. */
export default function Formatos() {
  return (
    <section className="stack">
      <div>
        <h1>Formatos</h1>
        <p className="muted">Las hojas de llenado se habilitan formato por formato. Cada usuario verá solo las sedes, marcas y consolidados que tiene asignados.</p>
      </div>
      <div className="grid-cards">
        {FORMATOS.map(([c, n, e]) => (
          <div className="card" key={c}>
            <div className="eyebrow">{c}</div>
            <h3>{n}</h3>
            <span className={'tg ' + (e === 'Validado' ? 'v' : '')}>{e === 'Validado' ? 'Formato validado · hoja en construcción' : e}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
