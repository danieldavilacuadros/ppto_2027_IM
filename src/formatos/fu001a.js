// Motor de FU-001-A (IF&E). Base validada contra el Excel en 2,030 celdas; desde 2026-11-23 usa las reglas de valorizado
// de la proyección 2027 (Libro2): comisiones como % del ticket y N° redondeado mes a mes. No editar sin volver a validar.
/* eslint-disable */
import { costoPlan } from './personal.js';
export { costoPlan };
export const XA={ // valores del Excel FU-001-A (CUSCO · Hyundai; sede = suma de marcas de ejemplo)
 marca:{P:{ticket:16251.0,credFin:0.8,credCom:0.015,segPrima:0.035,segPct:0.18,fonFin:0.9,fonPct:0.009,gpsV:254.237288136,gpsC:-180.508474576,mokV:118.644067797,mokC:-59.3220338983,glpV:720.338983051,glpC:-677.966101695,accT:168.0,accC:-0.8},M:{units:[120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0],pCred:[0.177152317881,0.181956652619,0.186760987357,0.191565322095,0.196369656833,0.201173991571,0.205978326309,0.210782661048,0.215586995786,0.220391330524,0.225195665262,0.23,0.177152317881],pSeg:[0.0993377483444,0.103943407586,0.108549066827,0.113154726069,0.11776038531,0.122366044551,0.126971703793,0.131577363034,0.136183022276,0.140788681517,0.145394340759,0.15,0.0993377483444],pFon:[0.0115894039735,0.019626730885,0.0276640577965,0.035701384708,0.0437387116195,0.051776038531,0.0598133654425,0.067850692354,0.0758880192655,0.083925346177,0.0919626730885,0.1,0.0115894039735],pGps:[0.372516556291,0.384105960265,0.395695364238,0.407284768212,0.418874172185,0.430463576159,0.442052980132,0.453642384106,0.465231788079,0.476821192053,0.488410596026,0.5,0.372516556291],pMok:[0.254966887417,0.277242624925,0.299518362432,0.32179409994,0.344069837447,0.366345574955,0.388621312462,0.41089704997,0.433172787477,0.455448524985,0.477724262492,0.5,0.254966887417],pGlp:[0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05]}},
 sede:{P:{tc:3.4,comVend:-0.16,hc:1.0,sueldo:-361.764705882,comAs:-0.075,lab:0.4,inst:-8.0,mkt:-100.0,otros:-25.0,rep:-40.0,agua:-20.0,repH:-1800.0,aguaH:-125.0},M:{viajes:[-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0],atenc:[-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0]},S:{u:[180.0,180.0,180.0,180.0,180.0,180.0,180.0,180.0,180.0,180.0,180.0,180.0,175.0],venta:[3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,3060120.0,2967620.0],nCred:[31.8874172185,32.7521974714,33.6169777243,34.4817579771,35.34653823,36.2113184828,37.0760987357,37.9408789886,38.8056592414,39.6704394943,40.5352197471,41.4,31.0016556291],cCred:[15943.7086093,16376.0987357,16808.4888621,17240.8789886,17673.269115,18105.6592414,18538.0493679,18970.4394943,19402.8296207,19835.2197471,20267.6098736,20700.0,15500.8278146],nSeg:[17.880794702,18.7098133654,19.5388320289,20.3678506924,21.1968693558,22.0258880193,22.8549066827,23.6839253462,24.5129440096,25.3419626731,26.1709813365,27.0,17.3841059603],cSeg:[2896.68874172,3030.9897652,3165.29078868,3299.59181216,3433.89283564,3568.19385912,3702.4948826,3836.79590608,3971.09692956,4105.39795304,4239.69897652,4374.0,2816.22516556],nFon:[2.08609271523,3.5328115593,4.97953040337,6.42624924744,7.87296809151,9.31968693558,10.7664057797,12.2131246237,13.6598434678,15.1065623119,16.5532811559,18.0,2.02814569536],cFon:[319.184701987,540.541365443,761.898028898,983.254692354,1204.61135581,1425.96801927,1647.32468272,1868.68134618,2090.03800963,2311.39467309,2532.75133654,2754.108,309.536523179],nGps:[67.0529801325,69.1390728477,71.2251655629,73.3112582781,75.3973509934,77.4834437086,79.5695364238,81.6556291391,83.7417218543,85.8278145695,87.9139072848,90.0,65.190397351],gpsP:[17047.3678303,17577.730385,18108.0929397,18638.4554944,19168.8180492,19699.1806039,20229.5431586,20759.9057133,21290.268268,21820.6308228,22350.9933775,22881.3559322,16573.829835],gpsN:[-12103.6311595,-12480.1885734,-12856.7459872,-13233.3034011,-13609.8608149,-13986.4182288,-14362.9756426,-14739.5330565,-15116.0904703,-15492.6478842,-15869.205298,-16245.7627119,-11767.4191828],nMok:[45.8940397351,49.9036724865,53.9133052378,57.9229379892,61.9325707405,65.9422034919,69.9518362432,73.9614689946,77.9711017459,81.9807344973,85.9903672486,90.0,44.619205298],mokP:[5445.05556179,5920.77470178,6396.49384177,6872.21298177,7347.93212176,7823.65126175,8299.37040174,8775.08954173,9250.80868172,9726.52782171,10202.2469617,10677.9661017,5293.80401841],mokN:[-3889.32540128,-4229.12478699,-4568.9241727,-4908.7235584,-5248.52294411,-5588.32232982,-5928.12171553,-6267.92110124,-6607.72048694,-6947.51987265,-7287.31925836,-7627.11864407,-3781.28858458],nGlp:[9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,9.0,8.75],glpP:[6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6483.05084746,6302.96610169],glpN:[-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-6101.69491525,-5932.20338983],accP:[30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,30240.0,29400.0],accN:[-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22680.0,-22050.0]}},
 corp:{P:{ticket:16251.0,credFin:0.8,credCom:0.015,segPrima:0.035,segPct:0.18,fonFin:0.9,fonPct:0.009,gpsV:254.237288136,gpsC:-180.508474576,mokV:118.644067797,mokC:-59.3220338983,glpV:720.338983051,glpC:-677.966101695,accT:168.0,accC:-0.8,comVend:-0.16,hc:1.0,sueldo:-361.764705882,comAs:-0.075,lab:0.4,inst:-8.0,mkt:-100.0,otros:-25.0,rep:0.0,agua:0.0,repH:0.0,aguaH:0.0},M:{units:[120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0,120.0],pCred:[0.177152317881,0.181956652619,0.186760987357,0.191565322095,0.196369656833,0.201173991571,0.205978326309,0.210782661048,0.215586995786,0.220391330524,0.225195665262,0.23,0.177152317881],pSeg:[0.0993377483444,0.103943407586,0.108549066827,0.113154726069,0.11776038531,0.122366044551,0.126971703793,0.131577363034,0.136183022276,0.140788681517,0.145394340759,0.15,0.0993377483444],pFon:[0.0115894039735,0.019626730885,0.0276640577965,0.035701384708,0.0437387116195,0.051776038531,0.0598133654425,0.067850692354,0.0758880192655,0.083925346177,0.0919626730885,0.1,0.0115894039735],pGps:[0.372516556291,0.384105960265,0.395695364238,0.407284768212,0.418874172185,0.430463576159,0.442052980132,0.453642384106,0.465231788079,0.476821192053,0.488410596026,0.5,0.372516556291],pMok:[0.254966887417,0.277242624925,0.299518362432,0.32179409994,0.344069837447,0.366345574955,0.388621312462,0.41089704997,0.433172787477,0.455448524985,0.477724262492,0.5,0.254966887417],pGlp:[0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05],viajes:[-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0,-100.0],atenc:[-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0,-50.0]}},
 linea:{P:{tc:3.4,lab:0.4,otros:0,agua:0},M:{viajes:Array(13).fill(0),atenc:Array(13).fill(0)},T:[]}
};

export const LEAF=['u','venta','prima','nCred','cCred','nSeg','cSeg','nFon','cFon','nGps','gpsP','gpsN','nMok','mokP','mokN','nGlp','glpP','glpN','accP','accN'];
const PEN=[['pCred','nCred'],['pSeg','nSeg'],['pFon','nFon'],['pGps','nGps'],['pMok','nMok'],['pGlp','nGlp']];
// kind: marca | sede | corp · m: valores de una columna · c: 0-11 meses, 12 histórico
export function computeA(kind,P,m,ife,c){
  const r={};
  if(kind==='sede'){ LEAF.forEach(k=>r[k]=m['s_'+k]); r.prima=Number(r.prima)||0; }
  else{
    r.u=m.units; r.venta=P.ticket*r.u;
    // N° = penetración × unidades, redondeado al entero en cada mes (como la proyección 2027)
    const N=(p)=>Math.round((Number(p)||0)*r.u);
    r.nCred=N(m.pCred); r.cCred=r.nCred*P.ticket*P.credFin*P.credCom;   // ticket × % financiado × % ganancia
    r.nSeg=N(m.pSeg);   r.cSeg=r.nSeg*P.ticket*P.segPrima*P.segPct;     // prima neta (% del ticket) × % comisión
    r.prima=r.nSeg*P.ticket*P.segPrima;                                 // primas netas (base del bono de seguros)
    r.nFon=N(m.pFon);   r.cFon=r.nFon*P.ticket*P.fonFin*P.fonPct;       // ticket × % financiado × % ganancia
    r.nGps=N(m.pGps);   r.gpsP=P.gpsV*r.nGps; r.gpsN=P.gpsC*r.nGps;
    r.nMok=N(m.pMok);   r.mokP=P.mokV*r.nMok; r.mokN=P.mokC*r.nMok;
    r.nGlp=N(m.pGlp);   r.glpP=P.glpV*r.nGlp; r.glpN=P.glpC*r.nGlp;
    r.accP=P.accT*r.u;  r.accN=P.accC*r.accP;
  }
  ratiosA(r);
  r.IF=r.cCred+r.cSeg+r.cFon;
  r.eqp=r.gpsP+r.mokP+r.glpP+r.accP; r.eqn=r.gpsN+r.mokN+r.glpN+r.accN; r.equip=r.eqp+r.eqn;
  r.mb=r.IF+r.equip;
  if(kind!=='marca'){
    r.comVend=ife?0:P.comVend*r.mb;
    r.hc=P.hc; r.sueldo=P.sueldo*r.hc;
    r.comAs=P.comAs*(r.mb-(r.accP+r.accN));
    r.lab=(r.comVend+r.sueldo+r.comAs)*P.lab;
    r.personal=r.comVend+r.sueldo+r.comAs+r.lab;
    r.inst=P.inst*(r.nGps+r.nGlp); r.mkt=P.mkt; r.otros=P.otros;
    r.mktF=Number(m.mktF)||0; r.mktA=Number(m.mktA)||0; // marketing de financiamiento y de accesorios (FU-001-B)
    r.oper=r.inst+r.mkt+r.mktF+r.mktA+r.otros;
    r.rep=(c===12&&P.repH!=null)?P.repH:P.rep; r.agua=(c===12&&P.aguaH!=null)?P.aguaH:P.agua; r.tienda=r.rep+r.agua;
    r.viajes=m.viajes; r.atenc=m.atenc; r.repr=r.viajes+r.atenc;
    r.gastos=r.personal+r.oper+r.tienda+r.repr;
    r.mc=r.mb+r.gastos;
  }
  if(kind==='marca'){ r.eIF=ife?r.IF:0; r.eEqp=ife?r.eqp:0; r.eEqn=ife?r.eqn:0; r.eMB=r.mb; }
  else if(kind==='sede'){ r.eIF=ife?r.IF:0; r.eEqp=ife?r.eqp:0; r.eEqn=ife?r.eqn:0; r.eEmp=ife?r.gastos:0; r.eMC=ife?0:r.mc; }
  else { r.eIF=r.IF; r.eEqp=r.eqp; r.eEqn=r.eqn; r.eGas=r.gastos; r.eMC=r.mc; }
  pctsA(r);
  return r;
}
function ratiosA(r){ PEN.forEach(([p,n])=>r[p]=r.u?r[n]/r.u:0); }
function pctsA(r){ r.pctU=(r.venta+r.eqp)?r.mb/(r.venta+r.eqp):0; if(r.mc!=null)r.pctI=(r.IF+r.eqp)?r.mc/(r.IF+r.eqp):0; }
// columnas: 12 meses + histórico; devuelve [12 meses, año, histórico]
export function columnsA(kind,st,ife){
  const cols=[];
  for(let c=0;c<13;c++){
    const m={};
    for(const k in st.M){ m[k]=Number(st.M[k][c])||0; } // posición 12 = histórico (penetración real jul–set 2026)
    if(st.S)for(const k in st.S)m['s_'+k]=st.S[k][c];
    cols.push(computeA(kind,st.P,m,ife,c));
  }
  const months=cols.slice(0,12), yr={};
  for(const k in months[0])yr[k]=months.reduce((a,r)=>a+(r[k]||0),0);
  ratiosA(yr); if(yr.hc!=null)yr.hc=yr.hc/12; pctsA(yr);
  return [...months,yr,cols[12]];
}

export function rowsA(k){
    const S=k==='sede', G=k!=='marca';
    const sum=S?{src:'FU-001-A',sum:1}:{};
    const pen=(id,lab,x,cnt)=>S?[id,lab,'c',x,null,{ind:1,pct:1,note:'Ponderado: N° de la sede ÷ unidades'}]
                                :[id,lab,'in',x,null,{ind:1,pct:1,m:id}];
    const R=[
      ['','Base','sec'],
      ['u','Número de unidades','c',8,null,Object.assign({int:1},S?sum:{src:k==='corp'?'FU-005-C':'FU-001'})],
      ['venta','Venta unidades','c',9,S?null:{k:'ticket',f:'num',e:0,note:'Ticket medio sin equipamiento'},S?sum:{src:k==='corp'?'FU-005-C':'FU-001'}],
      ['','Intermediación financiera','sec'],
      ['IF','Intermediación financiera','g',11],
      pen('pCred','Penetración de créditos vehiculares',13),
      ['nCred','N° de créditos vehiculares','c',14,S?null:{k:'credFin',f:'pct',e:1,note:'% del valor de la unidad que se financia'},Object.assign({ind:2,int:1},sum)],
      ['cCred','(+) Comisión de créditos','c',15,S?null:{k:'credCom',f:'pct',e:1,note:'Ganancia sobre el monto financiado'},Object.assign({ind:1},sum)],
      pen('pSeg','Penetración de seguros vehiculares',17),
      ['nSeg','N° de seguros vehiculares','c',18,S?null:{k:'segPrima',f:'pct',e:1,note:'Prima neta: % del valor de la unidad'},Object.assign({ind:2,int:1},sum)],
      ['cSeg','(+) Comisión de seguros','c',19,S?null:{k:'segPct',f:'pct',e:1,note:'% de comisión sobre la prima'},Object.assign({ind:1},sum)],
      pen('pFon','Penetración de fondos colectivos',21),
      ['nFon','N° de fondos colectivos','c',22,S?null:{k:'fonFin',f:'pct',e:1,note:'% del valor de la unidad que se financia'},Object.assign({ind:2,int:1},sum)],
      ['cFon','(+) Comisión de fondos colectivos','c',23,S?null:{k:'fonPct',f:'pct',e:1,note:'Ganancia sobre el monto financiado'},Object.assign({ind:1},sum)],
      ['','Equipamiento vehicular','sec'],
      ['equip','Equipamiento vehicular · margen','g',25],
      pen('pGps','Penetración de GPS',27),
      ['nGps','GPS · unidades equipadas','c',28,null,Object.assign({ind:2,int:1},sum)],
      ['gpsP','(+) GPS · venta','c',29,S?null:{k:'gpsV',f:'num',e:1,note:'Precio de venta (US$ sin IGV)'},Object.assign({ind:2},sum)],
      ['gpsN','(−) GPS · costo','c',30,S?null:{k:'gpsC',f:'num',e:1,note:'Costo unitario (US$ sin IGV)'},Object.assign({ind:2},sum)],
      pen('pMok','Penetración de MOK',32),
      ['nMok','MOK · unidades equipadas','c',33,null,Object.assign({ind:2,int:1},sum)],
      ['mokP','(+) MOK · venta','c',34,S?null:{k:'mokV',f:'num',e:1,note:'Precio de venta (US$ sin IGV)'},Object.assign({ind:2},sum)],
      ['mokN','(−) MOK · costo','c',35,S?null:{k:'mokC',f:'num',e:1,note:'Costo unitario (US$ sin IGV)'},Object.assign({ind:2},sum)],
      pen('pGlp','Penetración de GLP',37),
      ['nGlp','GLP · unidades equipadas','c',38,null,Object.assign({ind:2,int:1},sum)],
      ['glpP','(+) GLP · venta','c',39,S?null:{k:'glpV',f:'num',e:1,note:'Precio de venta (US$ sin IGV)'},Object.assign({ind:2},sum)],
      ['glpN','(−) GLP · costo','c',40,S?null:{k:'glpC',f:'num',e:1,note:'Costo unitario (US$ sin IGV)'},Object.assign({ind:2},sum)],
      ['accP','(+) Accesorios · venta','c',42,S?null:{k:'accT',f:'num',e:1,note:'Ticket de accesorios por unidad (US$ sin IGV)'},Object.assign({ind:2},sum)],
      ['accN','(−) Accesorios · costo','c',43,S?null:{k:'accC',f:'pct',e:1,note:'% de costo sobre la venta de accesorios'},Object.assign({ind:2},sum)],
      ['eqp','(+) Equipamiento (GPS, MOK, GLP, ACC)','c',46,null,{ind:1,l2:1}],
      ['eqn','(−) Equipamiento (GPS, MOK, GLP, ACC)','c',47,null,{ind:1,l2:1}],
      ['mb','MB IF&E · Margen bruto','s',49],
      ['pctU','% sobre facturación de unidades (venta + equipamiento)','p']
    ];
    if(G){

      R.push(
        ['','Gastos propios IF&E · se cargan una vez por '+(S?'sede':'canal'),'sec'],
        ['personal','Cargas del personal','g',54],
        ...(S?[['plan','Personal compartido de la sede','c',null,null,{ind:1,src:'Tabla de personal',note:'Puestos que no son asesores; se reparten por marca'}]]:[]),
        ['comVend','Comisión a vendedores por F&I y equipamiento','c',55,{k:'comVend',f:'pct',e:1,note:'Solo con check Independiente; en Integrado ya está en FU-001'},{ind:1,onlyInd:1}],
        ['hc','Headcount asesores F&I','c',56,{k:'hc',f:'num',e:1,note:S?'Asesores de la sede (atienden todas las marcas)':'Asesores del canal'},{ind:1,dec:1}],
        ['sueldo','Sueldos básicos F&I','c',57,{k:'sueldo',f:'num',e:1,note:'Por asesor al mes (S/ 1,230 ÷ TC 3.4)'},{ind:1}],
        ['comAs','Comisiones asesor F&I','c',58,{k:'comAs',f:'pct',e:1,note:'Sobre el MB IF&E sin accesorios'},{ind:1}],
        ['lab','Costo laboral','c',59,{k:'lab',f:'pct',e:1,note:'Factor empresa sobre sueldo + comisiones'},{ind:1}],
        ['oper','Gestión de operación','g',61],
        ['inst','Instalación y logística de GPS y GLP','c',62,{k:'inst',f:'num',e:1,note:'Por unidad equipada con GPS o GLP'},{ind:1}],
        ['mkt','Marketing','c',63,{k:'mkt',f:'num',e:1,note:'Monto mensual; debería venir de FU-001-B'},{ind:1}],
        ...(S?[['mktF','Marketing de financiamiento','c',null,null,{ind:1,src:'FU-001-B',note:'Σ marcas de la sede en Marketing › Financiamiento'}],
              ['mktA','Marketing de accesorios','c',null,null,{ind:1,src:'FU-001-B',note:'Σ marcas de la sede en Marketing › Accesorios'}]]:[]),
        ['otros','Otros, imprevistos','c',64,{k:'otros',f:'num',e:1,note:'Monto mensual'},{ind:1}],
        ['tienda','Gestión de tienda','g',67],
        ['rep','Reparación y mantenimiento de local','c',68,{k:'rep',f:'num',e:1,note:S?'Bolsa mensual de la sede':'El Corporativo no tiene local: queda en 0'},{ind:1}],
        ['agua','Agua, insumos y útiles','c',69,{k:'agua',f:'num',e:1,note:S?'Monto mensual; varía por tamaño de sede':'El Corporativo no tiene local: queda en 0'},{ind:1}],
        ['repr','Gastos de representación','g',71],
        ['viajes','Viajes (solo de marcas)','in',72,null,{ind:1,m:'viajes'}],
        ['atenc','Atenciones a bancos y aseguradoras','in',73,null,{ind:1,m:'atenc'}],
        ['gastos','Gastos propios IF&E','s',52,null,{cls:'gop'}],
        ['mc','Margen de contribución IF&E','s',75,null,{cls:'mc'}],
        ['pctI','% sobre ingresos IF&E (intermediación + venta de equipamiento)','p']
      );
    }
    if(k==='marca') R.push(['','Enlace (según el check)','sec'],
      ['eIF','→ FU-001 · Intermediación financiera','c',53,null,{ind:1,link:1,onlyInt:1}],
      ['eEqp','→ FU-001 · (+) Equipamiento','c',54,null,{ind:1,link:1,onlyInt:1}],
      ['eEqn','→ FU-001 · (−) Equipamiento','c',55,null,{ind:1,link:1,onlyInt:1}],
      ['eMB','→ Consolidado por sede · MB IF&E','c',56,null,{ind:1,link:1}]);
    if(k==='sede') R.push(['','Enlace (según el check)','sec'],
      ['eIF','→ FU-001 · Intermediación (total de la sede)','c',79,null,{ind:1,link:1,onlyInt:1}],
      ['eEqp','→ FU-001 · (+) Equipamiento (total de la sede)','c',80,null,{ind:1,link:1,onlyInt:1}],
      ['eEqn','→ FU-001 · (−) Equipamiento (total de la sede)','c',81,null,{ind:1,link:1,onlyInt:1}],
      ['eEmp','→ Gastos de la sede (empate)','c',82,null,{ind:1,link:1,onlyInt:1}],
      ['eMC','→ Consolidados como línea propia · MC IF&E','c',83,null,{ind:1,link:1,onlyInd:1}]);
    if(k==='corp') R.push(['','Enlace con FU-005-C (todo el IF&E corporativo)','sec'],
      ['eIF','→ FU-005-C · Intermediación financiera','c',79,null,{ind:1,link:1}],
      ['eEqp','→ FU-005-C · (+) Equipamiento','c',80,null,{ind:1,link:1}],
      ['eEqn','→ FU-005-C · (−) Equipamiento','c',81,null,{ind:1,link:1}],
      ['eGas','→ FU-005-C · Gastos propios IF&E','c',82,null,{ind:1,link:1}],
      ['eMC','→ FU-005-C · MC IF&E','c',83,null,{ind:1,link:1}]);
    return R;
  }

// ───────── Total línea IF&E ─────────
// Suma, columna por columna, las sedes (cada una = Σ de sus marcas + sus gastos) y el Corporativo.
// sedes: [{sede, cols}] · corp: cols | null · marcas: [{marca, cols}] (hojas por marca de todas las sedes)
// Además deja el aporte de cada sede y de cada marca para el cuadre del esquema:
// Σ IF&E por marca (+ Corporativo) = Σ IF&E por sede (+ Corporativo) = Total línea IF&E.
const NO_SUMA=new Set(['pctU','pctI','pCred','pSeg','pFon','pGps','pMok','pGlp']);
export function totalA(sedes,corp,marcas){
  const partes=[...sedes.map(s=>s.cols),...(corp?[corp]:[])];
  const out=[];
  for(let c=0;c<14;c++){
    const r={};
    partes.forEach(p=>{ for(const k in p[c]) if(!NO_SUMA.has(k)) r[k]=(r[k]||0)+(Number(p[c][k])||0); });
    sedes.forEach(s=>{ r['mb@'+s.sede]=s.cols[c].mb||0; r['gas@'+s.sede]=s.cols[c].gastos||0; r['mc@'+s.sede]=s.cols[c].mc||0; });
    if(corp){ r['mb@corp']=corp[c].mb||0; r['gas@corp']=corp[c].gastos||0; r['mc@corp']=corp[c].mc||0; }
    marcas.forEach(m=>{ r['mbm@'+m.marca]=(r['mbm@'+m.marca]||0)+(m.cols[c].mb||0); });
    const sumMarcas=marcas.reduce((a,m)=>a+(m.cols[c].mb||0),0)+(corp?(corp[c].mb||0):0);
    r.ctlMarca=sumMarcas-(r.mb||0);
    ratiosA(r); pctsA(r);
    out.push(r);
  }
  return out;
}
// Vista acumulada: cada mes muestra lo acumulado de enero a ese mes (el año y el histórico no cambian).
export function acumularA(cols){
  const out=[]; const run={};
  for(let c=0;c<12;c++){
    const r={};
    for(const k in cols[c]){ if(NO_SUMA.has(k)||k.startsWith('part@')||k==='pctCont') continue; run[k]=(run[k]||0)+(Number(cols[c][k])||0); r[k]=run[k]; }
    if(r.hc!=null) r.hc=run.hc/(c+1);
    ratiosA(r); pctsA(r); fixPart(r);
    out.push(r);
  }
  return [...out,cols[12],cols[13]];
}
const SEDES_T=['AREQUIPA','CUSCO','JULIACA','ICA','TRUJILLO','PIURA'];
const MARCAS_T=['Hyundai','Hyundai CV','Geely','BYD','Volvo','Ford','Divemotor','Maxus','BAIC','Dongfeng','Omoda','Chery','Chevrolet','Isuzu','Mitsubishi','Fuso'];
export function rowsTotalA(){
  const base=rowsA('sede');
  const fin=base.findIndex(f=>f[2]==='sec'&&String(f[1]).startsWith('Enlace'));
  const R=(fin<0?base:base.slice(0,fin)).map(f=>{
    const [id,lab,t,x,,ex={}]=f;
    const e=Object.assign({},ex); delete e.m; delete e.note;
    if(e.sum) e.sumTxt='Σ sedes';
    if(String(lab).startsWith('Gastos propios IF&E · se cargan')) return ['','Gastos propios IF&E · suma de las sedes y el Corporativo','sec'];
    return [id,lab,t==='in'?'c':t,x,null,e];
  });
  R.push(['','Gastos de línea (nacional) · hoja «Gastos de línea»','sec']);
  R.push(['glin','(−) Gastos de línea (nacional)','c',null,null,{l2:1,src:'Gastos de línea'}]);
  R.push(['cont','Contribución de la línea IF&E','s',null,null,{cls:'mc'}]);
  R.push(['pctCont','% sobre ingresos IF&E (intermediación + venta de equipamiento)','p']);
  R.push(['','Prorrateo de los gastos de línea · por facturación de vehículos (unidades × ticket sin IGV)','sec']);
  SEDES_T.forEach(s=>{ R.push(['part@'+s,'Participación en la facturación · '+s,'p']); R.push(['pro@'+s,'Gastos de línea asignados · '+s,'c',null,null,{ind:1}]); R.push(['mcp@'+s,'MC IF&E después del prorrateo · '+s,'c',null,null,{ind:1,l2:1}]); });
  R.push(['part@corp','Participación en la facturación · Canal Corporativo','p']);
  R.push(['pro@corp','Gastos de línea asignados · Canal Corporativo','c',null,null,{ind:1}]);
  R.push(['mcp@corp','MC IF&E después del prorrateo · Canal Corporativo','c',null,null,{ind:1,l2:1}]);
  R.push(['','Cuadre por sede · Σ por sede + Corporativo = Total','sec']);
  SEDES_T.forEach(s=>R.push(['mc@'+s,'MC IF&E · '+s,'c',null,null,{l2:1}]));
  R.push(['mc@corp','MC IF&E · Canal Corporativo','c',null,null,{l2:1}]);
  R.push(['','Aporte de cada sede al MB y a los gastos','sec']);
  SEDES_T.forEach(s=>{ R.push(['mb@'+s,'MB IF&E · '+s,'c',null,null,{ind:1}]); R.push(['gas@'+s,'Gastos propios · '+s,'c',null,null,{ind:2}]); });
  R.push(['mb@corp','MB IF&E · Canal Corporativo','c',null,null,{ind:1}]);
  R.push(['gas@corp','Gastos propios · Canal Corporativo','c',null,null,{ind:2}]);
  R.push(['','Cuadre por marca · Σ por marca + Corporativo = MB total','sec']);
  MARCAS_T.forEach(m=>R.push(['mbm@'+m,'MB IF&E · '+m+' (todas las sedes)','c',null,null,{ind:1}]));
  R.push(['ctlMarca','Diferencia: Σ marcas + Corporativo − MB total (debe ser 0)','c',null,null,{l2:1,ctl:1}]);
  return R;
}

// ───────── Tabla de personal y gastos de línea (nacional) ─────────
function anioDe(cols){
  const months=cols.slice(0,12), yr={};
  for(const k in months[0]) yr[k]=months.reduce((a,r)=>a+(Number(r[k])||0),0);
  ratiosA(yr); if(yr.hc!=null) yr.hc=yr.hc/12; pctsA(yr);
  return yr;
}
// Sede: la tabla de personal compartido se suma a «Cargas del personal»
export function conPlanSede(cols,filas,P,ife){
  const pc=costoPlan(filas,{mb:cols.slice(0,12).map(r=>r.mb),lab:P.lab,tc:P.tc});
  for(let i=0;i<12;i++){ const r=cols[i];
    r.plan=pc.tot[i]; r.personal+=r.plan; r.gastos+=r.plan; r.mc+=r.plan;
    r.eEmp=ife?r.gastos:0; r.eMC=ife?0:r.mc; pctsA(r); }
  cols[13].plan=0; cols[12]=anioDe(cols);
  return cols;
}
// Base nacional para la hoja de línea y el prorrateo: unidades, facturación, MB y primas por sede (12 meses)
export function baseLineaA(T,sedes,corp){
  const m=(k)=>T.slice(0,12).map(r=>r[k]||0), prima={};
  sedes.forEach(s=>prima[s.sede]=s.cols.slice(0,12).map(r=>r.prima||0));
  const partes=sedes.map(s=>[s.sede,s.cols.slice(0,12).map(r=>r.venta||0)]);
  if(corp) partes.push(['corp',corp.slice(0,12).map(r=>r.venta||0)]);
  return {u:m('u'),venta:m('venta'),mb:m('mb'),prima,partes};
}
function prorratear(r,vtot,partes,i,glin){ partes.forEach(([k,v])=>{ const sh=vtot?(v[i]||0)/vtot:0; r['part@'+k]=sh; r['pro@'+k]=glin*sh; }); }
// Participación anual: facturación del año de cada parte sobre el total (no depende de que haya gastos)
function partAnual(r,B){ const vt=B.venta.reduce((a,x)=>a+x,0); B.partes.forEach(([k,v])=>{ r['part@'+k]=vt?v.reduce((a,x)=>a+x,0)/vt:0; }); }
function fixPart(r){
  for(const k in r) if(k.startsWith('pro@')){ const s=k.slice(4); if(r.glin) r['part@'+s]=r[k]/r.glin; if(r['mc@'+s]!=null) r['mcp@'+s]=r['mc@'+s]+r[k]; }
  if(r.glin!=null&&r.mc!=null){ r.cont=r.mc+r.glin; r.pctCont=(r.IF+r.eqp)?r.cont/(r.IF+r.eqp):0; }
}
// Hoja «Gastos de línea»: tabla de personal nacional + rubros, sobre la base nacional B
export function lineaA(st,B){
  const P=st.P, M=st.M, pc=costoPlan(st.T,{mb:B.mb,prima:B.prima,lab:P.lab,tc:P.tc}), out=[];
  for(let c=0;c<12;c++){
    const r={u:B.u[c],venta:B.venta[c],mb:B.mb[c],prima:Object.values(B.prima).reduce((a,x)=>a+(x[c]||0),0)};
    r.pFijo=pc.fijo[c]; r.pVar=pc.vari[c]; r.pLab=pc.lab[c]; r.personal=pc.tot[c];
    r.otros=Number(P.otros)||0; r.oper=r.otros; r.agua=Number(P.agua)||0; r.tienda=r.agua;
    r.viajes=Number(M.viajes&&M.viajes[c])||0; r.atenc=Number(M.atenc&&M.atenc[c])||0; r.repr=r.viajes+r.atenc;
    r.glin=r.personal+r.oper+r.tienda+r.repr;
    prorratear(r,B.venta[c],B.partes,c,r.glin);
    out.push(r);
  }
  const yr={}; for(const k in out[0]) if(!k.startsWith('part@')) yr[k]=out.reduce((a,r)=>a+(Number(r[k])||0),0);
  fixPart(yr); partAnual(yr,B);
  return [...out,yr,{}];
}
// Total: resta los gastos de línea y deja el prorrateo por sede y Corporativo
export function aplicarLineaA(T,L,B){
  for(let c=0;c<12;c++){ const r=T[c]; r.glin=L[c].glin; prorratear(r,B.venta[c],B.partes,c,r.glin); fixPart(r); }
  const y=T[12]; y.glin=L[12].glin;
  for(const k in T[0]) if(k.startsWith('pro@')) y[k]=T.slice(0,12).reduce((a,r)=>a+(r[k]||0),0);
  fixPart(y); partAnual(y,B); T[13].glin=0; fixPart(T[13]);
  return T;
}
export function rowsLinea(){
  const tot={src:'Total línea'};
  const R=[
    ['','Base nacional · sedes y Canal Corporativo','sec'],
    ['u','Número de unidades','c',null,null,Object.assign({int:1},tot)],
    ['venta','Facturación de vehículos (base del prorrateo)','c',null,null,tot],
    ['mb','MB IF&E nacional (base de las comisiones)','c',null,null,tot],
    ['prima','Primas netas de seguros · sedes','c',null,null,Object.assign({note:'Base del bono por primas'},tot)],
    ['','Gastos de línea · una sola vez para todo el país','sec'],
    ['personal','Cargas del personal de línea','g'],
    ['pFijo','Sueldos fijos','c',null,null,{ind:1,src:'Tabla de personal'}],
    ['pVar','Comisiones y bonos','c',null,null,{ind:1,src:'Tabla de personal'}],
    ['pLab','Costo laboral','c',null,{k:'lab',f:'pct',e:1,note:'Factor empresa sobre fijo + variable'},{ind:1}],
    ['oper','Gestión de operación','g'],
    ['otros','Otros, imprevistos','c',null,{k:'otros',f:'num',e:1,note:'Monto mensual (US$, en negativo)'},{ind:1}],
    ['tienda','Gestión de tienda','g'],
    ['agua','Útiles y oficina','c',null,{k:'agua',f:'num',e:1,note:'Monto mensual (US$, en negativo); la línea no tiene local'},{ind:1}],
    ['repr','Gastos de representación','g'],
    ['viajes','Viajes','in',null,null,{ind:1,m:'viajes'}],
    ['atenc','Atenciones a bancos y aseguradoras','in',null,null,{ind:1,m:'atenc'}],
    ['glin','Gastos de línea (nacional)','s',null,null,{cls:'gop'}],
    ['','Prorrateo a las sedes · por facturación de vehículos (criterio provisional)','sec']];
  SEDES_T.forEach(s=>{ R.push(['part@'+s,'Participación · '+s,'p']); R.push(['pro@'+s,'Asignado a '+s,'c',null,null,{ind:1}]); });
  R.push(['part@corp','Participación · Canal Corporativo','p']); R.push(['pro@corp','Asignado al Canal Corporativo','c',null,null,{ind:1}]);
  return R;
}
