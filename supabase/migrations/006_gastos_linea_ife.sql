-- 006 · Gastos de línea IF&E (nacional): nuevo alcance «linea» en la línea IF&E, para poder darlo en Permisos.
-- La hoja guarda su tabla de personal en datos.T (cargos, fijos y variables): solo la ven quienes tengan este alcance
-- y administración. Las tablas de personal de cada sede van en la hoja de esa sede y las ve quien ve esa hoja.
update public.lineas
   set extras = '[["corp","Canal Corporativo"],["linea","Gastos de línea (nacional)"],["total","Total línea IF&E"]]'::jsonb
 where id = 'ife';
