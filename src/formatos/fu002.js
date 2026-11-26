// Motor de FU-002 (Posventa): una hoja por sede y subnegocio (Repuestos, Taller sin PyP, PyP).
// Base: «PPTO PV 2027 rev4», hoja PPTO TOT (26-nov-2026), reordenada como los demás formatos:
// pasos vehiculares → facturación → MB 1 → bonos → MB 3 → gastos directos → MC → gastos indirectos → resultado operativo neto.
// Montos en US$ (soles ÷ TC 3.4) y repartidos en 12 meses iguales; gastos y costo en negativo.
/* eslint-disable */

// [id, rubro, grupo o bloque, fila del Excel original, nota]
export const IN002=[
  ['pasos','Pasos vehiculares','vol',3,'Solo en Taller'],
  ['fact','Facturación (ventas netas)','fact',8],
  ['costo','(−) Costo de ventas','costo',9,'En negativo'],
  ['bonos','(+) Bonos de marca','bonos',12],
  ['sueldos','Sueldos','pers',16],['salarios','Salarios','pers',17],['cts','CTS','pers',18],
  ['remVac','Rem. eventuales · vacaciones no gozadas y servicios extraordinarios','pers',19],
  ['remCap','Rem. eventuales · atención y capacitación','pers',20],['comis','Comisiones (rem. eventuales)','pers',47],
  ['servV','Servicios varios','serv',24],['placas','Trámite de placas e inscripción en RRPP','serv',25],['lavado','Lavado de unidades','serv',26],
  ['comExito','Comisión de éxito en venta de unidades','serv',27],['alin','Alineamiento y balanceo','serv',28],['placRot','Placas rotativas','serv',29],
  ['honor','Honorarios de asesores y otros','hon',21],['provCob','Provisión de cobranza dudosa','hon',22],['provVar','Provisiones varias','hon',23],
  ['telCel','Teléfono celular','tienda',30],['segV','Seguros varios','tienda',31],['segViaje','Seguro de término de viaje','tienda',32],
  ['utiles','Útiles de escritorio','tienda',33],['sumi','Suministros diversos','tienda',34],['gasPdi','Gasolina · PDI y administración','tienda',35],
  ['gasMkt','Gasolina · activaciones de marketing','tienda',36],['gasLub','Gasolina · lubricantes','tienda',37],['gasTd','Gasolina · test drive','tienda',38],
  ['gasPv','Gasolina · posventa','tienda',39],
  ['alq','Alquileres','alqG',40],
  ['publi','Publicidad','mkt',41],
  ['gBanc','Gastos bancarios','fin',42],['interes','Intereses de préstamos','fin',43],
  ['impLeg','Impuestos y gastos legales directos','imp',44],
  ['viajes','Gastos de viaje','repr',48],['gasViaje','Gasolina · viajes de administración','repr',49],['repres','Gastos de representación','repr',50],
  ['noSust','Gastos varios no sustentados','repr',51],
  ['depr','Depreciación','ind',58],['rmant','Reparación y mantenimiento','ind',59],['limpV','Limpieza y vigilancia','ind',60],['telFijo','Teléfono fijo','ind',61],
  ['inet','Internet','ind',62],['servAdm','Servicios administrativos','ind',63],['elec','Electricidad','ind',64],['agua','Agua','ind',65],['cable','Cable','ind',66],
  ['desval','Provisión por desvalorización de existencias','ind',67]];
const GRUPOS=[['pers','Cargas del personal'],['serv','Servicios de taller y unidades'],['hon','Honorarios y provisiones'],['tienda','Gestión de tienda'],
  ['alqG','Alquileres'],['mkt','Marketing'],['fin','Gastos financieros'],['imp','Impuestos y gastos legales'],['repr','Representación y viajes']];

/** Hoja vacía (los valores reales se precargan por sede y subnegocio en la base) */
export const X002={P:{tc:3.4},M:Object.fromEntries(IN002.map(([k])=>[k,Array(13).fill(0)]))};

function linea(m){
  const r={}; IN002.forEach(([k])=>r[k]=Number(m[k])||0);
  const g=(dest)=>IN002.filter(x=>x[2]===dest).reduce((a,[k])=>a+r[k],0);
  r.tk=r.pasos?r.fact/r.pasos:0;
  r.mb1=r.fact+r.costo; r.mb3=r.mb1+r.bonos;
  GRUPOS.forEach(([gid])=>r[gid]=g(gid));
  r.gdir=GRUPOS.reduce((a,[gid])=>a+r[gid],0);
  r.mc=r.mb3+r.gdir; r.ind=g('ind'); r.ron=r.mc+r.ind;
  return r;
}
/** [12 meses, año, histórico] */
export function compute002(st){
  const col=i=>{const m={}; for(const k in st.M) m[k]=st.M[k]&&st.M[k][i]; return linea(m);};
  const months=Array.from({length:12},(_,i)=>col(i));
  const yr={}; for(const k in months[0]) yr[k]=months.reduce((a,r)=>a+(Number(r[k])||0),0);
  yr.tk=yr.pasos?yr.fact/yr.pasos:0;
  const hayH=Object.values(st.M).some(a=>a&&Number(a[12]));
  return [...months,yr,hayH?col(12):{}];
}
export function rows002(){
  const inp=(dest,ind)=>IN002.filter(x=>x[2]===dest).map(([k,lab,,x,note])=>[k,lab,'in',x,null,Object.assign({m:k},ind?{ind:1}:{},note?{note}:{})]);
  const grp=(gid,lab)=>[[gid,lab,'g'],...inp(gid,1)];
  return [
    ['','Volumen','sec'],
    ...inp('vol'),
    ['tk','Facturación por paso vehicular','c',null,null,{ind:1}],
    ['','Margen bruto','sec'],
    ...inp('fact'),...inp('costo'),
    ['mb1','MB 1 · Transacción','s',null],['mb1','% sobre la facturación','p'],
    ...inp('bonos'),
    ['mb3','MB 3 · Margen bruto total','s',14],['mb3','% sobre la facturación','p'],
    ['','Gastos directos de la línea','sec'],
    ...GRUPOS.flatMap(([gid,lab])=>grp(gid,lab)),
    ['gdir','Gastos directos de la línea','s',54,null,{cls:'gop'}],
    ['mc','Margen de contribución','s',56,null,{cls:'mc'}],['mc','% sobre la facturación','p'],
    ['','Gastos indirectos','sec'],
    ...grp('ind','Gastos indirectos'),
    ['ron','Resultado operativo neto','s',70,null,{cls:'mc'}],['ron','% sobre la facturación','p']];
}
