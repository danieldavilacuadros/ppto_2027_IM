// Motor de FU-004-S (Seminuevos): una sola hoja por sede (2027: solo Arequipa) con la parte comercial,
// los alquileres vehiculares, los gastos de operación, los gastos de la sede y la tabla de personal.
// Base: Excel «FU-004-S - SEMINUEVOS» (nov-2026) con las correcciones acordadas: sueldos en negativo,
// tasadores en las cargas de todos los meses, reparaciones sobre el ingreso de cada mes y costo laboral en la tabla.
/* eslint-disable */
import { costoPlan } from './personal.js';
import { GS, GRUPOS } from './fu001sede.js';

const Z13=()=>Array(13).fill(0), R13=(a)=>[...Array(12).fill(a),0];
/** Ejemplo: valores del Excel (Arequipa) */
export const XS={
  P:{ticket:17000,margen:0.05,interplaza:-0.012,alqImp:-0.07,alqRep:-0.1,placaV:0,placaC:-100,
     ventasVend:17,comV:-0.19,tasF:1.5,tasKpi:18,sueldoT:-385,comT:-0.19,lab:0.4,equipoHC:-55,
     mkt:-0.12,lavado:-4,repLocal:-50,agua:-125,seguridad:-880,limpieza:-440,tasa:0.08,sobre:0.15,stockF:1.5,tc:3.4},
  M:Object.assign({
    units:[40,45,45,50,50,55,60,60,70,75,75,75,0],
    alqIng:R13(10000), soat:[-350,...Array(11).fill(-60),0], gps:[-700,...Array(11).fill(-100),0],
    sueldosV:R13(-450), viajes:R13(-1600),
  }, Object.fromEntries(GS.map(([id])=>[id,Z13()])),
  {alq:R13(-4500),elec:R13(-361),aguaS:R13(-250),tel:R13(-100),mantS:R13(-100),sumi:R13(-100),movi:R13(-150)}),
  T:[
    {cargo:'Coordinador comercial',nombre:'',fijo:3500,tipo:'pctMB',val:0.018,desde:1,hasta:12},
    {cargo:'Gerente comercial',nombre:'',fijo:4000,tipo:'pctMB',val:0.073,desde:1,hasta:12}]
};

function linea(P,m){
  const r={}, u=Number(m.units)||0;
  r.u=u; r.venta=P.ticket*u; r.mb1=r.venta*P.margen; r.costo=r.mb1-r.venta;
  r.fint=P.interplaza*r.venta; r.flet=r.fint; r.mb2=r.mb1+r.flet;
  r.alqIng=Number(m.alqIng)||0; r.soat=Number(m.soat)||0; r.gps=Number(m.gps)||0;
  r.alqImp=P.alqImp*r.alqIng; r.alqRep=P.alqRep*r.alqIng;
  r.alqGas=r.soat+r.gps+r.alqImp+r.alqRep; r.alqV=r.alqIng+r.alqGas; // alqGas: no confundir con el grupo «alqG» de los gastos de la sede
  r.plv=P.placaV*u; r.plc=P.placaC*u; r.placas=r.plv+r.plc;
  r.mb3=r.mb2+r.alqV+r.placas;
  r.hcV=P.ventasVend?u/P.ventasVend:0; r.sueldosV=Number(m.sueldosV)||0; r.comV=P.comV*r.mb2;
  r.hcT=P.tasKpi?u*P.tasF/P.tasKpi:0; r.sueldosT=P.sueldoT*r.hcT; r.comT=P.comT*r.mb2;
  r.lab=(r.sueldosV+r.comV+r.sueldosT+r.comT)*P.lab; r.eqs=P.equipoHC*(r.hcV+r.hcT);
  r.personal=r.sueldosV+r.comV+r.sueldosT+r.comT+r.lab+r.eqs;
  r.mktG=P.mkt*r.mb1; r.mkt=r.mktG;
  r.lav=P.lavado*u; r.repl=P.repLocal*u; r.agua=P.agua; r.segu=P.seguridad; r.limp=P.limpieza;
  r.tienda=r.lav+r.repl+r.agua+r.segu+r.limp;
  r.int=-P.tasa/12*u*P.stockF*P.ticket*P.sobre; r.fin=r.int;
  r.via=Number(m.viajes)||0; r.repr=r.via;
  r.gop=r.personal+r.mkt+r.tienda+r.fin+r.repr;
  r.mc=r.mb3+r.gop;
  r.fact=r.venta+r.alqIng;
  return r;
}
function sede(r,st,i,plan){
  r.plan=plan; GS.forEach(([id])=>r[id]=Number(st.M[id]&&st.M[id][i])||0);
  GRUPOS.forEach(([g])=>r[g]=0); GS.forEach(([id,,g])=>r[g]+=r[id]);
  r.gsede=r.plan+GRUPOS.reduce((a,[g])=>a+r[g],0); r.usede=r.mc+r.gsede;
}
/** [12 meses, año, histórico (vacío por ahora)] */
export function computeS(st){
  const P=st.P, months=[];
  for(let i=0;i<12;i++){ const m={}; for(const k in st.M) m[k]=st.M[k][i]; months.push(linea(P,m)); }
  const pc=costoPlan(st.T||[],{mb:months.map(r=>r.mb3),lab:P.lab,tc:P.tc});
  months.forEach((r,i)=>sede(r,st,i,pc.tot[i]));
  const yr={}; for(const k in months[0]) yr[k]=months.reduce((a,r)=>a+(Number(r[k])||0),0);
  yr.hcV/=12; yr.hcT/=12;
  return [...months,yr,{}];
}
export function rowsS(){
  const R=[
    ['','Volumen','sec'],
    ['u','Número de unidades','in',null,null,{m:'units',int:1,note:'Unidades seminuevas a vender en el mes'}],
    ['venta','Venta unidades','c',null,{k:'ticket',f:'num',e:1,note:'Ticket medio (US$ sin IGV) · unidades × ticket'}],
    ['costo','Costo unidades','c'],
    ['mb1','MB 1 · Teórico','s',null,{k:'margen',f:'pct',e:1,note:'Margen teórico sobre la venta'}],
    ['mb1','','p'],
    ['','Margen bruto','sec'],
    ['fint','(−) Flete interplaza','c',null,{k:'interplaza',f:'pct',e:1,note:'% de la venta'}],
    ['mb2','MB 2 · Con gastos','s'],
    ['mb2','','p'],
    ['alqV','Alquileres vehiculares','g'],
    ['alqIng','(+) Ingreso por alquiler','in',null,null,{ind:1,m:'alqIng',note:'Monto del mes (US$)'}],
    ['alqGas','(−) Gastos por alquiler','c',null,null,{ind:1,l2:1}],
    ['soat','SOAT','in',null,null,{ind:2,m:'soat',note:'Monto del mes (US$, en negativo)'}],
    ['gps','GPS','in',null,null,{ind:2,m:'gps',note:'Monto del mes (US$, en negativo)'}],
    ['alqImp','Impuestos y gastos varios','c',null,{k:'alqImp',f:'pct',e:1,note:'% del ingreso por alquiler'},{ind:2}],
    ['alqRep','Reparaciones','c',null,{k:'alqRep',f:'pct',e:1,note:'% del ingreso por alquiler del mes'},{ind:2}],
    ['placas','Inmatriculación y placas','g'],
    ['plv','(+) Venta por placa','c',null,{k:'placaV',f:'num',e:1,note:'US$ por unidad'},{ind:1}],
    ['plc','(−) Costo por placa','c',null,{k:'placaC',f:'num',e:1,note:'US$ por unidad'},{ind:1}],
    ['mb3','MB 3 · Con gastos y otros ingresos','s'],
    ['mb3','','p'],
    ['','Gastos de operación','sec'],
    ['personal','Cargas del personal','g'],
    ['hcV','Headcount (vendedores)','c',null,{k:'ventasVend',f:'num',e:1,note:'Ventas por vendedor (KPI) · unidades ÷ KPI'},{ind:1,dec:2}],
    ['sueldosV','Sueldos básicos vendedores','in',null,null,{ind:1,m:'sueldosV',note:'Total del mes (US$, en negativo)'}],
    ['comV','Comisiones vendedores','c',null,{k:'comV',f:'pct',e:1,note:'Sobre el MB 2'},{ind:1}],
    ['hcT','Headcount (tasadores)','c',null,{k:'tasKpi',f:'num',e:1,note:'Tasaciones por tasador (KPI) · unidades × tasaciones por venta ÷ KPI'},{ind:1,dec:2}],
    ['','Tasaciones por unidad vendida','po',null,{k:'tasF',f:'num1',e:1,note:'Factor de tasaciones'},{ind:1}],
    ['sueldosT','Sueldos básicos tasadores','c',null,{k:'sueldoT',f:'num',e:1,note:'US$ por tasador al mes × headcount'},{ind:1}],
    ['comT','Comisiones tasadores','c',null,{k:'comT',f:'pct',e:1,note:'Sobre el MB 2 (aparte de la de vendedores)'},{ind:1}],
    ['lab','Costo laboral','c',null,{k:'lab',f:'pct',e:1,note:'Factor empresa sobre sueldos + comisiones'},{ind:1}],
    ['eqs','Laptops, equipos, licencias y celular','c',null,{k:'equipoHC',f:'num',e:1,note:'US$ por persona al mes × (vendedores + tasadores)'},{ind:1}],
    ['mkt','Marketing','g'],
    ['mktG','(−) Gastos de marketing','c',null,{k:'mkt',f:'pct',e:1,note:'% del MB 1'},{ind:1}],
    ['tienda','Gestión de tienda','g'],
    ['lav','Lavado de showroom','c',null,{k:'lavado',f:'num',e:1,note:'US$ por unidad'},{ind:1}],
    ['repl','Reparación y mantenimiento de local','c',null,{k:'repLocal',f:'num',e:1,note:'Bolsa US$ por unidad'},{ind:1}],
    ['agua','Agua, insumos y útiles','c',null,{k:'agua',f:'num',e:1,note:'Monto mensual US$'},{ind:1}],
    ['segu','Personal de seguridad','c',null,{k:'seguridad',f:'num',e:1,note:'Monto mensual US$, si es de terceros'},{ind:1}],
    ['limp','Personal de limpieza general','c',null,{k:'limpieza',f:'num',e:1,note:'Monto mensual US$, si es de terceros'},{ind:1}],
    ['fin','Gastos financieros','g'],
    ['int','Interés por stock de más de 90 días','c',null,{k:'tasa',f:'pct',e:1,note:'Tasa anual'},{ind:1}],
    ['','Vehículos en sobrestadía','po',null,{k:'sobre',f:'pct',e:1,note:'% del stock'},{ind:1}],
    ['','Stock promedio (veces la venta)','po',null,{k:'stockF',f:'num1',e:1,note:'Factor de stock'},{ind:1}],
    ['repr','Gastos de representación','g'],
    ['via','Viajes','in',null,null,{ind:1,m:'viajes',note:'Monto del mes (US$, en negativo)'}],
    ['gop','Gastos de operación','s',null,null,{cls:'gop'}],
    ['gop','','p'],
    ['mc','Margen de contribución','s',null,null,{cls:'mc'}],
    ['mc','','p'],
    ['','Gastos de la sede · Seminuevos','sec'],
    ['plan','Tabla de personal (coordinador, gerente comercial…)','c',null,null,{ind:1,src:'Tabla de personal'}]];
  GRUPOS.forEach(([g,n])=>{ R.push([g,n,'g']);
    GS.filter(x=>x[2]===g).forEach(([id,lab])=>R.push([id,lab,'in',null,null,{ind:1,m:id,note:'Monto del mes (US$, en negativo)'}])); });
  R.push(['gsede','Gastos de la sede','s',null,null,{cls:'gop'}],['usede','Utilidad de Seminuevos','s',null,null,{cls:'mc'}],['usede','','p']);
  return R;
}
