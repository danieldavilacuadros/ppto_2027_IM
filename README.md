# Presupuesto 2027 · Incamotors

App web para llenar el presupuesto comercial 2027 por formatos, con permisos por línea, sede y marca.

## Trabajar en la PC
1. `npm ci`
2. Copiar `.env.example` como `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. `npm run dev`

## Publicar
Cada push a `main` publica en GitHub Pages con el workflow `.github/workflows/deploy.yml`.
Requiere en GitHub › Settings › Secrets and variables › Actions: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`,
y en Settings › Pages › Source: «GitHub Actions».

## Base de datos
Ejecutar en orden los archivos de `supabase/migrations/` en el SQL Editor del proyecto de Supabase.

## Histórico 2026
La tabla `historico` (migración 004) guarda el Estado de Resultados contable por sede, marca, cuenta y mes, en dólares.
Los datos **no van al repo** (es público): se cargan desde el SQL Editor. El ajuste `historico_2026` indica cuántos
meses hay cargados (divisor del promedio mensual). Carga actual: enero–agosto 2026; se recarga con el cierre a noviembre.
