-- 008 · Lubricantes (FU-006-L) en 2027 es una sola hoja nacional: sede '*', alcance 'total'.
-- La línea pasa a tipo «global» con la hoja «Lubricantes nacional» como casilla de permisos.

update public.lineas
   set tipo = 'global', extras = '[["total","Lubricantes nacional"]]'::jsonb
 where id = 'lubricantes';

select id, tipo, extras from public.lineas where id = 'lubricantes';
