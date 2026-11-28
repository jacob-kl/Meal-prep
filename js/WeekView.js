function LegacyLaine({week,breakfastsOnly=false,snacksOnly=false}){
  return <ShireSurface compact={true}>
    {!breakfastsOnly&&!snacksOnly&&<>
      {week.laineTabNote&&<p className="shire-intro">{week.laineTabNote}</p>}
      {week.laineLunch&&<LunchSection lunch={week.laineLunch} label="Laine"/>}
      {week.laineLunch2&&<LunchSection lunch={week.laineLunch2} label="Laine · Jar 2"/>}
    </>}
    {breakfastsOnly?(week.laineBreakfasts||[]).map((meal,i)=><MealCard key={i} meal={meal} personLabel="Laine"/>):<>
      <h3 className="shire-section-title">A Hobbit's Provisions</h3>
      {week.laineSnackPrep&&<MealCard meal={week.laineSnackPrep} personLabel="Laine"/>}
      {(week.laineSnacks||[]).map((meal,i)=><MealCard key={i} meal={{...meal,note:meal.note||meal.desc,ratingKey:"lsnack_"+(meal.name||"")}} personLabel="Laine"/>)}
    </>}
  </ShireSurface>;
}
function JakeSnacks({week}){
  const T=useMealTheme();
  return <>{(week.jakeSnacks||[]).length>0&&<SectionLabel>{week.jakeSnacksOptional?"Jake's Optional Snacks & Shakes":"Jake's Snacks"}</SectionLabel>}
    {(week.jakeSnacks||[]).map((s,i)=><MealCard key={i} meal={{...s,note:s.note||s.desc,ratingKey:"jsnack_"+(s.name||"")}} personLabel="Jake" personColor={T.blue}/>)}</>;
}
function WeekView({week,nutritionDB}) {
  const T=getT(useDark());
  const hasPlan=Boolean(week.lainePlan?.days?.length);
  const tabs=["Dinners",...(week.travelMeals?.length?["Travel"]:[]),...(week.weekendMeals?.length?["Weekend"]:[]),"Jake","Laine",...(!hasPlan?["Breakfasts","Snacks"]:[])];
  const [tab,setTab]=useState("Dinners");
  const current=tabs.includes(tab)?tab:tabs[0];
  return <div>
    {week.prepPlan?.length>0&&<details className="week-prep" style={{background:T.card,border:`1px solid ${T.border}`,color:T.textMid}}>
      <summary>Weekly prep & packing</summary><div style={{paddingTop:12}}><Steps items={week.prepPlan}/></div>
    </details>}
    <TabBar tabs={tabs} active={tabs.indexOf(current)} setActive={i=>setTab(tabs[i])}/>
    {current==="Dinners"&&<>
      <p className="week-intro" style={{background:T.goldSoft,color:T.textMid,borderColor:T.tagBorder}}>{hasPlan?"Shared recipes, separately listed portions. Laine's smaller supper is included in her five-meal plan.":"Every dinner cooked together, with separately listed portions."}</p>
      {(week.dinners||[]).map((d,i)=><React.Fragment key={d.id||i}><DinnerCard dinner={d} week={week}/>{(d.desserts||[]).map((x,j)=><DinnerCard key={x.id||j} dinner={x} week={week}/>)}</React.Fragment>)}
    </>}
    {current==="Travel"&&<>
      <p className="week-intro" style={{background:T.blueSoft,color:T.textMid,borderColor:T.border}}>Thursday, December 3: shared road breakfast and thick thermos soup. Packing and reheating are in the weekly prep section above.</p>
      {week.travelMeals.map(m=><DinnerCard key={m.id} dinner={m} week={week}/>)}
    </>}
    {current==="Weekend"&&<>
      <p className="week-intro" style={{background:T.goldSoft,color:T.textMid,borderColor:T.tagBorder}}>{week.weekendNote||"Shared breakfasts and lunches."}</p>
      {week.weekendMeals.map((m,i)=><DinnerCard key={m.id||i} dinner={m} week={week}/>)}
    </>}
    {current==="Jake"&&<>
      {week.jakeTabNote&&<p className="week-intro" style={{background:T.blueSoft,color:T.textMid,borderColor:T.border}}>{week.jakeTabNote}</p>}
      {week.jakeBreakfast&&<MealCard meal={week.jakeBreakfast} personLabel="Jake · Breakfast" personColor={T.blue}/>}
      {week.jakeLunch&&<LunchSection lunch={week.jakeLunch} label="Jake · Lunch 1" labelColor={T.blue} personColor={T.blue}/>}
      {week.jakeLunch2&&<LunchSection lunch={week.jakeLunch2} label="Jake · Lunch 2" labelColor={T.blue} personColor={T.blue}/>}
      <JakeSnacks week={week}/>
    </>}
    {current==="Laine"&&(hasPlan?<LainePlan key={week.id} week={week}/>:<LegacyLaine week={week}/>)}
    {current==="Breakfasts"&&<LegacyLaine week={week} breakfastsOnly={true}/>}
    {current==="Snacks"&&<>
      {week.tzatziki&&<MealCard meal={week.tzatziki} personLabel="Recipe" personColor={T.green}/>}
      <JakeSnacks week={week}/><LegacyLaine week={week} snacksOnly={true}/>
    </>}
  </div>;
}
