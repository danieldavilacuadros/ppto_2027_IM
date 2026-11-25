// Motor de FU-001-B (Marketing), validado contra el Excel en 448 celdas. No editar los cálculos sin volver a validar.
/* eslint-disable */
import { costoPlan } from './personal.js';
export const XB={ // valores del Excel FU-001-B (CUSCO · Hyundai; total = suma de ejemplo)
 marca:{P:{},M:{gas:[-25000.0,-22000.0,-24000.0,-26000.0,-25000.0,-23000.0,-27000.0,-28000.0,-25000.0,-26000.0,-30000.0,-32000.0,-24000.0],rec:[12250.0,11000.0,12000.0,13000.0,12500.0,11500.0,13500.0,14000.0,12500.0,13000.0,15000.0,16000.0,11500.0],kit:Array(13).fill(0)}},
 total:{T:[],P:{tc:3.4,hc:3.0,sueldo:-882.352941176,bono:0.1,lab:0.4,equipo:-55.0,agencias:-1500.0,software:-400.0,otros:-100.0,mob:-50.0,agua:-40.0},M:{viajes:[-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0,-300.0],atenc:[-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0]},S:{gas:[-175000.0,-154000.0,-168000.0,-182000.0,-175000.0,-161000.0,-189000.0,-196000.0,-175000.0,-182000.0,-210000.0,-224000.0,-168000.0],rec:[85750.0,77000.0,84000.0,91000.0,87500.0,80500.0,94500.0,98000.0,87500.0,91000.0,105000.0,112000.0,80500.0],kit:Array(13).fill(0)}}
};

export function computeB(kind,P,m){
  const r={};
  // kit de bienvenida: siempre es gasto (se acepta escrito en positivo o negativo); no entra al % de recobro
  if(kind==='marca'){ r.gas=m.gas; r.rec=m.rec; r.kit=-Math.abs(Number(m.kit)||0); }
  else { r.gas=m.s_gas; r.rec=m.s_rec; r.kit=Number(m.s_kit)||0; }
  r.neto=r.gas+r.rec+r.kit;
  if(kind==='total'){
    r.hc=P.hc; r.sueldo=P.sueldo*r.hc; r.bono=P.bono*r.sueldo; r.lab=(r.sueldo+r.bono)*P.lab; r.equipo=P.equipo*r.hc;
    r.personal=r.sueldo+r.bono+r.lab+r.equipo;
    r.agencias=P.agencias; r.software=P.software; r.otros=P.otros; r.oper=r.agencias+r.software+r.otros;
    r.mob=P.mob; r.agua=P.agua; r.tienda=r.mob+r.agua;
    r.viajes=m.viajes; r.atenc=m.atenc; r.repr=r.viajes+r.atenc;
    r.area=r.personal+r.oper+r.tienda+r.repr; r.total=r.neto+r.area;
    r.e001=r.neto; r.e003=r.area;
  } else { r.e55=r.gas; r.e56=r.rec; r.eKit=r.kit; r.eNet=r.neto; }
  pctsB(r); return r;
}
function pctsB(r){ r.pctRec=r.gas?-r.rec/r.gas:0; if(r.total!=null)r.pctArea=r.total?r.area/r.total:0; }
export function columnsB(kind,st){
  const cols=[];
  for(let c=0;c<13;c++){ const m={};
    for(const k in st.M)m[k]=Number(st.M[k][c])||0;
    if(st.S)for(const k in st.S)m['s_'+k]=st.S[k][c];
    cols.push(computeB(kind,st.P,m)); }
  const months=cols.slice(0,12), yr={};
  for(const k in months[0])yr[k]=months.reduce((a,r)=>a+(r[k]||0),0);
  if(yr.hc!=null)yr.hc=yr.hc/12; pctsB(yr);
  return [...months,yr,cols[12]];
}

export function rowsB(k){
    if(k==='marca') return [
      ['','Marketing de la marca','sec'],
      ['gas','(−) Gastos de marketing','in',8,null,{m:'gas',note:'Plan de medios, eventos, activaciones y material de la marca en la sede'}],
      ['rec','(+) Recobro de marca','in',9,null,{m:'rec',note:'Lo que la marca reembolsa del plan'}],
      ['kit','(−) Kit de bienvenida','in',null,null,{m:'kit',note:'Monto del mes en US$ (kits que se entregan con las unidades); siempre resta y no tiene recobro'}],
      ['neto','Neto marketing de la marca','s',11,null,{cls:'mc'}],
      ['pctRec','% de recobro sobre el gasto','p'],
      ['','Enlace con FU-001','sec'],
      ['e55','→ FU-001 · fila 55 · (−) Gastos de marketing','c',15,null,{ind:1,link:1}],
      ['e56','→ FU-001 · fila 56 · (+) Recobro de marca','c',16,null,{ind:1,link:1}],
      ['eKit','→ FU-001 · (−) Kit de bienvenida','c',null,null,{ind:1,link:1}],
      ['eNet','→ Marketing total · neto de la marca','c',17,null,{ind:1,link:1}]
    ];
    const sum={src:'FU-001-B',sum:1};
    return [
      ['','Marketing de marcas · suma de las hojas por sede × marca','sec'],
      ['gas','(−) Gastos de marketing de las marcas','c',8,null,Object.assign({ind:1},sum)],
      ['rec','(+) Recobro de las marcas','c',9,null,Object.assign({ind:1},sum)],
      ['kit','(−) Kits de bienvenida de las marcas','c',null,null,Object.assign({ind:1},sum)],
      ['neto','Neto marketing de marcas','g',10],
      ['pctRec','% de recobro sobre el gasto','p'],
      ['','Gastos del área de marketing · se cargan una sola vez','sec'],
      ['personal','Cargas del personal','g',14],
      ['hc','Headcount del área de marketing','c',15,{k:'hc',f:'num',e:1,note:'Jefe, analistas, diseño, community'},{ind:1,dec:1}],
      ['sueldo','Sueldos básicos','c',16,{k:'sueldo',f:'num',e:1,note:'Por persona al mes (S/ 3,000 ÷ TC 3.4)'},{ind:1}],
      ['bono','Bonos por objetivos','c',17,{k:'bono',f:'pct',e:1,note:'% sobre los sueldos básicos'},{ind:1}],
      ['lab','Costo laboral','c',18,{k:'lab',f:'pct',e:1,note:'Factor empresa sobre sueldo + bonos'},{ind:1}],
      ['equipo','Laptops, equipos, licencias y celular','c',19,{k:'equipo',f:'num',e:1,note:'Por persona al mes'},{ind:1}],
      ['plan','Personal del área · tabla de personal','c',null,null,{ind:1,src:'Tabla de personal',note:'Con su propio costo laboral; quien esté aquí no va en el headcount'}],
      ['oper','Gestión de operación','g',21],
      ['agencias','Agencias, producción y diseño institucional','c',22,{k:'agencias',f:'num',e:1,note:'Monto mensual (lo que no es de una marca)'},{ind:1}],
      ['software','Software, herramientas digitales y suscripciones','c',23,{k:'software',f:'num',e:1,note:'Monto mensual'},{ind:1}],
      ['otros','Otros, imprevistos','c',24,{k:'otros',f:'num',e:1,note:'Monto mensual'},{ind:1}],
      ['tienda','Gestión tienda (oficina de marketing)','g',26],
      ['mob','Reparación y mantenimiento de mobiliario','c',27,{k:'mob',f:'num',e:1,note:'Bolsa mensual'},{ind:1}],
      ['agua','Agua, insumos y útiles','c',28,{k:'agua',f:'num',e:1,note:'Valor recomendado'},{ind:1}],
      ['repr','Gastos de representación','g',30],
      ['viajes','Viajes (solo de marcas)','in',31,null,{ind:1,m:'viajes'}],
      ['atenc','Atenciones a marcas, medios y proveedores','in',32,null,{ind:1,m:'atenc'}],
      ['area','Gastos del área de marketing','s',34,null,{cls:'gop'}],
      ['total','Marketing total','s',36,null,{cls:'mc'}],
      ['pctArea','% del área sobre el marketing total','p'],
      ['','Enlace','sec'],
      ['e001','→ FU-001 · neto de marketing de las marcas (control)','c',40,null,{ind:1,link:1}],
      ['e003','→ FU-003 · gastos de estructura · área de marketing','c',41,null,{ind:1,link:1}]
    ];
  }
// Área de marketing: la tabla de personal se suma a «Cargas del personal», al área y al total
export function conPlanB(cols,filas,P){
  const pc=costoPlan(filas,{lab:P.lab,tc:P.tc});
  for(let i=0;i<12;i++){ const r=cols[i];
    r.plan=pc.tot[i]; r.personal+=r.plan; r.area+=r.plan; r.total+=r.plan; r.e003=r.area; pctsB(r); }
  cols[13].plan=0;
  const months=cols.slice(0,12), yr={};
  for(const k in months[0]) yr[k]=months.reduce((a,r)=>a+(Number(r[k])||0),0);
  if(yr.hc!=null) yr.hc=yr.hc/12; pctsB(yr); cols[12]=yr;
  return cols;
}
