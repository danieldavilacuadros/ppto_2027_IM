// Tabla de personal, común a los formatos que cargan gente (IF&E: sede y línea; Marketing: área).
/* eslint-disable */
// Puesto: {cargo, nombre, fijo (S/ al mes), tipo: 'ninguno'|'pctMB'|'pctPrima'|'pctFijo'|'monto', val (fracción, o S/ al mes),
//          desde, hasta (1-12), pSede, pDesde, pResto (solo pctPrima), rep: 'auto' | {marca: %} (solo en la sede)}
// Costo mensual en US$ (negativo): (fijo + variable) ÷ TC, más el costo laboral.
// ctx: {mb[12], prima{sede:[12]}, lab, tc, marcas:[{marca, venta[12]}]}
export function costoPlan(filas,ctx){
  const tc=Number(ctx.tc)||3.4, z=()=>Array(12).fill(0);
  const out={fijo:z(),vari:z(),lab:z(),tot:z(),filas:[],marcas:{}};
  (filas||[]).forEach(f=>{
    const fr={fijo:z(),vari:z(),lab:z(),tot:z()};
    for(let i=0;i<12;i++){
      if(i<(f.desde||1)-1||i>(f.hasta||12)-1) continue;
      const fijo=-(Number(f.fijo)||0)/tc; let v=0;
      if(f.tipo==='pctMB') v=-Math.max(0,(ctx.mb&&ctx.mb[i])||0)*(Number(f.val)||0);
      else if(f.tipo==='pctPrima'){ let b=0; for(const sd in (ctx.prima||{})){ const ini=sd===f.pSede?(f.pDesde||1):(f.pResto||1); if(i>=ini-1) b+=ctx.prima[sd][i]||0; } v=-b*(Number(f.val)||0); }
      else if(f.tipo==='pctFijo') v=fijo*(Number(f.val)||0);
      else if(f.tipo==='monto') v=-(Number(f.val)||0)/tc;
      const lab=(fijo+v)*(Number(ctx.lab)||0);
      fr.fijo[i]=fijo; fr.vari[i]=v; fr.lab[i]=lab; fr.tot[i]=fijo+v+lab;
    }
    ['fijo','vari','lab','tot'].forEach(k=>fr[k].forEach((x,i)=>out[k][i]+=x));
    if(ctx.marcas&&ctx.marcas.length){ // reparto por marca: automático por facturación o % a mano
      for(let i=0;i<12;i++){
        const vt=ctx.marcas.reduce((a,m)=>a+(m.venta[i]||0),0);
        ctx.marcas.forEach(m=>{ const sh=f.rep&&typeof f.rep==='object'?(Number(f.rep[m.marca])||0)/100:(vt?(m.venta[i]||0)/vt:0);
          out.marcas[m.marca]=(out.marcas[m.marca]||0)+fr.tot[i]*sh; });
      }
    }
    out.filas.push(fr);
  });
  return out;
}
