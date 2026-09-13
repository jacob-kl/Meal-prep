// ── Week View ─────────────────────────────────────────────────────────
function WeekView({week,nutritionDB}) {
  const T = getT(useDark());
  const hasWeekend = !!(week.weekendMeals&&week.weekendMeals.length);
  const TABS = hasWeekend
    ? ["Dinners","Weekend","Jake","Laine","Breakfasts","Snacks"]
    : ["Dinners","Jake","Laine","Breakfasts","Snacks"];
  const jakeTabIdx = hasWeekend?2:1, laineTabIdx = hasWeekend?3:2, bfTabIdx = hasWeekend?4:3, snackTabIdx = hasWeekend?5:4;
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

      {hasWeekend&&tab===1&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.goldSoft,border:`1px solid ${T.tagBorder}`,borderRadius:10,padding:"10px 14px"}}>
            Weekend breakfast &amp; lunch, planned this week — nothing batched, made fresh each day.
          </div>
          {week.weekendMeals.map((d,i)=><DinnerCard key={i} dinner={d} week={week}/>)}
        </div>
      )}

      {tab===jakeTabIdx&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.blueSoft,border:`1px solid ${T.blue}22`,borderRadius:10,padding:"10px 14px"}}>
            {week.jakeBreakfast ? "Breakfast + two smaller lunches this week — all batch cooked Sunday, 5 containers each, same recipe all week." : "Batch cook Sunday — 5 containers, keeps all week."}
          </div>
          {week.jakeBreakfast&&<MealCard meal={week.jakeBreakfast} personLabel="Jake · Breakfast" personColor={T.blue}/>}
          <LunchSection lunch={week.jakeLunch} label="Jake · Lunch 1" labelColor={T.blue} personColor={T.blue}/>
          {week.jakeLunch2&&<LunchSection lunch={week.jakeLunch2} label="Jake · Lunch 2" labelColor={T.blue} personColor={T.blue}/>}
          {(week.jakeSnacks||[]).length>0&&(
            <div style={{marginTop:20}}>
              <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>Jake's Snacks — pick 1–2 per day</div>
              {week.jakeSnacks.map((s,i)=>(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                  <div style={{fontSize:15,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{s.name}</div>
                  <MacroRow macros={s.macros}/>
                  <div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
                  <MealRating mealKey={"jsnack_"+(s.name||"")}/>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab===laineTabIdx&&(
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

      {tab===bfTabIdx&&(
        <div>
          <div style={{fontSize:12,color:T.textLight,lineHeight:1.65,marginBottom:16,background:T.goldSoft,border:`1px solid ${T.tagBorder}`,borderRadius:10,padding:"10px 14px"}}>
            {week.jakeBreakfast ? "Laine's weekday rotation below. Jake's breakfast this week is on his tab — see Jake." : "Laine only — Jake has coffee."}
          </div>
          {(week.laineBreakfasts||[]).map((b,i)=><MealCard key={i} meal={b} personLabel="Laine" personColor={T.accent}/>)}
        </div>
      )}

      {tab===snackTabIdx&&(
        <div>
          {/* Tzatziki / other recipe card */}
          {week.tzatziki&&<MealCard meal={week.tzatziki} personLabel="Recipe" personColor={T.green}/>}
          {(week.jakeSnacks||[]).length>0&&(<>
            <div style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginTop:8,marginBottom:12}}>Jake's Snacks</div>
            {week.jakeSnacks.map((s,i)=>(
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{fontSize:15,fontWeight:500,color:T.text,fontFamily:"'Lora',serif",marginBottom:4}}>{s.name}</div>
                <MacroRow macros={s.macros}/><div style={{fontSize:12,color:T.textMid,lineHeight:1.6}}>{s.desc}</div>
                <MealRating mealKey={"jsnack_"+(s.name||"")}/>
              </div>
            ))}
          </>)}
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
