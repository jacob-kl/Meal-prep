const SHIRE_SLOTS={breakfast:"Breakfast",secondBreakfast:"Second Breakfast",elevenses:"Elevenses",afternoonTea:"Afternoon Tea",supper:"Supper",dessert:"Dessert"};
function ShireEmblem(){return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="43"/><circle cx="50" cy="50" r="36" strokeDasharray="1 7"/><path d="M30 72V47a20 20 0 0140 0v25M28 72h44M50 68V38m0 15c-13 0-15-10-15-10 12-2 15 10 15 10Zm0 5c13 0 15-10 15-10-12-2-15 10-15 10Z"/><circle cx="66" cy="65" r="1.8"/><path d="m50 12 2 4 4 1-4 2-2 4-2-4-4-2 4-1Z"/></svg>;}
function ShireSurface({children,compact=false}){
  return <ShireCtx.Provider value={true}><div className="shire-ui">
    <header className={"shire-hero"+(compact?" shire-hero--compact":"")}>
      <ShireEmblem/>
      <div><div className="shire-eyebrow">🍑 Laine's corner of Middle-earth</div><h2>There and Snack Again</h2><p>A Hobbit Pantry, well stocked for the week.</p></div>
    </header>{children}
  </div></ShireCtx.Provider>;
}
function shireMeal(week,id){
  const all=[...(week.laineMiniMeals||[]),...(week.travelMeals||[]),...(week.weekendMeals||[]),...(week.dinners||[]).flatMap(d=>[d,...(d.desserts||[])])];
  const m=all.find(m=>m.id===id);if(!m)return null;
  if(m.macros)return {...m,theme:"shire",person:"laine"};
  return {...m,theme:"shire",person:"laine",macros:m.laine,macrosNote:m.portions?.laine?"Your serving: "+m.portions.laine:"Nutrition for Laine's portion.",
    note:m.ingredientMode==="batch"?"The ingredient list makes the full shared batch. Your serving is listed above.":"The recipe lists both shared portions; Laine's nutrition is shown here.",ratingKey:"laine_"+m.id};
}
function LainePlan({week}){return <ShireSurface><LainePlanContent key={week.id} week={week}/></ShireSurface>;}
function LainePlanContent({week}){
  const T=useMealTheme();
  const days=week.lainePlan.days;
  const [date,setDate]=useState(()=>{const n=new Date(),today=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;return days.some(d=>d.date===today)?today:days[0].date;});
  const [log,setLog]=useState(()=>MealChoices.load(week));
  const [slotId,setSlotId]=useState("breakfast");
  const [notice,setNotice]=useState("");
  const day=days.find(d=>d.date===date)||days[0];
  const slots=day.meals.filter(s=>s.slot!=="dessert");
  const active=slots.find(s=>s.slot===slotId)||slots[0];
  const menu=active.type==="choice"?(week.laineMenus||[]).find(m=>m.id===active.menuId):null;
  const selected=log[date]?.[active.slot];
  const picked=menu?.options.find(o=>o.id===selected);
  const available=menu?MealChoices.available(week,log,date,menu.id):[];
  const choose=(id)=>{
    const result=MealChoices.choose(week,log,date,active.slot,id);
    if(!result.ok){setNotice(result.reason);return;}
    setLog(result.log);setNotice("");
    try{localStorage.setItem(MealChoices.storageKey(week),JSON.stringify(result.log));}
    catch{setNotice("Your choice is shown here, but this device could not save it. Keep this page open.");}
  };
  useEffect(()=>{const sync=e=>{if(e.key===MealChoices.storageKey(week))setLog(MealChoices.load(week));};window.addEventListener("storage",sync);return()=>window.removeEventListener("storage",sync);},[week.id]);
  const fixedMeals=active.type==="fixed"?[shireMeal(week,active.mealId),...(active.slot==="supper"?day.meals.filter(s=>s.slot==="dessert").map(s=>shireMeal(week,s.mealId)):[])].filter(Boolean):[];
  const choiceSlots=slots.filter(s=>s.type==="choice");
  const chosen=choiceSlots.filter(s=>log[date]?.[s.slot]).length;
  const todayMeals=day.meals.map(s=>s.type==="fixed"?shireMeal(week,s.mealId):(week.laineMenus.find(m=>m.id===s.menuId)?.options||[]).find(o=>o.id===log[date]?.[s.slot])).filter(Boolean);
  const totals=todayMeals.reduce((m,r)=>{for(const k of ["cal","protein","carbs","fat","fiber"])m[k]=(m[k]||0)+(r.macros?.[k]||0);return m;},{});
  const summary=Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,Math.round(v*10)/10]));
  return <>
    <div className="shire-days" aria-label="Choose a day">{days.map(d=><button key={d.date} onClick={()=>{setDate(d.date);setNotice("");}} aria-pressed={date===d.date}><span>{d.day.slice(0,3)}</span><strong>{d.date.slice(8)}</strong>{d.travel&&<small>Road day</small>}{d.sharedDay&&<small>Together</small>}</button>)}</div>
    <div className="shire-day-heading"><div><span className="shire-eyebrow">{day.travel?"Provisions for the journey":day.sharedDay?"Three meals, together":"A well-fed day in the Shire"}</span><h3>{day.day}'s menu</h3></div>{choiceSlots.length>0&&<span className="shire-progress">{chosen}/{choiceSlots.length} choices recorded</span>}</div>
    <nav className="shire-slot-tabs" aria-label="Hobbit meal times">{slots.map(s=>{
      const isChosen=Boolean(log[date]?.[s.slot]);
      const count=s.type==="choice"?MealChoices.available(week,log,date,s.menuId).length:null;
      return <button key={s.slot} onClick={()=>setSlotId(s.slot)} aria-pressed={active.slot===s.slot}>{isChosen&&<span aria-hidden="true">✓ </span>}{SHIRE_SLOTS[s.slot]}<small>{isChosen?"Recorded":s.type==="fixed"?(day.travel&&s.slot!=="supper"?"Packed for the road":"Planned"):count+" choices"}</small></button>;
    })}</nav>
    {notice&&<p className="shire-notice" role="status">{notice}</p>}
    <section aria-label={SHIRE_SLOTS[active.slot]}>
      <div className="shire-slot-heading"><h3>{menu?.title||(active.slot==="supper"?"Supper with the Fellowship":SHIRE_SLOTS[active.slot])}</h3><p>{menu?(picked?"Recorded for this day. Undo to choose something else.":"Choose one. It stays available only on this day once recorded."):"Your serving is shown below."}</p></div>
      {picked?<MealCard meal={picked} personLabel={"Laine · "+SHIRE_SLOTS[active.slot]} actions={<><span className="shire-recorded">✓ Recorded for {day.day}</span><button className="shire-undo" onClick={()=>choose(null)}>Undo choice</button></>}/>:
        menu?available.length?available.map(meal=><MealCard key={meal.id} meal={meal} personLabel={"Laine · "+menu.label} actions={<button className="shire-choose" onClick={()=>choose(meal.id)}>I had this <span aria-hidden="true">→</span></button>}/>):<p className="shire-empty">All choices in this meal have been recorded on other days. Open that day and undo a choice to return it to the menu.</p>:
        fixedMeals.map(meal=><MealCard key={meal.id} meal={meal} personLabel={"Laine · "+SHIRE_SLOTS[active.slot]}/>)
      }
    </section>
    {chosen===choiceSlots.length&&<div className="shire-day-total"><span className="shire-eyebrow">Today's planned portions</span><MacroRow macros={summary} netCarbs={true}/><p>Includes the fixed meals and the choices recorded above.</p></div>}
  </>;
}
