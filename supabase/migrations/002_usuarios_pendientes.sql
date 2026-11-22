-- 002 · Usuarios pendientes: administración crea perfiles sin enviar correo.
-- Cuando la persona acepta su invitación (o entra por primera vez), su cuenta de Auth se enlaza sola
-- con el perfil que tenga el mismo correo, con su jefatura y permisos ya cargados.

-- El perfil ya no exige una cuenta de Auth existente
alter table public.perfiles drop constraint if exists perfiles_id_fkey;
alter table public.perfiles alter column id set default gen_random_uuid();
create unique index if not exists perfiles_email_lower_idx on public.perfiles (lower(email));

-- Si el id del perfil cambia al enlazarse, jefaturas y accesos lo siguen
alter table public.jefaturas drop constraint if exists jefaturas_jefe_fkey;
alter table public.jefaturas add constraint jefaturas_jefe_fkey
  foreign key (jefe) references public.perfiles(id) on update cascade on delete set null;
alter table public.accesos drop constraint if exists accesos_perfil_id_fkey;
alter table public.accesos add constraint accesos_perfil_id_fkey
  foreign key (perfil_id) references public.perfiles(id) on update cascade on delete cascade;

-- Al crear la cuenta en Auth: si ya hay un perfil con ese correo, se enlaza; si no, se crea uno nuevo
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.perfiles where lower(email) = lower(coalesce(new.email, ''))) then
    update public.perfiles set id = new.id
    where lower(email) = lower(new.email) and id <> new.id;
  else
    insert into public.perfiles (id, email, nombre)
    values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'nombre', ''))
    on conflict (id) do nothing;
  end if;
  return new;
end $$;

-- Estado de la cuenta de cada perfil (solo administración): sin invitar · invitado · activo
create or replace function public.estado_cuentas()
returns table (perfil_id uuid, estado text, ultimo_ingreso timestamptz)
language sql stable security definer set search_path = public, auth as $$
  select p.id,
         case when u.id is null then 'sin_invitar'
              when u.email_confirmed_at is null then 'invitado'
              else 'activo' end,
         u.last_sign_in_at
  from public.perfiles p
  left join auth.users u on u.id = p.id
  where public.es_admin();
$$;
grant execute on function public.estado_cuentas() to authenticated;

-- Administración crea perfiles; solo el administrador crea administradores
create policy perfiles_crear on public.perfiles for insert to authenticated
  with check ((select public.es_admin()) and (rol <> 'administrador' or (select public.es_rol(array['administrador']))));
-- Solo el administrador borra perfiles
create policy perfiles_borrar on public.perfiles for delete to authenticated
  using ((select public.es_rol(array['administrador'])));
grant insert, delete on public.perfiles to authenticated;
