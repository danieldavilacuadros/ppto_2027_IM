# Presupuesto 2027 · Incamotors (ppto_2027_IM)

Sistema de llenado del presupuesto comercial 2027 por formatos (FU-001, FU-001-A, FU-001-B…), con usuarios,
jefaturas comerciales y una matriz de permisos ve / edita por línea, sede y marca.

## Arquitectura
- **Frontend:** React 18 + Vite + TypeScript, HashRouter y `base: './'`. Habla directo con Supabase con
  `@supabase/supabase-js` 2. No hay servidor propio.
- **Base de datos, usuarios y seguridad:** Supabase (Postgres + Auth + RLS), región São Paulo (sa-east-1).
  Proyecto propio de este sistema. **El proyecto `pci-incamotors` no se toca por ningún motivo.**
- **Publicación:** GitHub Pages con GitHub Actions en cada push a `main`
  (https://danieldavilacuadros.github.io/ppto_2027_IM/). El repositorio es **público**: solo código, nunca datos ni claves.

## Claves
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Publishable key, pública por diseño) en `.env.local`
  (no se sube) y en GitHub › Settings › Secrets and variables › Actions.
- La secret / service_role key **nunca** va en el frontend.

## Base de datos
- Cambios de esquema = archivo nuevo numerado en `supabase/migrations/` (001_, 002_…), ejecutado en el SQL Editor.
  Los ya aplicados no se editan.
- RLS en todas las tablas. Permisos con `es_rol()`, `es_admin()`, `puede_ver()` y `puede_editar()`
  (security definer), evaluados una vez por consulta: `(select es_admin())`.
- `accesos.alcance`: nombre de marca · `*` consolidado de sede · `@<id jefatura>` consolidado de jefatura ·
  clave de extra (`corp`, `total`). `sede = '*'` para alcances sin sede.
- Supabase devuelve máximo 1000 filas por consulta: paginar con `.range()`.

## Reglas
- Responder siempre en español de Perú, sin voseo.
- Para la web (GitHub, Supabase) usar Chrome (sesiones de Daniel).
- Avisar antes de cada push y antes de crear o pausar proyectos. No borrar datos ni proyectos.
- Sin datos personales en el repositorio (correos y nombres de usuarios van solo en la base).

## Referencia
Definición de formatos y del esquema: página «Esquema de Presupuestos» (artifact) y los Excel de ejemplo en
OneDrive `CLaude 2026\PPTO SIS LLENADo`.
