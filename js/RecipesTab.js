// ── Recipes ───────────────────────────────────────────────────────────
const THEME_ORDER = ["Chicken","Turkey","Beef","Pork","Fish","Shrimp","Eggs","Paneer","Beans","Pasta","Vegetarian"];
const THEME_COLOR = (T)=>({Chicken:T.gold,Turkey:T.gold,Beef:T.accent,Pork:T.accent,Fish:T.blue,Shrimp:T.blue,Eggs:T.gold,Paneer:T.green,Beans:T.green,Pasta:T.gold,Vegetarian:T.green});
function detectThemes(r){
  const hay=(r.name+" "+(r.obj.ingredients||[]).map(i=>(i.item||"")+" "+(i.nutritionKey||"")).join(" ")).toLowerCase();
  const meatRe=/chicken|beef|steak|flank|sirloin|pork|tenderloin|turkey|cod|salmon|tuna|sardine|\bfish\b|shrimp|prawn/;
  const t=[];
  if(/chicken/.test(hay))t.push("Chicken");
  if(/turkey/.test(hay))t.push("Turkey");
  if(/beef|steak|flank|sirloin/.test(hay))t.push("Beef");
  if(/pork|tenderloin/.test(hay))t.push("Pork");
  if(/cod|salmon|tuna|sardine|\bfish\b/.test(hay))t.push("Fish");
  if(/shrimp|prawn/.test(hay))t.push("Shrimp");
  if(/\beggs?\b|bhurji|scramble|omelet|frittata/.test(hay))t.push("Eggs");
  if(/paneer/.test(hay))t.push("Paneer");
  if(/bean|chickpea|garbanzo|lentil|chana|edamame|hummus/.test(hay))t.push("Beans");
  if(/pasta|penne|rotini|orzo|spaghetti|macaroni|gnocchi/.test(hay))t.push("Pasta");
  if(!meatRe.test(hay))t.push("Vegetarian");
  return t;
}
function RecipesTab({allWeeks}) {
  const T = getT(useDark());
  const [query,setQuery]=useState("");
  const [mealType,setMealType]=useState("All");
  const [themes,setThemes]=useState([]); // selected theme pills (OR-match)
  const MEAL_TYPES=["All","Breakfast","Lunch","Dinner","Snack","Sauce","Sides"];

  const recipes = useMemo(()=>{
    const ordered=[...allWeeks].reverse(); // newest first
    const byKey={};
    const add=(cat,o)=>{
      if(!o||!o.name)return;
      const obj = cat==="Snack" ? {...o, note:o.note||o.desc} : o;
      const key=cat+"::"+o.name.trim().toLowerCase();
      if(!byKey[key]) byKey[key]={category:cat,name:o.name,obj,weeks:[]};
    };
    ordered.forEach(w=>{
      (w.dinners||[]).forEach(d=>add("Dinner",d));
      add("Lunch",w.jakeLunch); add("Lunch",w.laineLunch);
      (w.laineBreakfasts||[]).forEach(b=>add("Breakfast",b));
      (w.jakeSnacks||[]).forEach(s=>add("Snack",s));
      (w.laineSnacks||[]).forEach(s=>add("Snack",s));
      add("Sauce",w.tzatziki);
      (w.extras||[]).forEach(e=>add(e.recipeCategory||"Sides",e));
    });
    ordered.forEach(w=>{
      const note=(cat,o)=>{if(!o||!o.name)return;const k=cat+"::"+o.name.trim().toLowerCase();if(byKey[k]&&!byKey[k].weeks.includes(w.label))byKey[k].weeks.push(w.label);};
      (w.dinners||[]).forEach(d=>note("Dinner",d));
      note("Lunch",w.jakeLunch); note("Lunch",w.laineLunch);
      (w.laineBreakfasts||[]).forEach(b=>note("Breakfast",b));
      (w.jakeSnacks||[]).forEach(s=>note("Snack",s));
      (w.laineSnacks||[]).forEach(s=>note("Snack",s));
      note("Sauce",w.tzatziki);
      (w.extras||[]).forEach(e=>note(e.recipeCategory||"Sides",e));
    });
    return Object.values(byKey).map(r=>({...r,themes:detectThemes(r)}));
  },[allWeeks]);

  // meal-type subset (before theme/text), used to derive which theme pills to show
  const typeSubset = recipes.filter(r=> mealType==="All" || r.category===mealType);
  const availableThemes = THEME_ORDER.filter(th=> typeSubset.some(r=>r.themes.includes(th)));
  // drop any selected themes no longer available
  const activeThemes = themes.filter(t=>availableThemes.includes(t));

  const q=query.trim().toLowerCase();
  const filtered = typeSubset.filter(r=>{
    if(activeThemes.length && !activeThemes.some(t=>r.themes.includes(t))) return false;
    if(!q) return true;
    if(r.name.toLowerCase().includes(q)) return true;
    if((r.obj.note||"").toLowerCase().includes(q)) return true;
    return (r.obj.ingredients||[]).some(i=>(i.item||"").toLowerCase().includes(q));
  });
  const order={Breakfast:0,Lunch:1,Dinner:2,Snack:3,Sauce:4,Sides:5};
  filtered.sort((a,b)=>(order[a.category]-order[b.category])||a.name.localeCompare(b.name));

  const tc=THEME_COLOR(T);
  const toggleTheme=(th)=>setThemes(p=>p.includes(th)?p.filter(x=>x!==th):[...p,th]);
  const selectType=(mt)=>{setMealType(mt);setThemes([]);};

  return (
    <div>
      {/* Search */}
      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T.textLight,pointerEvents:"none",fontSize:14}}>⌕</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search recipes or ingredients…"
          style={{width:"100%",boxSizing:"border-box",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:12,padding:"11px 38px 11px 36px",color:T.text,fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none"}}/>
        {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:T.tag,border:`1px solid ${T.tagBorder}`,borderRadius:14,width:22,height:22,color:T.textMid,fontSize:12,lineHeight:1}}>×</button>}
      </div>

      {/* Meal-type pills */}
      <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textLight,fontFamily:"'DM Mono',monospace",marginBottom:8}}>Meal</div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:18}}>
        {MEAL_TYPES.map(mt=>{const isA=mealType===mt;return(
          <button key={mt} onClick={()=>selectType(mt)} style={{padding:"7px 15px",borderRadius:20,fontSize:12,fontFamily:"'DM Mono',monospace",letterSpacing:"0.03em",cursor:"pointer",transition:"all 0.15s",background:isA?T.accent:T.tag,border:`1px solid ${isA?T.accent:T.tagBorder}`,color:isA?"#fff":T.textMid,fontWeight:isA?500:400}}>{mt}</button>
        );})}
      </div>

      {/* Theme pills (contextual) */}
      {availableThemes.length>0&&(
        <div style={{marginBottom:22}}>
          <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textLight,fontFamily:"'DM Mono',monospace",marginBottom:8}}>
            What are you feeling?{activeThemes.length>0&&<button onClick={()=>setThemes([])} style={{marginLeft:10,background:"none",border:"none",color:T.accent,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>clear</button>}
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {availableThemes.map(th=>{const isA=activeThemes.includes(th);const c=tc[th]||T.gold;return(
              <button key={th} onClick={()=>toggleTheme(th)} style={{padding:"5px 13px",borderRadius:20,fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.03em",cursor:"pointer",transition:"all 0.15s",background:isA?c+"22":T.tag,border:`1px solid ${isA?c:T.tagBorder}`,color:isA?c:T.textMid,fontWeight:isA?500:400}}>{th}</button>
            );})}
          </div>
        </div>
      )}

      <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textLight,fontFamily:"'DM Mono',monospace",marginBottom:16}}>
        {filtered.length} recipe{filtered.length!==1?"s":""}{q?` matching "${query}"`:""}
      </div>

      {filtered.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:T.textLight,fontSize:14}}>Nothing found. Try another filter.</div>}

      {filtered.map((r,idx)=>(
        <div key={r.category+r.name+idx} style={{marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",margin:"0 2px 6px"}}>
            <span style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",color:T.accent,border:`1px solid ${T.accent}44`,borderRadius:20,padding:"2px 8px"}}>{r.category}</span>
            {r.themes.filter(t=>t!=="Vegetarian"||r.themes.length===1).slice(0,3).map(th=>(
              <span key={th} style={{fontSize:9,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'DM Mono',monospace",color:(tc[th]||T.textLight),opacity:0.85}}>{th}</span>
            ))}
            <span style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{r.weeks.length>1?`${r.weeks.length} weeks`:r.weeks[0]}</span>
          </div>
          {r.category==="Dinner"
            ? <DinnerCard dinner={r.obj} week={{}}/>
            : <MealCard meal={r.obj} personLabel={r.category==="Sauce"?"Sauce":r.category==="Sides"?"Side":undefined} personColor={r.category==="Sauce"?T.green:r.category==="Sides"?T.gold:T.accent} forceOpen={false}/>}
        </div>
      ))}
    </div>
  );
}
