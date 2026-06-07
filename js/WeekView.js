// ── Week View ─────────────────────────────────────────────────────────
function WeekView({week,nutritionDB}) {
  const T = getT(useDark());
  const TABS=["Dinners","Jake","Laine","Breakfasts","Snacks"];
  const [tab,setTab]=useState(0);
  return (
    <div>
      <TabBar tabs={TABS} active={tab} setActive={setTab}/>
 
      {tab===0&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.goldSoft,border:`1px solid ${T.tagBorder}`,borderRadius:10,padding:"10px 14px"}}>
            Every dinner cooked together — same recipe, different portions. Jake's is always bigger.
          </div>
          {week.dinners.map((d,i)=><DinnerCard key={i} dinner={d} week={week}/>)}
        </div>
      )}
 
      {tab===1&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.blueSoft,border:`1px solid ${T.blue}22`,borderRadius:10,padding:"10px 14px"}}>Batch cook Sunday — 5 containers, keeps all week.</div>
          <LunchSection lunch={week.jakeLunch} label="Jake" labelColor={T.blue} personColor={T.blue}/>
          <div style={{marginTop:20}}>
            <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Jake's Snacks — pick 1–2 per day</div>
            {(week.jakeSnacks||[]).map((s,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{fontSize:15,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{s.name}</div>
                <MacroRow macros={s.macros}/>
                <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
                <MealRating mealKey={"jsnack_"+(s.name||"")}/>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {tab===2&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.accentSoft,border:`1px solid ${T.accent}22`,borderRadius:10,padding:"10px 14px"}}>Mason jars batch-made Sunday. Dressing separate. Two sittings per jar.</div>
          <LunchSection lunch={week.laineLunch} label="Laine" labelColor={T.accent} personColor={T.accent}/>
          <div style={{marginTop:20}}>
            <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Laine's Snacks</div>
            {(week.laineSnacks||[]).map((s,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{fontSize:15,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{s.name}</div>
                <MacroRow macros={s.macros}/>
                <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
                <MealRating mealKey={"lsnack_"+(s.name||"")}/>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {tab===3&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.goldSoft,border:`1px solid ${T.tagBorder}`,borderRadius:10,padding:"10px 14px"}}>Laine only — Jake has coffee.</div>
          {(week.laineBreakfasts||[]).map((b,i)=><MealCard key={i} meal={b} personLabel="Laine" personColor={T.accent}/>)}
        </div>
      )}
 
      {tab===4&&(
        <div>
          {/* Tzatziki recipe card */}
          {week.tzatziki&&<MealCard meal={week.tzatziki} personLabel="Recipe" personColor={T.green}/>}
          <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:8,marginBottom:12}}>Jake's Snacks</div>
          {(week.jakeSnacks||[]).map((s,i)=>(
            <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
              <div style={{fontSize:15,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{s.name}</div>
              <MacroRow macros={s.macros}/><div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
              <MealRating mealKey={"jsnack_"+(s.name||"")}/>
            </div>
          ))}
          <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:20,marginBottom:12}}>Laine's Snacks</div>
          {(week.laineSnacks||[]).map((s,i)=>(
            <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
              <div style={{fontSize:15,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{s.name}</div>
              <MacroRow macros={s.macros}/><div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
              <MealRating mealKey={"lsnack_"+(s.name||"")}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
