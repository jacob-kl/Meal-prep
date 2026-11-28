// No React dependency: choice rules are shared by the UI and validation tests.
const MealChoices = (() => {
  function day(week,date){return (week.lainePlan?.days||[]).find(d=>d.date===date);}
  function menu(week,id){return (week.laineMenus||[]).find(m=>m.id===id);}
  function normalize(week,value){
    const clean={};
    if(!value||typeof value!=="object"||Array.isArray(value))return clean;
    const used={};
    for(const d of [...(week.lainePlan?.days||[])].sort((a,b)=>a.date.localeCompare(b.date))){
      const row=value[d.date];if(!row||typeof row!=="object")continue;
      for(const slot of d.meals.filter(s=>s.type==="choice")){
        const m=menu(week,slot.menuId),id=row[slot.slot];
        if(!m||!m.eligibleDates.includes(d.date)||!m.options.some(o=>o.id===id))continue;
        const k=m.id+":"+id;if(used[k])continue;used[k]=true;
        if(!clean[d.date])clean[d.date]={};clean[d.date][slot.slot]=id;
      }
    }
    return clean;
  }
  function available(week,log,date,menuId){
    const m=menu(week,menuId);if(!m||!m.eligibleDates.includes(date))return [];
    const used=new Set(Object.entries(normalize(week,log)).filter(([d])=>d!==date).map(([,r])=>r[menuId]).filter(Boolean));
    return m.options.filter(o=>!used.has(o.id));
  }
  function choose(week,log,date,slotId,optionId){
    const clean=normalize(week,log),d=day(week,date),slot=d?.meals.find(s=>s.slot===slotId&&s.type==="choice");
    if(!slot)return {ok:false,reason:"This meal is fixed for this day.",log:clean};
    if(optionId===null){
      const row={...(clean[date]||{})};delete row[slotId];
      if(Object.keys(row).length)clean[date]=row;else delete clean[date];
      return {ok:true,log:clean};
    }
    if(!available(week,clean,date,slot.menuId).some(o=>o.id===optionId))return {ok:false,reason:"That choice is already recorded on another day.",log:clean};
    return {ok:true,log:{...clean,[date]:{...(clean[date]||{}),[slotId]:optionId}}};
  }
  function storageKey(week){return "jl_laine_choices_"+week.id+"_v"+(week.lainePlan?.menuVersion||1);}
  function load(week){try{return normalize(week,JSON.parse(localStorage.getItem(storageKey(week))||"{}"));}catch{return {};}}
  return {normalize,available,choose,storageKey,load};
})();
