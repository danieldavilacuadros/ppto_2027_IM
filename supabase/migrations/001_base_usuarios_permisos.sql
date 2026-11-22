-- 001 · Base: catálogos, perfiles, jefaturas comerciales y matriz de accesos con RLS
-- Se ejecuta una sola vez en Supabase › SQL Editor. No editar una vez aplicada: los cambios van en 002_, 003_…

-- ───────────────────────── Catálogos ─────────────────────────
create table public.sedes (
  codigo  text primary key,               -- AREQUIPA, CUSCO… (nombre completo)
  orden   int  not null default 0
);
insert into public.sedes (codigo, orden) values
  ('AREQUIPA',1),('CUSCO',2),('JULIACA',3),('ICA',4),('TRUJILLO',5),('PIURA',6);

create table public.marcas (
  nombre  text primary key,
  orden   int  not null default 0
);
insert into public.marcas (nombre, orden) values
  ('Hyundai',1),('Hyundai CV',2),('Geely',3),('BYD',4),('Volvo',5),('Ford',6),('Divemotor',7),('Maxus',8),
  ('BAIC',9),('Dongfeng',10),('Omoda',11),('Chery',12),('Chevrolet',13),('Isuzu',14),('Mitsubishi',15),('Fuso',16);

-- tipo: sm = sede × marca (con consolidados) · sede = solo por sede · global = un solo alcance
create table public.lineas (
  id              text primary key,
  nombre          text not null,
  formato         text not null,
  tipo            text not null check (tipo in ('sm','sede','global')),
  con_consolidado boolean not null default false,
  extras          jsonb not null default '[]'::jsonb,   -- alcances sin sede ni marca: [["corp","Canal Corporativo"]]
  orden           int not null default 0
);
insert into public.lineas (id, nombre, formato, tipo, con_consolidado, extras, orden) values
  ('unidades','Unidades','FU-001','sm',true,'[]',1),
  ('ife','IF&E','FU-001-A','sm',true,'[["corp","Canal Corporativo"]]',2),
  ('marketing','Marketing','FU-001-B','sm',false,'[["total","Marketing total"]]',3),
  ('posventa','Posventa','FU-002 · FU-002-A','sm',true,'[]',4),
  ('seminuevos','Seminuevos','FU-004-S','sede',false,'[]',5),
  ('corporativo','Canal Corporativo','FU-005-C','global',false,'[]',6),
  ('lubricantes','Lubricantes','FU-006-L','sede',false,'[]',7),
  ('empresa','Empresa','FU-003','global',false,'[]',8);

-- ───────────────────────── Perfiles ─────────────────────────
create table public.perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  nombre     text not null default '',
  cargo      text not null default '',
  rol        text not null default 'usuario' check (rol in ('administrador','subadministrador','usuario')),
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- Al invitar o registrar un usuario en Auth se crea su perfil solo
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'nombre',''))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- ───────────────────────── Jefaturas comerciales ─────────────────────────
-- Agrupan las marcas de un jefe dentro de una sede: son el miniconsolidado antes del consolidado de sede
create table public.jefaturas (
  id        uuid primary key default gen_random_uuid(),
  sede      text not null references public.sedes(codigo),
  nombre    text not null,
  jefe      uuid references public.perfiles(id) on delete set null,
  marcas    text[] not null default '{}',
  creado_en timestamptz not null default now(),
  unique (sede, nombre)
);

-- ───────────────────────── Accesos (matriz ve / edita) ─────────────────────────
-- alcance: nombre de marca · '*' consolidado de sede · '@<id de jefatura>' consolidado de jefatura · clave de extra
-- sede = '*' para alcances sin sede (extras y líneas globales)
create table public.accesos (
  id            bigint generated always as identity primary key,
  perfil_id     uuid not null references public.perfiles(id) on delete cascade,
  linea         text not null references public.lineas(id),
  sede          text not null default '*',
  alcance       text not null default '*',
  puede_editar  boolean not null default false,
  unique (perfil_id, linea, sede, alcance)
);
create index accesos_perfil_idx on public.accesos (perfil_id);

-- ───────────────────────── Funciones de permisos ─────────────────────────
create or replace function public.es_rol(roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles p where p.id = auth.uid() and p.activo and p.rol = any(roles));
$$;

create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_rol(array['administrador','subadministrador']);
$$;

create or replace function public.puede_ver(p_linea text, p_sede text, p_alcance text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_admin() or exists (
    select 1 from public.accesos a join public.perfiles p on p.id = a.perfil_id and p.activo
    where a.perfil_id = auth.uid() and a.linea = p_linea and a.sede = p_sede and a.alcance = p_alcance);
$$;

create or replace function public.puede_editar(p_linea text, p_sede text, p_alcance text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_admin() or exists (
    select 1 from public.accesos a join public.perfiles p on p.id = a.perfil_id and p.activo
    where a.perfil_id = auth.uid() and a.linea = p_linea and a.sede = p_sede and a.alcance = p_alcance and a.puede_editar);
$$;

-- ───────────────────────── RLS ─────────────────────────
alter table public.sedes     enable row level security;
alter table public.marcas    enable row level security;
alter table public.lineas    enable row level security;
alter table public.perfiles  enable row level security;
alter table public.jefaturas enable row level security;
alter table public.accesos   enable row level security;

-- Catálogos: los lee cualquier usuario con sesión; solo administración los cambia
create policy sedes_leer  on public.sedes  for select to authenticated using (true);
create policy sedes_admin on public.sedes  for all    to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy marcas_leer  on public.marcas for select to authenticated using (true);
create policy marcas_admin on public.marcas for all    to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy lineas_leer  on public.lineas for select to authenticated using (true);
create policy lineas_admin on public.lineas for all    to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- Perfiles: cada uno ve el suyo; administración ve todos.
-- La subadministradora no puede tocar administradores ni nombrar administradores.
create policy perfiles_leer on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));
create policy perfiles_editar_admin on public.perfiles for update to authenticated
  using ((select public.es_rol(array['administrador'])))
  with check ((select public.es_rol(array['administrador'])));
create policy perfiles_editar_subadmin on public.perfiles for update to authenticated
  using ((select public.es_rol(array['subadministrador'])) and rol <> 'administrador')
  with check ((select public.es_rol(array['subadministrador'])) and rol <> 'administrador');

-- Jefaturas: las leen todos los usuarios con sesión (para armar sus hojas); solo administración las cambia
create policy jefaturas_leer  on public.jefaturas for select to authenticated using (true);
create policy jefaturas_admin on public.jefaturas for all    to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- Accesos: cada uno ve los suyos; administración ve y cambia todos
create policy accesos_leer  on public.accesos for select to authenticated
  using (perfil_id = (select auth.uid()) or (select public.es_admin()));
create policy accesos_admin on public.accesos for all to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

-- Permisos de tabla (por si la exposición automática de tablas está desactivada)
grant usage on schema public to authenticated;
grant select on public.sedes, public.marcas, public.lineas, public.jefaturas to authenticated;
grant select, update on public.perfiles to authenticated;
grant insert, update, delete on public.sedes, public.marcas, public.lineas, public.jefaturas to authenticated;
grant select, insert, update, delete on public.accesos to authenticated;
grant execute on function public.es_rol(text[]), public.es_admin(),
  public.puede_ver(text,text,text), public.puede_editar(text,text,text) to authenticated;
revoke all on all tables in schema public from anon;

-- Primer administrador: después de invitarte en Authentication › Users, corre a mano (no se guarda en el repo):
--   update public.perfiles set rol = 'administrador', nombre = '…' where email = '…';
