// ── Pantry — What Can I Make? ─────────────────────────────────────────

const STAPLE_KEYS = new Set([
  "Olive oil","Lemon juice",
  "Spices (garam masala/turmeric/cumin/coriander)",
  "Spices (oregano/thyme/cumin/paprika/salt)",
  "Sugar (white)",
]);
const STAPLE_RE = /\b(olive oil|\boil\b|salt|black pepper|spice|garam masala|turmeric|cumin|coriander|paprika|cayenne|chili|chilli|water|baking powder|baking soda|sugar|lemon juice|vinegar|cilantro|dried mint|fresh cilantro)\b/i;

function parseName(itemStr) {
  return (itemStr||'').split(/\s*[—–\-]\s*/)[0].trim();
}

function PantryMatchCard({r, T}) {
  const [open, setOpen] = useState(false);
  const canMake = r.missing.length === 0;
  const statusColor = canMake ? T.green : r.missing.length === 1 ? T.gold : T.accent;

  return (
    <div style={{marginBottom:6}}>
      {/* Header row */}
      <div onClick={()=>setOpen(o=>!o)} style={{
        display:"flex",alignItems:"center",gap:10,padding:"12px 14px",
        background:T.card,border:`1px solid ${canMake ? T.green+"50" : T.border}`,
        borderRadius: open ? "12px 12px 0 0" : 12,
        cursor:"pointer",transition:"border-color 0.15s",userSelect:"none"
      }}>
        <span style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",
          fontFamily:"'DM Mono',monospace",color:T.accent,
          border:`1px solid ${T.accent}44`,borderRadius:20,padding:"2px 8px",flexShrink:0}}>
          {r.category}
        </span>
        <span style={{flex:1,fontSize:13,color:T.text,minWidth:0,
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {r.name}
        </span>
        <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",
          color:statusColor,flexShrink:0}}>
          {canMake ? `✓ all ${r.total}` : `need ${r.missing.length}`}
        </span>
        <span style={{color:T.textLight,fontSize:11,flexShrink:0}}>{open?"▲":"▼"}</span>
      </div>

      {/* Missing chips — shown collapsed when not full match */}
      {!canMake && !open && (
        <div style={{
          display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,
          padding:"8px 14px",background:T.tag,
          border:`1px solid ${T.border}`,borderTop:"none",
          borderRadius:"0 0 12px 12px"
        }}>
          <span style={{fontSize:10,color:T.textLight,fontFamily:"'DM Mono',monospace"}}>missing:</span>
          {r.missing.map((ing,i)=>(
            <span key={i} style={{fontSize:11,color:T.accent,fontFamily:"'DM Mono',monospace",
              background:T.accent+"18",border:`1px solid ${T.accent}30`,
              borderRadius:12,padding:"2px 9px"}}>
              {parseName(ing.item)}
            </span>
          ))}
        </div>
      )}

      {/* Expanded: ingredient coverage + full recipe card */}
      {open && (
        <div style={{border:`1px solid ${T.border}`,borderTop:"none",
          borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
          {/* Ingredient coverage chips */}
          <div style={{padding:"10px 14px",background:T.tag,
            borderBottom:`1px solid ${T.divider}`}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {(r.obj.ingredients||[])
                .filter(i=>i.item&&!i.item.trim().startsWith("↳"))
                .map((ing,i)=>{
                  const isMissing = r.missing.some(m=>m.item===ing.item);
                  const c = isMissing ? T.accent : T.green;
                  return (
                    <span key={i} style={{fontSize:11,fontFamily:"'DM Mono',monospace",
                      color:c,background:c+"15",border:`1px solid ${c}30`,
                      borderRadius:12,padding:"2px 9px"}}>
                      {isMissing?"✗":"✓"} {parseName(ing.item)}
                    </span>
                  );
              })}
            </div>
          </div>
          {/* Full recipe */}
          <div style={{padding:"2px"}}>
            {r.category==="Dinner"
              ? <DinnerCard dinner={r.obj} week={{}}/>
              : <MealCard meal={r.obj} personColor={T.accent} forceOpen={true}/>
            }
          </div>
        </div>
      )}
    </div>
  );
}

function PantryTab({allWeeks}) {
  const T = getT(useDark());
  const [pantry, setPantry] = useState(()=>{
    try{return JSON.parse(localStorage.getItem('jl_pantry')||'[]');}catch{return [];}
  });
  const [input, setInput] = useState('');
  const [useStaples, setUseStaples] = useState(()=>{
    try{const v=localStorage.getItem('jl_pantry_staples');return v===null?true:JSON.parse(v);}
    catch{return true;}
  });

  const savePantry = items => {
    setPantry(items);
    localStorage.setItem('jl_pantry', JSON.stringify(items));
  };
  const toggleStaples = v => {
    setUseStaples(v);
    localStorage.setItem('jl_pantry_staples', JSON.stringify(v));
  };

  const addItem = () => {
    const t = input.trim().toLowerCase();
    if(!t || pantry.includes(t)) return;
    savePantry([...pantry, t]);
    setInput('');
  };
  const removeItem = t => savePantry(pantry.filter(p=>p!==t));

  // Aggregate recipes from all weeks (same pattern as RecipesTab)
  const recipes = useMemo(()=>{
    const ordered = [...allWeeks].reverse();
    const byKey = {};
    const add = (cat, o) => {
      if(!o||!o.name) return;
      const k = cat+"::"+o.name.trim().toLowerCase();
      if(!byKey[k]) byKey[k] = {category:cat, name:o.name, obj:o};
    };
    ordered.forEach(w=>{
      (w.dinners||[]).forEach(d=>add("Dinner",d));
      add("Lunch",w.jakeLunch); add("Lunch",w.laineLunch);
      (w.laineBreakfasts||[]).forEach(b=>add("Breakfast",b));
      (w.extras||[]).forEach(e=>add(e.recipeCategory||"Sides",e));
      add("Sauce",w.tzatziki);
    });
    return Object.values(byKey);
  }, [allWeeks]);

  // Score each recipe against the current pantry
  const scored = useMemo(()=>{
    if(pantry.length===0) return [];

    const isCovered = ing => {
      const item = (ing.item||'').toLowerCase();
      const key  = (ing.nutritionKey||'').toLowerCase();
      // staple shortcut
      if(useStaples && (STAPLE_RE.test(ing.item) || STAPLE_KEYS.has(ing.nutritionKey))) return true;
      // match any pantry token against item text or nutritionKey
      return pantry.some(p => {
        if(item.includes(p) || key.includes(p)) return true;
        // also try individual words (so "salmon fillet" matches "salmon")
        return p.split(/\s+/).filter(w=>w.length>3).some(w=>item.includes(w)||key.includes(w));
      });
    };

    return recipes
      .map(r => {
        const ings = (r.obj.ingredients||[])
          .filter(i => i.item && !i.item.trim().startsWith("↳"));
        if(!ings.length) return null;
        const missing = ings.filter(i => !isCovered(i));
        return {...r, missing, total: ings.length};
      })
      .filter(Boolean)
      .filter(r => r.missing.length <= 2)
      .sort((a,b) =>
        a.missing.length - b.missing.length ||
        (b.total - b.missing.length) - (a.total - a.missing.length)
      );
  }, [recipes, pantry, useStaples]);

  const groups = [
    {label:"Can make now",  color:T.green,  items: scored.filter(r=>r.missing.length===0)},
    {label:"Missing 1",     color:T.gold,   items: scored.filter(r=>r.missing.length===1)},
    {label:"Missing 2",     color:T.accent, items: scored.filter(r=>r.missing.length===2)},
  ].filter(g => g.items.length > 0);

  return (
    <div>
      {/* ── Input ── */}
      <div style={{marginBottom:22}}>
        <div style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",
          color:T.textLight,fontFamily:"'DM Mono',monospace",marginBottom:10}}>
          What's in your fridge / pantry?
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addItem()}
            placeholder="Type an ingredient and hit Enter…"
            style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,
              borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,
              fontFamily:"'DM Mono',monospace",outline:"none"}}
          />
          <button onClick={addItem}
            style={{background:T.accent,border:"none",borderRadius:10,color:"#fff",
              padding:"10px 18px",fontSize:13,fontFamily:"'DM Mono',monospace",
              cursor:"pointer",flexShrink:0}}>
            Add
          </button>
        </div>

        {/* Ingredient chips */}
        {pantry.length>0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
            {pantry.map(p=>(
              <div key={p} style={{display:"flex",alignItems:"center",gap:5,
                padding:"5px 8px 5px 12px",background:T.card,
                border:`1px solid ${T.border}`,borderRadius:20,
                fontSize:12,color:T.text,fontFamily:"'DM Mono',monospace"}}>
                {p}
                <button onClick={()=>removeItem(p)}
                  style={{background:"none",border:"none",color:T.textLight,
                    fontSize:15,lineHeight:1,cursor:"pointer",padding:"0 2px"}}>×</button>
              </div>
            ))}
            <button onClick={()=>savePantry([])}
              style={{padding:"5px 12px",background:"none",
                border:`1px solid ${T.border}`,borderRadius:20,
                color:T.textLight,fontSize:11,
                fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>
              clear all
            </button>
          </div>
        )}

        {/* Staples toggle */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div onClick={()=>toggleStaples(!useStaples)} style={{
            width:36,height:20,borderRadius:10,cursor:"pointer",
            transition:"background 0.2s",flexShrink:0,position:"relative",
            background:useStaples?T.green:T.tag,
            border:`1px solid ${useStaples?T.green:T.border}`
          }}>
            <div style={{
              position:"absolute",top:2,
              left:useStaples?18:2,
              width:16,height:16,borderRadius:"50%",
              background:"#fff",transition:"left 0.2s",
              boxShadow:"0 1px 3px rgba(0,0,0,0.25)"
            }}/>
          </div>
          <span style={{fontSize:12,color:T.textMid,fontFamily:"'DM Mono',monospace"}}>
            Assume I have common staples (oil, salt, spices, lemon)
          </span>
        </div>
      </div>

      {/* ── Empty state ── */}
      {pantry.length===0 && (
        <div style={{textAlign:"center",padding:"60px 0",color:T.textLight}}>
          <div style={{fontSize:32,marginBottom:12}}>🥘</div>
          <div style={{fontSize:14}}>Add what you have and we'll find what you can make.</div>
        </div>
      )}

      {/* ── No matches ── */}
      {pantry.length>0 && scored.length===0 && (
        <div style={{textAlign:"center",padding:"40px 0",color:T.textLight,fontSize:14}}>
          No close matches yet — try adding a few more ingredients.
        </div>
      )}

      {/* ── Results ── */}
      {groups.map(g=>(
        <div key={g.label} style={{marginBottom:28}}>
          <div style={{
            fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",
            color:g.color,marginBottom:10,fontFamily:"'Lora',serif",
            paddingBottom:6,borderBottom:`1px solid ${T.divider}`
          }}>
            {g.label}
            <span style={{color:T.textLight,fontSize:10,fontFamily:"'DM Mono',monospace",
              textTransform:"none",letterSpacing:0,marginLeft:8}}>
              — {g.items.length} recipe{g.items.length!==1?"s":""}
            </span>
          </div>
          {g.items.map(r=>(
            <PantryMatchCard key={r.category+r.name} r={r} T={T}/>
          ))}
        </div>
      ))}
    </div>
  );
}
