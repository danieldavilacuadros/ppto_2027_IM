-- 007 · Rol «gerente» (gerente general): ve todas las hojas e históricos en modo de solo lectura y la pestaña Resumen.
-- No edita nada: puede_editar sigue igual (solo administración y la matriz de accesos).

alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check
  check (rol in ('administrador','subadministrador','gerente','usuario'));

create or replace function public.puede_ver(p_linea text, p_sede text, p_alcance text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_rol(array['administrador','subadministrador','gerente']) or exists (
    select 1 from public.accesos a join public.perfiles p on p.id = a.perfil_id and p.activo
    where a.perfil_id = auth.uid() and a.linea = p_linea and a.sede = p_sede and a.alcance = p_alcance);
$$;
