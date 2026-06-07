// ── History ───────────────────────────────────────────────────────────
function HistoryTab({allWeeks,nutritionDB}) {
  const T = getT(useDark());
  const [viewing,setViewing]=useState(null);
  const past=allWeeks.filter(w=>w.id!==CURRENT_WEEK_ID).reverse();
  if(viewing) return (
    <div>
      <button onClick={()=>setViewing(null)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMid,padding:"7px 14px",fontSize:12,marginBottom:24}}>← Back</button>
      <div style={{fontSize:13,color:T.accent,fontFamily:"'Lora',serif",marginBottom:20}}>{viewing.label}</div>
      <WeekView week={viewing} nutritionDB={nutritionDB}/>
    </div>
  );
  if(!past.length) return <div style={{textAlign:"center",padding:"60px 0",color:T.textLight,fontSize:14}}>No past weeks yet.</div>;
  return (
    <div>
      <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textLight,fontFamily:"'DM Mono',monospace",marginBottom:16}}>{past.length} past week{past.length!==1?"s":""}</div>
      {past.map(week=>(
        <div key={week.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div>
            <div style={{fontSize:15,fontFamily:"'Lora',serif",color:T.text,marginBottom:4}}>{week.label}</div>
            <div style={{fontSize:11,color:T.textLight,fontFamily:"monospace"}}>{(week.dinners||[]).length} dinners</div>
          </div>
          <button onClick={()=>setViewing(week)} style={{background:T.accentSoft,border:`1px solid ${T.tagBorder}`,borderRadius:8,color:T.accent,padding:"7px 14px",fontSize:12}}>View</button>
        </div>
      ))}
    </div>
  );
}
 
// ── Dark Mode Toggle ──────────────────────────────────────────────────
function DarkToggle({dark,setDark}) {
  const T = getT(dark);
  return (
    <button onClick={()=>{setDark(!dark);localStorage.setItem(DARK_KEY,String(!dark));document.body.className=!dark?"dark":"light";}}
      style={{background:T.tag,border:`1px solid ${T.border}`,borderRadius:20,padding:"5px 14px",fontSize:11,color:T.textMid,display:"flex",alignItems:"center",gap:7,transition:"all 0.2s"}}>
      <span style={{fontSize:14}}>{dark?"☀️":"🌙"}</span>
      <span style={{fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase"}}>{dark?"Light":"Dark"}</span>
    </button>
  );
}
 
// ── App ───────────────────────────────────────────────────────────────
