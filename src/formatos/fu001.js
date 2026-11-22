// Motor de FU-001 (Unidades), copiado de la página validada contra el Excel v3. No editar los cálculos sin volver a validar.
/* eslint-disable */
export const XL={ // valores del Excel v3 (CUSCO · Hyundai)
  P:{ticket:16251,margen:0.06,cortes:-0.0015,fleteCli:8/1.18,fleteMarca:0,fleteCompra:0,interplaza:-0.0003,bonosPct:0.025,
     placaV:110/1.18,placaC:-95/1.18,ventasVend:18,sueldos:0,comPct:-0.14,incPct:-0.16,factorLab:0.4,equipoHC:-55,
     clicker:-0.01,lavado:-10,repLocal:-15,agua:-125,seguridad:-880,limpieza:-440,repNC:-0.01,recPDI:0.008,
     mant:-(19/3.4*8)-(320*2/12),comb:-(500/3.4),segTD:-100,tasa:0.08,sobre:0.15,stockF:1.5},
  M:{units:120,td:5,viajes:-1354,IF:30000,gpsP:15254.2372881356,mokP:7118.64406779661,glpP:8644.06779661017,accP:22320,
     gpsN:-10830.50847457627,mokN:-3559.322033898305,glpN:-8135.593220338984,accN:-16740,mktG:-25000,recM:12250}
};
export function computeCol(P,m,ife){ // m = valores de un mes (o del histórico)
  const r={}; const u=m.units;
  r.u=u; r.venta=P.ticket*u; r.mb1=r.venta*P.margen; r.costo=r.mb1-r.venta;
  r.cort=P.cortes*r.venta;
  r.fc=P.fleteCli*u; r.fm=P.fleteMarca*r.venta; r.fcomp=P.fleteCompra*r.venta; r.fint=P.interplaza*r.venta;
  r.flet=r.fc+r.fm+r.fcomp+r.fint; r.mb2=r.mb1+r.cort+r.flet;
  const k=ife?1:0;
  r.IF=k*m.IF;
  r.gpsP=k*m.gpsP; r.mokP=k*m.mokP; r.glpP=k*m.glpP; r.accP=k*m.accP; r.eqp=r.gpsP+r.mokP+r.glpP+r.accP;
  r.gpsN=k*m.gpsN; r.mokN=k*m.mokN; r.glpN=k*m.glpN; r.accN=k*m.accN; r.eqn=r.gpsN+r.mokN+r.glpN+r.accN;
  r.equip=r.eqp+r.eqn;
  r.bonos=-P.bonosPct*r.costo;
  r.plv=P.placaV*u; r.plc=P.placaC*u; r.placas=r.plv+r.plc;
  r.mb3=r.mb2+r.IF+r.equip+r.bonos+r.placas;
  r.hc=P.ventasVend?u/P.ventasVend:0; r.sueldos=P.sueldos; r.com=P.comPct*r.mb2; r.inc=P.incPct*(r.IF+r.equip);
  r.lab=(r.sueldos+r.com+r.inc)*P.factorLab; r.eqs=P.equipoHC*r.hc;
  r.personal=r.sueldos+r.com+r.inc+r.lab+r.eqs;
  r.mktG=m.mktG; r.recM=m.recM; r.clk=P.clicker*r.venta; r.mkt=r.mktG+r.recM+r.clk;
  r.lav=P.lavado*u; r.repl=P.repLocal*u; r.agua=P.agua; r.segu=P.seguridad; r.limp=P.limpieza;
  r.tienda=r.lav+r.repl+r.agua+r.segu+r.limp;
  r.rnc=P.repNC*r.venta; r.rpdi=P.recPDI*r.venta; r.pdi=r.rnc+r.rpdi;
  r.tdu=m.td; r.mant=P.mant*m.td; r.comb=P.comb*m.td; r.sgs=P.segTD*m.td; r.tdg=r.mant+r.comb+r.sgs;
  r.int=-P.tasa/12*u*P.stockF*P.ticket*P.sobre; r.fin=r.int;
  r.via=m.viajes; r.repr=r.via;
  r.gop=r.personal+r.mkt+r.tienda+r.pdi+r.tdg+r.fin+r.repr;
  r.mc=r.mb3+r.gop;
  return r;
}

// [id, rubro, tipo, fila Excel, supuesto, extra]
export const FILAS=[
    ['','Volumen','sec'],
    ['u','Número de unidades','in',8,null,{m:'units',int:1}],
    ['venta','Venta unidades','c',10,{k:'ticket',f:'num',e:1,note:'Ticket medio sin equipamiento'}],
    ['costo','Costo unidades','c',11],
    ['mb1','MB 1 · Teórico','s',13,{k:'margen',f:'pct',e:1,note:'Margen teórico'}],
    ['mb1','','p'],
    ['','Margen bruto','sec'],
    ['cort','Cortesías','c',16,{k:'cortes',f:'pct',e:1,note:'Factor por marca y sede, sobre la venta'}],
    ['flet','Fletes, cobro a marca y a cliente','g',17],
    ['fc','(+) Flete cobrado al cliente','c',18,{k:'fleteCli',f:'num',e:0,note:'Monto por unidad fijado por la empresa; puede subir, no bajar'},{ind:1}],
    ['fm','(+) Flete cobrado a la marca','c',19,{k:'fleteMarca',f:'pct',e:1,note:'% de la venta que paga la marca'},{ind:1}],
    ['fcomp','(−) Flete de compra de la unidad','c',20,{k:'fleteCompra',f:'pct',e:1,note:'Guiarse del histórico 2026'},{ind:1}],
    ['fint','(−) Flete interplaza','c',21,{k:'interplaza',f:'pct',e:1,note:'Guiarse del histórico 2026'},{ind:1}],
    ['mb2','MB 2 · Con gastos','s',23],
    ['mb2','','p'],
    ['IF','Intermediación financiera','c',26,null,{src:'FU-001-A',ife:1}],
    ['equip','Equipamiento vehicular','g',27,null,{ife:1}],
    ['eqp','(+) GPS, MOK, GLP y accesorios','c',28,null,{ind:1,ife:1}],
    ['gpsP','GPS','c',29,null,{ind:2,src:'FU-001-A',ife:1}],
    ['mokP','MOK','c',30,null,{ind:2,src:'FU-001-A',ife:1}],
    ['glpP','GLP','c',31,null,{ind:2,src:'FU-001-A',ife:1}],
    ['accP','Accesorios','c',32,null,{ind:2,src:'FU-001-A',ife:1}],
    ['eqn','(−) Costo de GPS, MOK, GLP y accesorios','c',33,null,{ind:1,ife:1}],
    ['gpsN','GPS','c',34,null,{ind:2,src:'FU-001-A',ife:1}],
    ['mokN','MOK','c',35,null,{ind:2,src:'FU-001-A',ife:1}],
    ['glpN','GLP','c',36,null,{ind:2,src:'FU-001-A',ife:1}],
    ['accN','Accesorios','c',37,null,{ind:2,src:'FU-001-A',ife:1}],
    ['bonos','Bonos de marca','c',38,{k:'bonosPct',f:'pct',e:1,note:'Factor por marca y sede, sobre el costo del vehículo'}],
    ['placas','Inmatriculación y placas','g',39],
    ['plv','(+) Venta por placa','c',40,{k:'placaV',f:'num',e:0,note:'Monto fijo por unidad'},{ind:1}],
    ['plc','(−) Costo por placa','c',41,{k:'placaC',f:'num',e:0,note:'Monto fijo por unidad'},{ind:1}],
    ['mb3','MB 3 · Con gastos y otros ingresos','s',43],
    ['mb3','','p'],
    ['','Gastos de operación','sec'],
    ['personal','Cargas del personal','g',46],
    ['hc','Headcount (vendedores)','c',47,{k:'ventasVend',f:'num',e:1,note:'Ventas por vendedor (KPI)'},{ind:1,dec:2}],
    ['sueldos','Sueldos básicos','c',48,{k:'sueldos',f:'num',e:0,note:'Esquema cero básico: todo es comisión'},{ind:1}],
    ['com','Comisiones de unidades','c',49,{k:'comPct',f:'pct',e:1,note:'Comisiones + KPIs sobre MB 2 (promedio 2026)'},{ind:1}],
    ['inc','Comisiones e incentivos F&I y equipamiento','c',50,{k:'incPct',f:'pct',e:1,note:'Sobre intermediación + equipamiento'},{ind:1,ife:1}],
    ['lab','Costo laboral','c',51,{k:'factorLab',f:'pct',e:1,note:'Factor empresa sobre sueldo + comisiones'},{ind:1}],
    ['eqs','Laptops, equipos, licencias y celular','c',52,{k:'equipoHC',f:'num',e:0,note:'Monto fijo por vendedor'},{ind:1}],
    ['mkt','Marketing','g',54],
    ['mktG','(−) Gastos de marketing','c',55,null,{ind:1,src:'FU-001-B'}],
    ['recM','(+) Recobro de marca','c',56,null,{ind:1,src:'FU-001-B'}],
    ['clk','(−) Canal digital · Clicker','c',57,{k:'clicker',f:'pct',e:1,note:'Factor empresa 2026, sobre la venta'},{ind:1}],
    ['tienda','Gestión de tienda','g',59],
    ['lav','Lavado de showroom','c',60,{k:'lavado',f:'num',e:1,note:'Por unidad, si es tercero'},{ind:1}],
    ['repl','Reparación y mantenimiento de local','c',61,{k:'repLocal',f:'num',e:1,note:'Bolsa por unidad'},{ind:1}],
    ['agua','Agua, insumos y útiles','c',62,{k:'agua',f:'num',e:1,note:'Monto mensual; varía por tamaño de local'},{ind:1}],
    ['segu','Personal de seguridad','c',63,{k:'seguridad',f:'num',e:1,note:'Monto mensual, si es de terceros'},{ind:1}],
    ['limp','Personal de limpieza general','c',64,{k:'limpieza',f:'num',e:1,note:'Monto mensual, si es de terceros'},{ind:1}],
    ['pdi','PDI','g',66],
    ['rnc','(−) Reparación y no conformidades','c',67,{k:'repNC',f:'pct',e:1,note:'Pulidos y arreglos, sobre la venta'},{ind:1}],
    ['rpdi','(+) Recobro a marca','c',68,{k:'recPDI',f:'pct',e:1,note:'Si la marca apoya las reparaciones'},{ind:1}],
    ['tdg','Gestión de test drives','g',70],
    ['tdu','Unidades de test drive','in',71,null,{m:'td',ind:1,int:1}],
    ['mant','Mantenimiento y lavado','c',72,{k:'mant',f:'num',e:1,note:'Por unidad de test drive al mes'},{ind:1}],
    ['comb','Combustible','c',73,{k:'comb',f:'num',e:1,note:'Por unidad de test drive al mes'},{ind:1}],
    ['sgs','Seguro, SOAT y GPS','c',74,{k:'segTD',f:'num',e:1,note:'Por unidad de test drive al mes'},{ind:1}],
    ['fin','Gastos financieros','g',76],
    ['int','Interés por stock de más de 90 días','c',77,{k:'tasa',f:'pct',e:1,note:'Tasa anual'},{ind:1}],
    ['','Vehículos en sobrestadía','po',78,{k:'sobre',f:'pct',e:1,note:'% del stock'},{ind:1}],
    ['','Stock promedio (veces la venta)','po',79,{k:'stockF',f:'num1',e:1,note:'Factor de stock'},{ind:1}],
    ['repr','Gastos de representación','g',80],
    ['via','Viajes (solo de marcas)','in',81,null,{m:'viajes',ind:1}],
    ['gop','Gastos de operación','s',84,null,{cls:'gop'}],
    ['gop','','p'],
    ['mc','Margen de Contribución','s',87,null,{cls:'mc'}],
    ['mc','','p']
  ];
