// ── Nutrition Tab — full micro aggregation ────────────────────────────
function MicroBar({label,value,dri,unit,isUpper,color}) {
  const T = getT(useDark());
  const pct=Math.min(100,Math.round((value/dri)*100));
  const over=value>dri&&isUpper;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
        <span style={{fontSize:12,color:T.textMid,textTransform:"capitalize"}}>{label.replace(/_/g," ")}</span>
        <span style={{fontSize:11,fontFamily:"monospace",color:over?"#c05050":T.textLight}}>{value}{unit} <span style={{color:T.textLight}}>/ {dri}{unit}</span></span>
      </div>
      <div style={{height:6,background:T.divider,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:over?"#e07070":(color||T.gold),borderRadius:3,transition:"width 0.4s"}}/>
      </div>
      {over&&<div style={{fontSize:10,color:"#c05050",marginTop:2}}>↑ above limit</div>}
    </div>
  );
}
 
function NutritionTab({week,nutritionDB}) {
  const T = getT(useDark());
  const dark = useDark();
  const [person,setPerson]=useState("jake");
  const targets=week.targets&&week.targets[person];
  if(!targets) return null;
  const goal=targets.goal;
  const dri=nutritionDB._dri&&nutritionDB._dri[person];
 
  // ── Aggregate micros across all meals (Padre's approach) ────────────
  const microKeys = dri ? Object.keys(dri) : [];
  const weekMicros = {};
  microKeys.forEach(k=>weekMicros[k]=0);
 
  const allMeals = [
    ...(person==="jake"
      ? [...(week.jakeSnacks||[]).map(s=>({ingredients:s.ingredients||[]})), {ingredients:week.jakeLunch?.ingredients||[]}]
      : [...(week.laineSnacks||[]).map(s=>({ingredients:s.ingredients||[]})), {ingredients:week.laineLunch?.ingredients||[]}, ...(week.laineBreakfasts||[])]
    ),
    ...(week.dinners||[])
  ];
 
  allMeals.forEach(meal=>{
    (meal.ingredients||[]).forEach(ing=>{
      const dbEntry=nutritionDB[ing.nutritionKey];
      if(!dbEntry) return;
      if(dbEntry.micros) microKeys.forEach(k=>{if(dbEntry.micros[k]!=null) weekMicros[k]+=dbEntry.micros[k];});
      if(dbEntry.fiber!=null && weekMicros.fiber!=null) weekMicros.fiber+=dbEntry.fiber;
    });
  });
  const dailyMicros={};
  microKeys.forEach(k=>dailyMicros[k]=Math.round(weekMicros[k]/7));
 
  // Daily supplements are taken every single day — add at full value AFTER dividing weekly meals
  const supplements = (week.dailySupplements||{})[person]||[];
  supplements.forEach(supp=>{
    const dbEntry=nutritionDB[supp.nutritionKey];
    if(!dbEntry) return;
    if(dbEntry.micros) microKeys.forEach(k=>{if(dbEntry.micros[k]!=null) dailyMicros[k]=(dailyMicros[k]||0)+dbEntry.micros[k];});
    if(dbEntry.fiber!=null && dailyMicros.fiber!=null) dailyMicros.fiber=(dailyMicros.fiber||0)+dbEntry.fiber;
  });
 
  const color=person==="jake"?T.blue:T.accent;
  const bg=person==="jake"?T.blueSoft:T.accentSoft;
 
  // Water cells estimated pct — rough weekly avg vs goal
  const waterCells=[
    {label:"Calories",value:goal[0],unit:"kcal",pct:Math.round((targets.total[0]/goal[0])*100),color:"#c8814a",bg:dark?"#261a10":"#fdf6e8"},
    {label:"Protein", value:goal[1],unit:"g",   pct:Math.round((targets.total[1]/goal[1])*100),color:"#6b9e6b",bg:dark?"#131e13":"#edf5ed"},
    {label:"Carbs",   value:goal[2],unit:"g",   pct:Math.round((targets.total[2]/goal[2])*100),color:"#c8a96a",bg:dark?"#231e10":"#fdf4e3"},
    {label:"Fat",     value:goal[3],unit:"g",   pct:Math.round((targets.total[3]/goal[3])*100),color:"#7a9ec0",bg:dark?"#101c26":"#eef3f7"},
  ];
 
  return (
    <div>
      <div style={{display:"flex",gap:2,background:T.tag,borderRadius:7,padding:3,marginBottom:24,width:"fit-content"}}>
        {["jake","laine"].map(p=>(
          <button key={p} onClick={()=>setPerson(p)} style={{padding:"5px 18px",background:person===p?T.card:"none",border:"none",borderRadius:5,color:person===p?(p==="jake"?T.blue:T.accent):T.textLight,fontSize:11,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace"}}>{p}</button>
        ))}
      </div>
 
      {/* Water-level macro cells */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {waterCells.map(c=><WaterCell key={c.label} {...c} dark={dark}/>)}
      </div>
 
      {/* Breakdown table */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",marginBottom:16}}>
        <SectionLabel>Daily Breakdown</SectionLabel>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr>
                <th style={{textAlign:"left",padding:"6px 10px",color:T.textLight,fontWeight:400,fontFamily:"monospace",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:`1px solid ${T.divider}`}}>Meal</th>
                {[["cal","kcal"],["pro","g"],["carbs","g"],["fat","g"],["fiber","g"]].map(([k])=>(
                  <th key={k} style={{textAlign:"right",padding:"6px 8px",color:CLR[k]||T.textLight,fontWeight:400,fontFamily:"monospace",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",borderBottom:`1px solid ${T.divider}`}}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {targets.rows.map(([label,...vals],i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${T.divider}`}}>
                  <td style={{padding:"9px 10px",color:T.text,fontSize:13}}>{label}</td>
                  {vals.map((v,j)=><td key={j} style={{padding:"9px 8px",textAlign:"right",color:CLR[["cal","protein","carbs","fat","fiber"][j]]||T.textLight,fontFamily:"monospace",fontWeight:500,fontSize:12}}>{v}{j>0?"g":""}</td>)}
                </tr>
              ))}
              <tr style={{background:T.goldSoft}}>
                <td style={{padding:"9px 10px",color:T.textMid,fontFamily:"monospace",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em"}}>Goal</td>
                {goal.map((v,i)=><td key={i} style={{padding:"9px 8px",textAlign:"right",color:T.textMid,fontFamily:"monospace",fontWeight:500,fontSize:12}}>{v}{i>0?"g":""}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
 
      {/* Micros */}
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px"}}>
        <SectionLabel>Micronutrients — Est. Daily Average</SectionLabel>
        <div style={{fontSize:11,color:T.textLight,lineHeight:1.6,marginBottom:18,background:T.goldSoft,borderRadius:8,padding:"10px 12px"}}>
          Estimated from ingredient data averaged across the week. Mediterranean diet is naturally high in potassium, vitamin C, folate, and omega-3s.
        </div>
        {microKeys.length===0||Object.values(dailyMicros).every(v=>v===0)
          ?<div style={{fontSize:12,color:T.textLight}}>Add <code>nutritionKey</code> fields to ingredients in nutrition.json to see micronutrient estimates.</div>
          :<div style={{columns:"2 auto",columnGap:32}}>
            {/* Fiber first */}
            {dri?.fiber&&<MicroBar label="Fiber" value={goal[4]||0} dri={dri.fiber.dri} unit="g" isUpper={false} color={MICRO_CLR.fiber}/>}
            {microKeys.filter(k=>k!=="fiber").map(k=>{
              if(!dri[k]) return null;
              const val=dailyMicros[k]||0;
              return <MicroBar key={k} label={k} value={val} dri={dri[k].dri} unit={dri[k].unit==="mcg"?"mcg":dri[k].unit==="g"?"g":"mg"} isUpper={!!dri[k].upper} color={MICRO_CLR[k]||T.gold}/>;
            })}
          </div>
        }
      </div>
    </div>
  );
}
