-- 005 · Total línea IF&E: nuevo alcance «total» en la línea IF&E, para poder darlo en Permisos.
-- (Administración lo ve siempre; los demás solo si se les marca en la matriz.)
update public.lineas
   set extras = '[["corp","Canal Corporativo"],["total","Total línea IF&E"]]'::jsonb
 where id = 'ife';
