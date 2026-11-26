// Motor de FU-006-L (Lubricantes): una sola hoja nacional (2027), del Excel de Lubricantes de Daniel (26-nov-2026).
// Convención del Excel: ingresos en positivo y costos y gastos en negativo; cada subtotal es una suma.
// Montos en US$. La columna histórica sale de la posición 12 de cada insumo (por ahora vacía).
/* eslint-disable */

/** Valores del Excel (Mobil; responsable Sergio Portugal) */
export const XLUB={
  P:{},
  M:{
    vB2C:[3207.19,3007.56,3414.65,3462.35,3405.18,3649.34,3386.25,3670.07,3826.23,4113.2,3826.23,3347.95,0],
    vB2B:[321.69,301.67,342.5,347.28,341.55,366.04,339.65,368.12,383.78,412.57,383.78,335.81,0],
    fB2C:[2612117.79,2449522.09,2781083.43,2819929.71,2773369.97,2972223.32,2757952.79,2989108.2,3116297.39,3350019.69,3116297.39,2726760.21,0],
    fB2B:[232524.54,218050.65,247565.46,251023.46,246878.83,264580.28,245506.43,266083.33,277405.41,298210.82,277405.41,242729.74,0],
    cB2C:[-2187907.59,-2051717.58,-2329433.07,-2361970.69,-2322972.29,-2489531.68,-2310058.87,-2503674.44,-2610207.99,-2805973.59,-2610207.99,-2283931.99,0],
    cB2B:[-268190.37,-251496.41,-285538.35,-289526.76,-284746.4,-305162.99,-283163.49,-306896.59,-319955.31,-343951.96,-319955.31,-279960.9,0],
    desc:[219004.43,206680.43,241514.05,245389.57,232030.33,264057.41,231231.49,266089.66,269514.98,300971.51,289960.09,253715.08,0],
    bdf:[-1.0,0,85000.0,0,0,95000.0,0,0,95000.0,0,0,85000.0,0],
    flc:[-97394.56,-101159.86,-122817.08,-115556.45,-111629.95,-115556.45,-111629.95,-115556.45,-115556.45,-129827.35,-115556.45,-104790.17,0],
    promo:[-48700.0,-60200.0,-37000.0,-62000.0,-31500.0,-54600.0,-59900.0,-65100.0,-126500.0,-116900.0,-70800.0,-59000.0,0],
    t2:[-24506.59,-23086.58,-30259.17,-27528.0,-27741.46,-27594.26,-27528.0,-28274.2,-27265.31,-27343.69,-28293.68,-27687.68,0],
    t3:[-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,-10108.0,0],
    fijas:[-52426.54,-52231.29,-52231.29,-54704.54,-54704.54,-54704.54,-54704.54,-54704.54,-54704.54,-54704.54,-54704.54,-54704.54,0],
    vari:[-37670.39,-35629.38,-39791.35,-40278.97,-39694.53,-43329.66,-40640.0,-43541.61,-45138.17,-48072.0,-45138.17,-40248.45,0],
    clab:[-36667.24,-36569.61,-36569.61,-37806.24,-37806.24,-41890.36,-41890.36,-41890.36,-41890.36,-41890.36,-41890.36,-41890.36,0],
    hono:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0],
    serv:[-6681.06,-13563.7,-10601.82,-14641.13,-11883.25,-7940.77,-18652.5,-8252.7,-8729.13,-10666.6,-11703.5,-13563.7,0],
    tel:[-362.98,-735.09,-372.34,0.0,-781.29,-1556.69,-734.02,-738.08,-820.19,-875.82,-515.63,-735.09,0],
    segv:[-918.37,-929.93,-942.06,-929.72,-939.95,-954.11,-968.43,-970.59,-982.02,-1006.72,-1321.48,-929.93,0],
    util:[-196.16,-18.03,-49.62,-118.93,-179.03,-52.17,-333.75,-316.78,-61.31,-246.37,-48.48,-18.03,0],
    sumi:[-798.8,-617.56,-547.51,-572.66,-707.47,-253.0,-2214.63,-241.25,-675.5,-387.9,-302.47,-617.56,0],
    gaso:[-2868.91,-4284.76,-4615.0,-4751.5,-4579.43,-4289.34,-6152.72,-5002.92,-6922.8,-5490.77,-3860.58,-4284.76,0],
    canal:[-12323.5,-16409.44,-41309.44,-9609.44,-17409.44,-40309.44,-12102.91,-16502.91,-36302.91,-6302.91,-12402.91,-36302.91,0],
    brand:[-5415.27,-22517.98,-1500.0,-5800.0,-5500.0,-1500.0,-12517.98,-7500.0,-1500.0,-1500.0,-7500.0,-1500.0,0],
    b2b:[-1800.0,-4200.0,-2300.0,-2600.0,-4200.0,-2300.0,-1000.0,-2700.0,-2300.0,-1500.0,-2700.0,-1000.0,0],
    pas:[-2990.86,-2968.0,-2865.14,-2968.0,-2968.0,-2894.86,-2997.71,-2997.71,-2894.86,-2997.71,-2997.71,-2894.86,0],
    hosp:[-3302.86,-3177.14,-2971.43,-3245.71,-3177.14,-3017.14,-3291.43,-3222.86,-3017.14,-3291.43,-3222.86,-3017.14,0],
    movi:[-1990.86,-1933.71,-1888.0,-1945.14,-1933.71,-1906.29,-1963.43,-1952.0,-1906.29,-1963.43,-1952.0,-1906.29,0],
    alim:[-3161.14,-2989.71,-2852.57,-3024.0,-2989.71,-2907.43,-3078.86,-3044.57,-2907.43,-3078.86,-3044.57,-2907.43,0],
    edif:[-9120.41,-4498.19,-5160.21,-3122.37,-4343.51,-5958.88,-6093.05,-5482.54,-6776.97,-5496.42,-3794.29,-4498.19,0],
    eqt:[-4560.21,-2249.1,-2580.11,-1561.19,-2171.76,-2979.44,-3046.52,-2741.27,-3388.48,-2748.21,-1897.15,-2249.1,0],
    eqd:[-4560.21,-2249.1,-2580.11,-1561.19,-2171.76,-2979.44,-3046.52,-2741.27,-3388.48,-2748.21,-1897.15,-2249.1,0],
    depr:[-13051.51,-12201.61,-13848.32,-14083.46,-13818.86,-14895.34,-13741.47,-14985.19,-15609.71,-16805.25,-15699.67,-13721.03,0],
    rmant:[-301.63,-933.28,-391.13,-736.48,-338.81,-150.86,-1565.91,-303.78,-504.36,-776.88,-86.54,-933.28,0],
    limp:[0.0,-187.05,-620.76,0.0,0.0,0.0,0.0,-206.84,0.0,-428.34,-267.81,-187.05,0],
    inet:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0],
    elec:[-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,-664.29,0],
    agua:[-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,-172.86,0],
    cable:[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0],
    fianza:[-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,-5833.33,0]
  }
};

// [id, rubro, grupo o subtotal al que suma, fila del Excel, nota]
const IN=[
  ['vB2C','Volumen B2C','barr',9,'Barriles'],['vB2B','Volumen B2B','barr',10,'Barriles'],
  ['fB2C','Facturación B2C','fact',12],['fB2B','Facturación B2B','fact',13],
  ['cB2C','Costo B2C','costo',15,'En negativo'],['cB2B','Costo B2B','costo',16,'En negativo'],
  ['desc','(+) Descuentos tácticos','mb2',20],['bdf','(+) BDF · fondo de desarrollo de marca','mb2',21],['flc','(−) T1 · flete de compra','mb2',22,'En negativo'],
  ['promo','(−) Promociones tácticas','mb3',29,'En negativo'],['t2','(−) Fletes y gastos de distribución · T2','mb3',30,'En negativo'],['t3','(−) Transporte de carga interplaza · T3','mb3',31,'En negativo'],
  ['fijas','Fijas','rem',36],['vari','Variables','rem',37],['clab','Costo laboral','rem',38],['hono','Terceros · recibo por honorarios','rem',39],
  ['serv','Servicios varios','servG',43],['tel','Servicio telefónico','servG',44],['segv','Seguros varios','servG',45],['util','Útiles de escritorio','servG',46],['sumi','Suministros diversos','servG',47],['gaso','Gasolina y lubricantes','servG',48],
  ['canal','Plan al canal','mkt',53],['brand','Branding y otros','mkt',54],['b2b','Plan B2B','mkt',55],
  ['pas','Pasajes','repr',59],['hosp','Hospedaje','repr',60],['movi','Movilidad','repr',61],['alim','Alimentación','repr',62],
  ['edif','Edificaciones','alq',69],['eqt','Equipo de transporte','alq',70],['eqd','Equipos diversos','alq',71],
  ['depr','Depreciación','depm',74],['rmant','Reparación y mantenimiento','depm',75],['limp','Servicio de personal de limpieza','depm',76],
  ['inet','Internet','sbas',80],['elec','Electricidad','sbas',81],['agua','Agua','sbas',82],['cable','Cable','sbas',83],
  ['fianza','Carta de fianza','fin',87,'S/ 12,250,000 × 2 % ÷ 12 ÷ TC 3.5, en negativo']];

function linea(m){
  const r={}; IN.forEach(([k])=>r[k]=Number(m[k])||0);
  const g=(dest)=>IN.filter(x=>x[2]===dest).reduce((a,[k])=>a+r[k],0);
  r.barr=g('barr'); r.fact=g('fact'); r.costo=g('costo'); r.mb1=r.fact+r.costo;
  r.mb2=r.mb1+g('mb2'); r.mb3=r.mb2+g('mb3');
  ['rem','servG','mkt','repr','alq','depm','sbas','fin'].forEach(k=>r[k]=g(k));
  r.gop=r.rem+r.servG+r.mkt+r.repr; r.mc=r.mb3+r.gop;
  r.gest=r.alq+r.depm+r.sbas+r.fin; r.ro=r.mc+r.gest;
  return r;
}
/** [12 meses, año, histórico] */
export function computeL(st){
  const col=i=>{const m={}; for(const k in st.M) m[k]=st.M[k]&&st.M[k][i]; return linea(m);};
  const months=Array.from({length:12},(_,i)=>col(i));
  const yr={}; for(const k in months[0]) yr[k]=months.reduce((a,r)=>a+(Number(r[k])||0),0);
  const hayH=Object.values(st.M).some(a=>a&&Number(a[12]));
  return [...months,yr,hayH?col(12):{}];
}
export function rowsL(){
  const inp=(dest)=>IN.filter(x=>x[2]===dest).map(([k,lab,,x,note])=>[k,lab,'in',x,null,Object.assign({ind:1,m:k},note?{note}:{})]);
  const grp=(id,lab,x)=>[[id,lab,'g',x],...inp(id)];
  return [
    ['','Volumen y facturación','sec'],
    ['barr','Volumen · barriles','g',8],...inp('barr'),
    ['fact','Facturación bruta','g',11],...inp('fact'),
    ['costo','Costo','g',14],...inp('costo'),
    ['mb1','MB 1 · Transacción','s',17],['mb1','','p'],
    ['','Margen bruto','sec'],
    ...inp('mb2'),
    ['mb2','MB 2','s',24],['mb2','','p'],
    ...inp('mb3'),
    ['mb3','MB 3','s',32],['mb3','','p'],
    ['','Gastos de operación','sec'],
    ...grp('rem','Remuneraciones',35),...grp('servG','Servicios varios',42),...grp('mkt','Marketing',51),...grp('repr','Representación',58),
    ['gop','Gastos de operación','s',null,null,{cls:'gop'}],
    ['mc','Margen de contribución','s',64,null,{cls:'mc'}],['mc','','p'],
    ['','Gastos propios del negocio','sec'],
    ...grp('alq','Alquiler',68),...grp('depm','Depreciación y mantenimiento',73),...grp('sbas','Servicios básicos',79),...grp('fin','Financieros',86),
    ['gest','Gastos propios del negocio','s',null,null,{cls:'gop'}],
    ['ro','Resultado operativo','s',91,null,{cls:'mc'}],['ro','','p']];
}
