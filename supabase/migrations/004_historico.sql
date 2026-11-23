-- 004 · Histórico 2026 (Estado de Resultados contable), base de la columna «Histórico 2026» de los formatos
--
-- Una fila por cuenta y mes. «cuenta» es el id de la fila del formato (u, venta, costo, bonos…) o un rubro
-- que no va a la hoja de la marca: 'SEDE:<cuenta>' (va al consolidado por sede).
-- Los datos NO se versionan en el repo (es público): se cargan desde el SQL Editor.
create table public.historico (
  id          bigint generated always as identity primary key,
  formato     text not null default 'FU-001',
  linea       text not null references public.lineas(id),
  sede        text not null,
  alcance     text not null,               -- marca de la hoja
  cuenta      text not null,
  anio        int  not null default 2026,
  mes         int  not null check (mes between 1 and 12),
  monto       numeric(16,2) not null,      -- dólares
  fuente      text,
  cargado_en  timestamptz not null default now(),
  unique (formato, sede, alcance, cuenta, anio, mes)
);
create index historico_hoja on public.historico (formato, sede, alcance, anio);

alter table public.historico enable row level security;
-- Lo ve quien ve la hoja de esa marca o el consolidado de la sede; solo administración lo carga
create policy historico_leer on public.historico for select to authenticated
  using (public.puede_ver(linea, sede, alcance) or public.puede_ver(linea, sede, '*'));
create policy historico_admin on public.historico for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
grant select, insert, update, delete on public.historico to authenticated;

-- Meses cargados (divisor del promedio mensual) y fuente; se actualiza en cada recarga
insert into public.ajustes (clave, valor) values
  ('historico_2026', '{"meses": 8, "corte": "2026-08", "fuente": "ER por líneas de negocio, agosto 2026"}')
on conflict (clave) do nothing;
