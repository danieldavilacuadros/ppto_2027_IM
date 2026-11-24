// FU-001 · Consolidado por sede de Unidades: Σ marcas de la sede + IF&E de la sede (check Integrado)
// + gastos propios de la sede (personal de sede, alquileres, servicios, gestión, impuestos, seguros, honorarios)
// = utilidad de la sede; con el reparto de los gastos a cada marca por facturación de vehículos (criterio provisional).
/* eslint-disable */
import { costoPlan } from './personal.js';

// [id, rubro, grupo, cuentas del histórico (SEDE:…)]
export const GS=[
  ['alq','Alquiler de local, transporte y equipos','alqG',['Alquileres']],
  ['elec','Electricidad','servG',['Electricidad']],
  ['aguaS','Agua','servG',[]],
  ['tel','Teléfono, internet y cable','servG',['Servicio Internet','cable']],
  ['mantS','Mantenimiento de instalaciones y equipos','gestG',[]],
  ['sumi','Suministros y útiles de oficina','gestG',[]],
  ['movi','Movilidades y combustible','gestG',[]],
  ['imp','Impuestos y gastos legales (arbitrios, patrimonio vehicular, FISE)','impG',['Impuestos y Gastos Legales directos']],
  ['segS','Seguros varios','impG',['Seguros Varios']],
  ['hon','Honorarios y gastos bancarios','impG',['Honorarios Asesores y Otros','Gastos Bancarios']]];
export const GRUPOS=[['alqG','Alquileres'],['servG','Servicios básicos'],['gestG','Gestión de la sede'],['impG','Impuestos, seguros y honorarios']];
// Comercial que se suma de las hojas de marca
const COM=['u','venta','costo','mb1','cort','flet','mb2','IF','equip','eqp','eqn','bonos','placas','mb3','personal','mkt','tienda','pdi','tdg','fin','repr','gop','mc'];

/** Ejemplo: sin gastos cargados (el sistema los precarga con el promedio real 2026 de la sede). */
export const XU={P:{tc:3.4,lab:0.4},M:Object.fromEntries(GS.map(([id])=>[id,Array(13).fill(0)])),T:[]};

const suma=a=>a.reduce((x,y)=>x+y,0);
function totales(r){
  GRUPOS.forEach(([g])=>r[g]=0); GS.forEach(([id,,g])=>{r[g]+=r[id]||0;});
  r.gpers=r.plan||0; r.gsede=r.gpers+GRUPOS.reduce((a,[g])=>a+r[g],0);
  r.cneg=(r.mc||0)+(r.ifeG||0); r.usede=r.cneg+r.gsede;
}
/**
 * st: {P:{tc,lab}, M:{alq:[13]…}, T:[puestos]} · marcas: [{marca, cols (14: 12 meses, año, histórico)}]
 * ifeG: gastos del consolidado de IF&E de la sede (12 meses, negativos; 0 con check Independiente)
 * Devuelve [12 meses, año, histórico].
 */
export function computeSede(st,marcas,ifeG){
  const pc=costoPlan(st.T||[],{lab:st.P.lab,tc:st.P.tc}), out=[];
  for(let i=0;i<12;i++){
    const r={};
    COM.forEach(k=>r[k]=marcas.reduce((a,m)=>a+(m.cols[i][k]||0),0));
    r.ifeG=(ifeG&&ifeG[i])||0; r.plan=pc.tot[i];
    GS.forEach(([id])=>r[id]=Number(st.M[id]&&st.M[id][i])||0);
    totales(r);
    // reparto: cada puesto por su criterio; los demás gastos de la sede y el IF&E de la sede por facturación
    const vt=marcas.reduce((a,m)=>a+(m.cols[i].venta||0),0), resto=r.gsede-r.plan+r.ifeG;
    marcas.forEach(m=>{ const sh=vt?(m.cols[i].venta||0)/vt:0; let pm=0;
      (st.T||[]).forEach((f,j)=>{ const fr=pc.filas[j]; if(!fr) return; pm+=fr.tot[i]*(f.rep&&typeof f.rep==='object'?(Number(f.rep[m.marca])||0)/100:sh); });
      r['part@'+m.marca]=sh; r['asig@'+m.marca]=resto*sh+pm; r['um@'+m.marca]=(m.cols[i].mc||0)+r['asig@'+m.marca]; });
    out.push(r);
  }
  const yr={}; for(const k in out[0]) if(!k.startsWith('part@')) yr[k]=out.reduce((a,r)=>a+(r[k]||0),0);
  const vy=marcas.reduce((a,m)=>a+suma(m.cols.slice(0,12).map(c=>c.venta||0)),0);
  marcas.forEach(m=>{ yr['part@'+m.marca]=vy?suma(m.cols.slice(0,12).map(c=>c.venta||0))/vy:0; });
  // histórico de ejemplo: suma de la columna histórica de cada marca y la posición 12 de los gastos
  const h={}; COM.forEach(k=>h[k]=marcas.reduce((a,m)=>a+((m.cols[13]||{})[k]||0),0));
  GS.forEach(([id])=>h[id]=Number(st.M[id]&&st.M[id][12])||0); h.ifeG=0; h.plan=0; totales(h);
  return [...out,yr,h];
}
/** Columna «Histórico 2026» real: comercial de toda la sede (filas de FU-001) + gastos de sede (prom. mensual). */
export function histSede(com,gastos){
  const h={}; COM.forEach(k=>h[k]=Number(com[k])||0); h.u=com.u; h.venta=com.venta;
  GS.forEach(([id])=>h[id]=gastos[id]||0); h.ifeG=0; h.plan=0; totales(h);
  return h;
}
/** Promedio mensual de las cuentas de sede del histórico, por fila de gasto. */
export function gastosDesdeHistorico(filas,meses){
  const out={}; GS.forEach(([id,,,acc])=>{ out[id]=filas.filter(f=>acc.includes(String(f.cuenta).replace(/^SEDE:/,''))&&String(f.cuenta).startsWith('SEDE:'))
    .reduce((a,f)=>a+Number(f.monto),0)/(meses||1); });
  return out;
}
export function rowsSede(marcas){
  const sum={src:'FU-001',sum:1};
  const R=[
    ['','Comercial · suma de las hojas de marca de la sede','sec'],
    ['u','Número de unidades','c',null,null,Object.assign({int:1},sum)],
    ['venta','Venta unidades','c',null,null,sum],
    ['mb1','MB 1 · Teórico','s'],['mb1','','p'],
    ['mb2','MB 2 · Con gastos','s'],
    ['IF','Intermediación financiera','c',null,null,Object.assign({ind:1,ife:1},sum)],
    ['equip','Equipamiento vehicular · margen','c',null,null,Object.assign({ind:1,ife:1},sum)],
    ['bonos','Bonos de marca','c',null,null,Object.assign({ind:1},sum)],
    ['placas','Inmatriculación y placas','c',null,null,Object.assign({ind:1},sum)],
    ['mb3','MB 3 · Con gastos y otros ingresos','s'],['mb3','','p'],
    ['personal','Cargas del personal comercial','c',null,null,Object.assign({ind:1},sum)],
    ['mkt','Marketing','c',null,null,Object.assign({ind:1},sum)],
    ['tienda','Gestión de tienda (incluye seguridad y limpieza)','c',null,null,Object.assign({ind:1},sum)],
    ['pdi','PDI','c',null,null,Object.assign({ind:1},sum)],
    ['tdg','Gestión de test drives','c',null,null,Object.assign({ind:1},sum)],
    ['fin','Gastos financieros','c',null,null,Object.assign({ind:1},sum)],
    ['repr','Gastos de representación','c',null,null,Object.assign({ind:1},sum)],
    ['gop','Gastos de operación de las marcas','s',null,null,{cls:'gop'}],
    ['mc','Contribución de Unidades · Σ marcas','s'],['mc','','p'],
    ['','IF&E de la sede · solo con el check Integrado','sec'],
    ['ifeG','(−) Gastos de IF&E de la sede (empate)','c',null,null,{src:'FU-001-A',onlyInt:1,note:'Asesores F&I, instalación, marketing, local y representación del consolidado de IF&E de la sede. Su margen ya está en cada marca.'}],
    ['cneg','Contribución del negocio en la sede','s'],
    ['','Gastos de la sede · los carga el jefe de sede','sec'],
    ['gpers','Personal de sede','g'],
    ['plan','Tabla de personal (jefe de sede, administración, caja, PDI…)','c',null,null,{ind:1,src:'Tabla de personal'}]];
  GRUPOS.forEach(([g,n])=>{ R.push([g,n,'g']);
    GS.filter(x=>x[2]===g).forEach(([id,lab,,acc])=>R.push([id,lab,'in',null,null,{ind:1,m:id,note:acc.length?'Histórico: '+acc.join(' + '):'Sin cuenta propia en el histórico'}])); });
  R.push(['gsede','Gastos de la sede','s',null,null,{cls:'gop'}],['usede','Utilidad de la sede','s',null,null,{cls:'mc'}],['usede','','p'],
    ['','Reparto a las marcas · vista marca · por facturación de vehículos (criterio provisional)','sec']);
  marcas.forEach(m=>{ R.push(['part@'+m,'Participación en la facturación · '+m,'p',null,null,{part:1}]);
    R.push(['asig@'+m,'Gastos de sede e IF&E asignados · '+m,'c',null,null,{ind:1}]);
    R.push(['um@'+m,'Utilidad de '+m+' en la sede','c',null,null,{ind:1,l2:1}]); });
  return R;
}
