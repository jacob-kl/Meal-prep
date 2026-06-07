// ── Rating Slider ─────────────────────────────────────────────────────
function MealRating({ mealKey }) {
  const T = getT(useDark());
  const [ratings, setRatings] = useState(loadRatings);
  const [pending, setPending] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [btn] = useState(()=>SUBMIT_BTNS[Math.floor(Math.random()*SUBMIT_BTNS.length)]);
  const trackRef = useRef(null);
  const timerRef = useRef(null);
  const saved = ratings[mealKey];
  const draft = pending!=null ? pending : saved;
  const isChanged = pending!=null && pending!==saved;
 
  const valFromE = e => {
    if(!trackRef.current) return 0;
    const r = trackRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.round(Math.max(0,Math.min(1,(cx-r.left)/r.width))*10);
  };
  const onStart = e => { setDragging(true); setPending(valFromE(e)); };
  const onMove  = e => { if(!dragging) return; e.preventDefault(); setPending(valFromE(e)); };
  const onEnd   = () => setDragging(false);
  const commit  = () => {
    if(pending==null) return;
    const next={...loadRatings(),[mealKey]:pending};
    saveRatings(next); setRatings(next); setPending(null);
    clearTimeout(timerRef.current);
    setShowSaved(true); timerRef.current=setTimeout(()=>setShowSaved(false),2200);
  };
  const ratingClr = v => v==null?T.textLight:v<=3?"#c05050":v<=6?T.gold:T.green;
 
  return (
    <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${T.divider}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:11,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase"}}>Rate this meal</span>
        <span style={{fontSize:11,fontWeight:500,color:showSaved?T.green:ratingClr(draft??null),transition:"color 0.2s",fontStyle:draft==null?"italic":"normal"}}>
          {showSaved?"✓ saved!":draft!=null?`${draft}/10 — ${RATING_LABELS[draft]}`:"drag to score"}
        </span>
      </div>
      <div ref={trackRef} style={{position:"relative",height:36,cursor:"ew-resize",userSelect:"none",touchAction:"none"}}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}>
        <div style={{position:"absolute",top:"50%",left:0,right:0,height:6,transform:"translateY(-50%)",background:T.divider,borderRadius:3}}>
          {draft!=null&&<div style={{height:"100%",width:`${(draft/10)*100}%`,background:`linear-gradient(to right,#c05050,${T.gold},${T.green})`,borderRadius:3,opacity:isChanged?0.6:1,transition:dragging?"none":"width 0.1s"}}/>}
        </div>
        {Array.from({length:11},(_,i)=>(
          <div key={i} style={{position:"absolute",top:"50%",left:`${(i/10)*100}%`,transform:"translate(-50%,-50%)",width:i===0||i===10?3:2,height:i===0||i===10?12:7,background:T.divider,borderRadius:1}}/>
        ))}
        {draft!=null
          ?<div style={{position:"absolute",top:"50%",left:`${(draft/10)*100}%`,transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:isChanged?"#e8c87a":ratingClr(draft),border:"2px solid white",boxShadow:"0 2px 8px rgba(0,0,0,0.2)",transition:dragging?"none":"left 0.1s,background 0.2s",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:9,fontWeight:700,color:"white",fontFamily:"monospace"}}>{draft}</span>
            </div>
          :<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:T.divider,border:`2px dashed ${T.textLight}`,zIndex:2}}/>
        }
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:10}}>
        <span style={{fontSize:9,color:T.textLight,fontFamily:"monospace"}}>0</span>
        <span style={{fontSize:9,color:T.textLight,fontFamily:"monospace"}}>10</span>
      </div>
      <div style={{overflow:"hidden",maxHeight:isChanged?48:0,opacity:isChanged?1:0,transition:"max-height 0.25s ease,opacity 0.2s ease"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:10}}>
          <button onClick={()=>setPending(saved??null)} style={{background:"none",border:"none",fontSize:11,color:T.textLight,padding:"4px 8px"}}>Cancel</button>
          <button onClick={commit} style={{background:T.accentSoft,border:`1px solid ${T.accent}`,borderRadius:20,padding:"7px 16px",fontSize:12,fontWeight:500,color:T.accent}}>
            {btn}
          </button>
        </div>
      </div>
      {saved!=null&&!isChanged&&!showSaved&&(
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <button onClick={()=>setPending(saved)} style={{background:"none",border:"none",fontSize:10,color:T.textLight,padding:0,textDecoration:"underline"}}>edit rating</button>
        </div>
      )}
    </div>
  );
}
 
// ── Water Tracker ─────────────────────────────────────────────────────
function WaterGlass({ full, onClick, index }) {
  const T = getT(useDark());
  const W=32,H=44;
  return (
    <button onClick={onClick} title={full?`Tap when you drink glass ${index+1}`:"Tap to undo"}
      style={{background:"none",border:"none",padding:4,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
        <clipPath id={`gc${index}`}><path d={`M5 3 L${W-5} 3 L${W-6.5} ${H-3} L6.5 ${H-3} Z`}/></clipPath>
        <rect x="0" y={full?6:H+2} width={W} height={H} fill="#7ab8d8" fillOpacity="0.85" clipPath={`url(#gc${index})`} style={{transition:"y 0.35s cubic-bezier(.4,0,.2,1)"}}/>
        {full&&<line x1="7" y1="10" x2={W-7} y2="10" stroke="#a8d4ea" strokeWidth="1" strokeOpacity="0.6"/>}
        <path d={`M4 3 L${W-4} 3 L${W-6} ${H-3} L6 ${H-3} Z`} fill="none" stroke={full?"#5a9ec0":T.text} strokeWidth={full?1.5:2} strokeLinejoin="round"/>
        {!full&&<text x={W/2} y={H/2+5} textAnchor="middle" fontSize="12" fill={T.text} fontWeight="bold">✓</text>}
      </svg>
      <span style={{fontSize:8,color:full?"#2e5a7a":T.textMid,fontFamily:"monospace"}}>{(index+1)*WATER_OZ_EACH}oz</span>
    </button>
  );
}
function WaterTracker() {
  const T = getT(useDark());
  const [glasses, setGlasses] = useState(loadWater);
  useEffect(()=>{
    const ms=()=>{const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);return m-n;};
    const t=setTimeout(()=>{const f=Array(WATER_GLASSES).fill(true);setGlasses(f);saveWater(f);},ms());
    return ()=>clearTimeout(t);
  },[glasses]);
  const toggle = i => setGlasses(prev=>{const n=[...prev];n[i]=!n[i];saveWater(n);return n;});
  const drunk=glasses.filter(g=>!g).length;
  const ozDone=drunk*WATER_OZ_EACH;
  const allDone=drunk===WATER_GLASSES;
  const pct=(ozDone/WATER_TOTAL_OZ)*100;
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 20px",marginBottom:24}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
        <div>
          <div style={{fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:"#2e5a7a",fontFamily:"'DM Mono',monospace",marginBottom:3}}>Water Today</div>
          <div style={{fontSize:13,fontFamily:"'Lora',serif",color:T.text}}>
            {allDone?"✓ Full gallon — nice.":`${ozDone}oz of ${WATER_TOTAL_OZ}oz · ${WATER_TOTAL_OZ-ozDone}oz to go`}
          </div>
        </div>
        <span style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",textAlign:"right",lineHeight:1.6}}>Tap when<br/>you drink it</span>
      </div>
      <div style={{height:4,background:T.divider,borderRadius:3,marginBottom:14,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(to right,#7ab8d8,#2e5a7a)",borderRadius:3,transition:"width 0.4s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {glasses.map((full,i)=><WaterGlass key={i} index={i} full={full} onClick={()=>toggle(i)}/>)}
      </div>
      {drunk>0&&!allDone&&(
        <button onClick={()=>{const f=Array(WATER_GLASSES).fill(true);setGlasses(f);saveWater(f);}} style={{marginTop:8,background:"none",border:"none",fontSize:10,color:T.textLight,padding:0}}>↺ Reset</button>
      )}
    </div>
  );
}
 
// ── Macro Water-Level Cells ───────────────────────────────────────────
function WaterCell({ label, value, unit, pct, color, bg, dark }) {
  const clamp = Math.min(Math.max(pct,0),100);
  const wc = color+"55", wc2 = color+"33";
  const [anim, setAnim] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnim(true),80);return()=>clearTimeout(t);},[pct]);
  return (
    <div style={{position:"relative",overflow:"hidden",background:bg,borderRadius:10,height:88}}>
      {/* Water fill */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:anim?`${clamp}%`:"0%",transition:"height 1.1s cubic-bezier(.4,0,.2,1)"}}>
        {/* Wave */}
        <div style={{position:"absolute",top:-8,left:0,width:"200%",height:14}}>
          <svg viewBox="0 0 200 14" width="100%" height="14" preserveAspectRatio="none" style={{display:"block",animation:"wave1 2.8s linear infinite"}}>
            <path d="M0 7 C25 1,50 13,75 7 S125 1,150 7 S175 13,200 7 L200 14 L0 14 Z" fill={wc}/>
          </svg>
          <svg viewBox="0 0 200 14" width="100%" height="14" preserveAspectRatio="none" style={{display:"block",position:"absolute",top:0,left:0,animation:"wave2 3.6s linear infinite",opacity:0.5}}>
            <path d="M0 7 C30 13,60 1,90 7 S140 13,170 7 S185 1,200 7 L200 14 L0 14 Z" fill={wc2}/>
          </svg>
        </div>
        <div style={{position:"absolute",inset:0,top:14,background:color+"18"}}/>
      </div>
      {/* Content */}
      <div style={{position:"relative",zIndex:2,padding:"12px 14px",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
        <div style={{fontSize:9,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.12em",color:color,opacity:0.85}}>{label}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:3}}>
          <span style={{fontSize:24,fontFamily:"'Lora',serif",color,fontWeight:500,lineHeight:1}}>{value}</span>
          <span style={{fontSize:10,color:color,opacity:0.6,fontFamily:"'DM Mono',monospace"}}>{unit}</span>
        </div>
        <div style={{height:2,background:"rgba(0,0,0,0.08)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${clamp}%`,background:color,borderRadius:2,transition:"width 1.1s cubic-bezier(.4,0,.2,1)"}}/>
        </div>
      </div>
    </div>
  );
}
 
// ── Sub Dropdown ──────────────────────────────────────────────────────
function SubDropdown({ ing }) {
  const T = getT(useDark());
  const { subs, setSub } = useSubs();
  const { openKey, setOpenKey } = useDrop();
  const ref = useRef(null);
  const isOpen = openKey===ing.subKey;
  const cur = subs[ing.subKey]||"default";
  const [ms, setMs] = useState({});
  const toggle = () => {
    if(!isOpen&&ref.current){const r=ref.current.getBoundingClientRect();const below=window.innerHeight-r.bottom;const mh=Math.min(280,44+ing.substitutions.length*52);setMs({top:Math.max(8,below>mh?r.bottom+6:r.top-mh-6),left:Math.min(r.left,window.innerWidth-230)});}
    setOpenKey(isOpen?null:ing.subKey);
  };
  return (
    <div style={{display:"inline-block"}}>
      <button ref={ref} onClick={toggle} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:5,color:T.textLight,padding:"1px 7px",fontSize:10,marginLeft:6}}>{isOpen?"▲":"▼"} swap</button>
      {isOpen&&(
        <div style={{position:"fixed",...ms,zIndex:1000,background:T.card,border:`1px solid ${T.gold}`,borderRadius:12,padding:6,width:220,boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
          <div onClick={()=>{setSub(ing.subKey,null);setOpenKey(null);}} style={{padding:"9px 12px",fontSize:12,cursor:"pointer",borderRadius:8,color:cur==="default"?T.green:T.textMid,background:cur==="default"?T.greenSoft:"none"}}>
            {ing.item} <span style={{color:T.textLight,fontSize:10}}>(original)</span>
          </div>
          {ing.substitutions.map(s=>(
            <div key={s.id} onClick={()=>{setSub(ing.subKey,s.id);setOpenKey(null);}} style={{padding:"9px 12px",fontSize:12,cursor:"pointer",borderRadius:8,color:cur===s.id?T.green:T.textMid,background:cur===s.id?T.greenSoft:"none"}}>
              {s.item}{s.note&&<div style={{fontSize:10,color:T.textLight,marginTop:2}}>{s.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
// ── UI Atoms ──────────────────────────────────────────────────────────
function MacroPill({label,value,unit,colorKey}) {
  const T = getT(useDark());
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,background:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:20,padding:"3px 10px",fontSize:11}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:CLR[colorKey],flexShrink:0}}/>
      <span style={{color:T.textLight,fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</span>
      <span style={{color:T.text,fontWeight:500}}>{value}{unit}</span>
    </span>
  );
}
function MacroRow({macros}) {
  const items=[["cal",macros.cal,"kcal"],["protein",macros.protein,"g"],["carbs",macros.carbs,"g"],["fat",macros.fat,"g"]];
  if(macros.fiber!=null) items.push(["fiber",macros.fiber,"g"]);
  return <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"8px 0 12px"}}>{items.map(([k,v,u])=><MacroPill key={k} label={k} value={v} unit={u} colorKey={k}/>)}</div>;
}
function SectionLabel({children}) {
  const T = getT(useDark());
  return <div style={{fontFamily:"'Lora',serif",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",color:T.textLight,marginBottom:12}}>{children}</div>;
}
function Steps({items}) {
  const T = getT(useDark());
  return <ol style={{paddingLeft:18,margin:0,display:"flex",flexDirection:"column",gap:8}}>{items.map((s,i)=><li key={i} style={{fontSize:13,lineHeight:1.65,color:T.textMid}}>{s}</li>)}</ol>;
}
function IngList({ingredients}) {
  const T = getT(useDark());
  const { subs } = useSubs();
  const resolved = (ingredients||[]).map(ing=>{
    if(!ing.subKey||!subs[ing.subKey]) return ing;
    const s=ing.substitutions&&ing.substitutions.find(s=>s.id===subs[ing.subKey]);
    return s?{...ing,item:s.item}:ing;
  });
  return (
    <ul style={{listStyle:"none",margin:0,padding:0,display:"flex",flexDirection:"column",gap:6}}>
      {resolved.map((ing,i)=>(
        <li key={i} style={{fontSize:13,color:T.textMid,display:"flex",alignItems:"flex-start"}}>
          <span style={{color:T.gold,marginRight:8,fontSize:10,marginTop:3,flexShrink:0}}>◆</span>
          <span>{ing.item}{ing.subKey&&ing.substitutions&&<SubDropdown ing={ing}/>}</span>
        </li>
      ))}
    </ul>
  );
}
 
// ── Meal Card ─────────────────────────────────────────────────────────
function MealCard({meal,personLabel,personColor,forceOpen}) {
  const T = getT(useDark());
  const [showIng,setShowIng]=useState(false);
  const [showSteps,setShowSteps]=useState(false);
  const mealKey=(meal.day||meal.days||"")+"_"+(personLabel||"")+"_"+(meal.name||"");
  const accentColor = personColor||T.accent;
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",marginBottom:12}}>
      {(meal.day||meal.days)&&<div style={{fontSize:10,color:accentColor,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{meal.day||meal.days}{personLabel?` · ${personLabel}`:""}</div>}
      <div style={{fontSize:16,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{meal.name}</div>
      {meal.macros&&<MacroRow macros={meal.macros}/>}
      {meal.macrosNote&&<div style={{fontSize:11,color:T.textLight,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>{meal.macrosNote}</div>}
      {meal.note&&<div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:10,fontStyle:"italic"}}>{meal.note}</div>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {meal.ingredients&&<button onClick={()=>setShowIng(!showIng)} style={{background:showIng?T.goldSoft:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.textMid}}>{showIng?"▲":"▼"} Ingredients</button>}
        {meal.steps&&<button onClick={()=>setShowSteps(!showSteps)} style={{background:showSteps?T.accentSoft:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.textMid}}>{showSteps?"▲":"▼"} Steps</button>}
      </div>
      {showIng&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.divider}`}}><SectionLabel>Ingredients</SectionLabel><IngList ingredients={meal.ingredients}/></div>}
      {showSteps&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.divider}`}}><SectionLabel>Method</SectionLabel><Steps items={meal.steps}/></div>}
      <MealRating mealKey={mealKey}/>
    </div>
  );
}
 
// ── Dinner Card ───────────────────────────────────────────────────────
function DinnerCard({dinner,week}) {
  const T = getT(useDark());
  const [showIng,setShowIng]=useState(false);
  const [showSteps,setShowSteps]=useState(false);
  const mealKey="dinner_"+(dinner.day||"")+"_"+(dinner.name||"");
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",marginBottom:12}}>
      <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{dinner.day}</div>
      <div style={{fontSize:16,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:6}}>{dinner.name}</div>
      {dinner.tzatzikiRef&&<div style={{fontSize:11,background:T.greenSoft,border:`1px solid ${T.green}22`,borderRadius:8,padding:"6px 10px",marginBottom:8,color:T.green,fontFamily:"'DM Mono',monospace"}}>🥣 {(dinner.sauceLabel||"Tzatziki")} night — see recipe card in the Recipes tab</div>}
      {dinner.note&&<div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:10,fontStyle:"italic"}}>{dinner.note}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        {[["Jake",dinner.jake,T.blue,T.blueSoft],["Laine",dinner.laine,T.accent,T.accentSoft]].map(([name,m,clr,bg])=>m&&(
          <div key={name} style={{background:bg,borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:10,color:clr,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{name}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {[["cal",m.cal,"kcal"],["pro",m.protein,"g"],["carbs",m.carbs,"g"],["fat",m.fat,"g"]].map(([k,v,u])=>(
                <span key={k} style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:clr,background:"rgba(255,255,255,0.5)",borderRadius:4,padding:"1px 6px"}}>{k} {v}{u}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {dinner.ingredients&&<button onClick={()=>setShowIng(!showIng)} style={{background:showIng?T.goldSoft:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.textMid}}>{showIng?"▲":"▼"} Ingredients</button>}
        {dinner.steps&&<button onClick={()=>setShowSteps(!showSteps)} style={{background:showSteps?T.accentSoft:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:20,padding:"4px 12px",fontSize:11,color:T.textMid}}>{showSteps?"▲":"▼"} Steps</button>}
      </div>
      {showIng&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.divider}`}}><SectionLabel>Ingredients</SectionLabel><IngList ingredients={dinner.ingredients}/></div>}
      {showSteps&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.divider}`}}><SectionLabel>Method</SectionLabel><Steps items={dinner.steps}/></div>}
      <MealRating mealKey={mealKey}/>
    </div>
  );
}
 
// ── Tab Bar ───────────────────────────────────────────────────────────
const ICONS = {
  Dinners:    ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 20h18M5 20V10a7 7 0 0114 0v10"/><path d="M12 3v3"/></svg>,
  Jake:       ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
  Laine:      ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  Breakfasts: ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2"/></svg>,
  Snacks:     ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2a4 4 0 014 4v1H8V6a4 4 0 014-4z"/><path d="M8 7v13h8V7"/></svg>,
  Shopping:   ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Nutrition:  ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
};
function TabBar({tabs,active,setActive}) {
  const T = getT(useDark());
  return (
    <div style={{display:"flex",gap:3,flexWrap:"wrap",background:T.tag,border:`1px solid ${T.border}`,borderRadius:14,padding:4,marginBottom:24}}>
      {tabs.map((t,i)=>{const Icon=ICONS[t];const isA=active===i;return(
        <button key={t} onClick={()=>setActive(i)} style={{flex:1,minWidth:72,padding:"8px 6px",background:isA?T.card:"none",border:`1px solid ${isA?T.border:"transparent"}`,borderRadius:10,color:isA?T.text:T.textLight,fontSize:10,letterSpacing:"0.04em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          {Icon&&<Icon/>}{t}
        </button>
      );})}
    </div>
  );
}
 
// ── Batch Lunch ───────────────────────────────────────────────────────
function scaleN(n,r){const v=Math.round(parseFloat(n)*r*8)/8;if(v===Math.floor(v))return String(v);const w=Math.floor(v),f=v-w;for(const[a,b,s]of[[1,8,"⅛"],[1,4,"¼"],[3,8,"⅜"],[1,2,"½"],[5,8,"⅝"],[3,4,"¾"],[7,8,"⅞"]])if(Math.abs(f-a/b)<0.07)return w>0?w+" "+s:s;return parseFloat((parseFloat(n)*r).toFixed(1)).toString();}
function scaleText(t,d){if(d===5)return t;return t.replace(/(\d+\.?\d*)\s*(lbs?|oz|kg|g|cups?|tbsp|tsp|cans?|pints?|ml)/gi,(m,n,u)=>scaleN(n,d/5)+" "+u);}
function LunchSection({lunch,label,labelColor,personColor}) {
  const T = getT(useDark());
  const [open,setOpen]=useState(false);
  const [days,setDays]=useState(5);
  const sIngs=(lunch.ingredients||[]).map(i=>({...i,item:scaleText(i.item||"",days)}));
  const sSteps=(lunch.steps||[]).map(s=>scaleText(s,days).replace(/5 containers/g,days+" container"+(days!==1?"s":"")).replace(/all 5/g,"all "+days));
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",marginBottom:12}}>
      <div style={{fontSize:10,color:labelColor,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>{label} · Batch Prep</div>
      <div style={{fontSize:16,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{lunch.name}</div>
      {lunch.note&&<div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:8,fontStyle:"italic"}}>{lunch.note}</div>}
      <MacroRow macros={lunch.macros}/>
      <button onClick={()=>setOpen(!open)} style={{background:open?T.goldSoft:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:20,padding:"4px 14px",fontSize:11,color:T.textMid}}>{open?"▲ Hide":"▼ Show"} recipe</button>
      {open&&(
        <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.divider}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <span style={{fontSize:11,color:T.textLight,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em"}}>Prepping for</span>
            <div style={{display:"flex",gap:3}}>
              {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setDays(n)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${days===n?personColor:T.tagBorder}`,background:days===n?personColor+"22":"none",color:days===n?personColor:T.textLight,fontSize:12,fontFamily:"'DM Mono',monospace"}}>{n}</button>)}
            </div>
            <span style={{fontSize:11,color:T.textLight}}>day{days!==1?"s":""}</span>
          </div>
          {days<5&&<div style={{background:T.accentSoft,borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,color:T.accent,lineHeight:1.5}}>Scaled to {days} day{days!==1?"s":""}.</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><SectionLabel>Ingredients — {days} portion{days!==1?"s":""}</SectionLabel>
              <IngList ingredients={sIngs}/>
            </div>
            <div><SectionLabel>Method</SectionLabel><ol style={{paddingLeft:18,margin:0,display:"flex",flexDirection:"column",gap:8}}>{sSteps.map((s,i)=><li key={i} style={{fontSize:13,lineHeight:1.65,color:T.textMid}}>{s}</li>)}</ol></div>
          </div>
        </div>
      )}
      <MealRating mealKey={"lunch_"+label+"_"+(lunch.name||"")}/>
    </div>
  );
}
