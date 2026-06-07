function App() {
  const [dark,setDark]=useState(()=>{const s=localStorage.getItem(DARK_KEY);if(s!=null)return s==="true";return window.matchMedia("(prefers-color-scheme: dark)").matches;});
  const T = getT(dark);
  const [mainTab,setMainTab]=useState(0);
  const [allWeeks,setAllWeeks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [nutritionDB,setNutritionDB]=useState({});
  const [subs,setSubs]=useState(()=>{try{return JSON.parse(localStorage.getItem("jl_subs")||"{}");}catch{return {};}});
  const setSub=useCallback((k,v)=>setSubs(p=>{const n={...p};if(v==null)delete n[k];else n[k]=v;localStorage.setItem("jl_subs",JSON.stringify(n));return n;}),[]);
  const [openKey,setOpenKey]=useState(null);
 
  useEffect(()=>{
    document.body.className=dark?"dark":"light";
    document.body.style.setProperty("--scroll-track",dark?"#1a1710":"#f5f0e8");
  },[dark]);
 
  useEffect(()=>{
    fetch("nutrition.json").then(r=>r.json()).then(setNutritionDB).catch(()=>{});
    (async()=>{
      try{
        const results=await Promise.all(WEEK_REGISTRY.map(async({id,label})=>{
          const res=await fetch("weeks/"+id+".json");
          if(!res.ok) throw new Error("Could not load "+id+".json");
          return{...await res.json(),id,label};
        }));
        setAllWeeks(results);
      }catch(e){setError(e.message);}
      finally{setLoading(false);}
    })();
  },[]);
 
  const currentWeek=allWeeks.find(w=>w.id===CURRENT_WEEK_ID);
  const MAIN_TABS=["This Week","Shopping","Nutrition","Recipes","Past Weeks"];
 
  if(loading) return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",color:T.textLight,fontSize:13,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em"}}>Loading…</div>;
  if(error) return <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}}><div style={{color:T.accent,fontFamily:"'Lora',serif",fontSize:18,marginBottom:8}}>Something's off</div><div style={{color:T.textLight,fontSize:11}}>{error}</div></div></div>;
 
  return (
    <DarkCtx.Provider value={dark}>
    <DropCtx.Provider value={{openKey,setOpenKey}}>
    <SubsCtx.Provider value={{subs,setSub}}>
    <NutCtx.Provider value={nutritionDB}>
      <div style={{minHeight:"100vh",background:T.bg,color:T.text,padding:"40px 20px 80px",transition:"background 0.3s,color 0.3s"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
 
          {/* Header */}
          <div style={{marginBottom:24,borderBottom:`1px solid ${T.divider}`,paddingBottom:24}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.textLight,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>Mediterranean · Meal Plan</div>
                <h1 style={{fontFamily:"'Lora',serif",fontSize:"clamp(2rem,6vw,3.2rem)",fontWeight:400,lineHeight:1.1,color:T.text}}>
                  Jake <span style={{color:T.gold}}>&amp;</span> <span style={{color:T.accent,fontStyle:"italic"}}>Laine.</span>
                </h1>
                {currentWeek&&<div style={{fontSize:11,color:T.textLight,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:10}}>{currentWeek.label}</div>}
              </div>
              <DarkToggle dark={dark} setDark={setDark}/>
            </div>
          </div>
 
          <WaterTracker/>
 
          {/* Nav */}
          <div style={{display:"flex",gap:3,background:T.tag,border:`1px solid ${T.border}`,borderRadius:14,padding:4,marginBottom:28,maxWidth:520}}>
            {MAIN_TABS.map((t,i)=>(
              <button key={t} onClick={()=>setMainTab(i)} style={{flex:1,padding:"9px 12px",background:mainTab===i?T.card:"none",border:`1px solid ${mainTab===i?T.border:"transparent"}`,borderRadius:10,color:mainTab===i?T.text:T.textLight,fontSize:12,fontWeight:mainTab===i?500:400,transition:"all 0.15s"}}>{t}</button>
            ))}
          </div>
 
          {mainTab===0&&currentWeek&&<WeekView week={currentWeek} nutritionDB={nutritionDB}/>}
          {mainTab===1&&currentWeek&&<ShoppingTab week={currentWeek}/>}
          {mainTab===2&&currentWeek&&<NutritionTab week={currentWeek} nutritionDB={nutritionDB}/>}
          {mainTab===3&&<RecipesTab allWeeks={allWeeks}/>}
          {mainTab===4&&<HistoryTab allWeeks={allWeeks} nutritionDB={nutritionDB}/>}
 
          <div style={{marginTop:64,paddingTop:28,borderTop:`1px solid ${T.divider}`,textAlign:"center"}}>
            <div style={{fontFamily:"'Lora',serif",fontSize:"clamp(1.1rem,3vw,1.4rem)",fontWeight:400,fontStyle:"italic",color:T.textLight}}>
              Love you both. <span style={{color:T.accent}}>♥</span>
            </div>
          </div>
        </div>
      </div>
    </NutCtx.Provider>
    </SubsCtx.Provider>
    </DropCtx.Provider>
    </DarkCtx.Provider>
  );
}
ReactDOM.render(<App/>, document.getElementById("root"));
