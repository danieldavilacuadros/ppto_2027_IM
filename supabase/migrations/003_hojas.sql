-- 003 · Hojas de llenado de los formatos (FU-001, FU-001-A, FU-001-B…) y ajustes generales

-- Una fila por hoja: formato + hoja + sede + alcance (marca, '*' consolidado, 'corp', 'total') + año.
-- datos = { P: supuestos, M: valores mes a mes (13 posiciones: 12 meses + histórico) }
create table public.hojas (
  id               bigint generated always as identity primary key,
  formato          text not null,
  linea            text not null references public.lineas(id),
  hoja             text not null,
  sede             text not null default '*',
  alcance          text not null default '*',
  anio             int  not null default 2027,
  datos            jsonb not null default '{}'::jsonb,
  actualizado_en   timestamptz not null default now(),
  actualizado_por  uuid default auth.uid(),
  unique (formato, hoja, sede, alcance, anio)
);

create or replace function public.marcar_actualizacion()
returns trigger language plpgsql as $$
begin
  new.actualizado_en := now();
  new.actualizado_por := auth.uid();
  return new;
end $$;
create trigger hojas_actualizacion before update on public.hojas
  for each row execute function public.marcar_actualizacion();

alter table public.hojas enable row level security;
-- Ve la hoja quien tiene «ve» o «edita» en esa línea, sede y alcance; la llena solo quien tiene «edita»
create policy hojas_leer on public.hojas for select to authenticated
  using (public.puede_ver(linea, sede, alcance));
create policy hojas_crear on public.hojas for insert to authenticated
  with check (public.puede_editar(linea, sede, alcance));
create policy hojas_editar on public.hojas for update to authenticated
  using (public.puede_editar(linea, sede, alcance))
  with check (public.puede_editar(linea, sede, alcance));
create policy hojas_borrar on public.hojas for delete to authenticated
  using ((select public.es_admin()));
grant select, insert, update, delete on public.hojas to authenticated;

-- Ajustes generales (por ejemplo, el check IF&E: integrado / independiente)
create table public.ajustes (
  clave  text primary key,
  valor  jsonb not null
);
insert into public.ajustes (clave, valor) values ('ife_modo', '"integrado"');
alter table public.ajustes enable row level security;
create policy ajustes_leer  on public.ajustes for select to authenticated using (true);
create policy ajustes_admin on public.ajustes for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));
grant select, insert, update, delete on public.ajustes to authenticated;
