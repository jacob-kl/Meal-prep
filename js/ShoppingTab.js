// ── Shopping ──────────────────────────────────────────────────────────
// Parse a discrete countable quantity (2-8) from a shopping item string.
function parseItemCount(text) {
  // Range like "3–4 large" or "3-4 cans" → use upper bound
  const rangeM = text.match(/\b\d+\s*[–—\-]\s*([2-8])\b/);
  if (rangeM) return parseInt(rangeM[1]);
  // "N+" → use N (can always go back to the store)
  const plusM = text.match(/\b([2-8])\+/);
  if (plusM) return parseInt(plusM[1]);
  // Skip decimal weights like ~1.2 lbs — not a discrete count
  if (/~?\d+\.\d+\s*(lbs?|kg)\b/i.test(text)) return null;
  // "~N lbs" integer weight → treat as N segments
  const wtM = text.match(/~([2-8])\s*(lbs?|kg)\b/i);
  if (wtM) return parseInt(wtM[1]);
  // Exact count with countable unit
  const m = text.match(/\b([2-8])\s+(cans?|pints?|fillets?|cartons?|containers?|packs?|bags?|bottles?|jars?|bunches?|loaves?|boxes?|lbs?)\b/i);
  if (m) return parseInt(m[1]);
  // Bare number before a noun e.g. "3 large", "4 bell peppers"
  const bareM = text.match(/\b([2-8])\s+(large|medium|small|fresh|whole|pieces?|cloves?|heads?|stalks?|slices?|bell peppers?|peppers?|lemons?|limes?|avocados?|tomatoes?|apples?|oranges?)\b/i);
  if (bareM) return parseInt(bareM[1]);
  return null;
}
 
function SegmentedCircle({ total, filled, color, borderColor, size=22 }) {
  const cx=size/2, cy=size/2, r=(size-4)/2;
  const allFull = filled >= total;
  if (total === 1) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
        <circle cx={cx} cy={cy} r={r} fill={allFull?color:"none"} stroke={allFull?color:borderColor} strokeWidth="2"/>
        {allFull&&<path d={`M${cx-3.5} ${cy} l2.5 2.5 l4.5-4.5`} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>}
      </svg>
    );
  }
  const gap = 0.09;
  const sliceAngle = (2*Math.PI)/total;
  const segs = Array.from({length:total},(_,i)=>{
    const s=-Math.PI/2 + i*sliceAngle + gap/2;
    const e=-Math.PI/2 + (i+1)*sliceAngle - gap/2;
    const x1=cx+r*Math.cos(s), y1=cy+r*Math.sin(s);
    const x2=cx+r*Math.cos(e), y2=cy+r*Math.sin(e);
    const la=(e-s)>Math.PI?1:0;
    return (
      <path key={i}
        d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${la} 1 ${x2} ${y2}Z`}
        fill={i<filled?color:"none"}
        stroke={borderColor} strokeWidth="1.5" strokeLinejoin="round"
      />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={borderColor} strokeWidth="1.5"/>
      {segs}
      {allFull&&<path d={`M${cx-3.5} ${cy} l2.5 2.5 l4.5-4.5`} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>}
    </svg>
  );
}
 
function ShoppingTab({week}) {
  const T = getT(useDark());
  const SK="jl_shop_"+week.id;
  const [ck,setCk]=useState(()=>{try{return JSON.parse(localStorage.getItem(SK)||"{}");}catch{return {};}});
  const save=next=>{setCk(next);localStorage.setItem(SK,JSON.stringify(next));};
  const AK="jl_added_"+week.id;
  const [addedItems,setAddedItems]=useState(()=>{try{return JSON.parse(localStorage.getItem(AK)||"[]");}catch{return [];}});
  const saveAdded=items=>{setAddedItems(items);localStorage.setItem(AK,JSON.stringify(items));};
  const [newItem,setNewItem]=useState("");
  const [newQty,setNewQty]=useState("");
  const submitItem=()=>{
    const t=newItem.trim(); if(!t) return;
    saveAdded([...addedItems,{id:Date.now(),text:t,qty:newQty.trim(),count:0}]);
    setNewItem(""); setNewQty("");
  };
  const toggleAdded=(id,total)=>saveAdded(addedItems.map(x=>x.id===id?{...x,count:((x.count||0)+1)%(total+1)}:x));
  const removeAdded=id=>saveAdded(addedItems.filter(x=>x.id!==id));
  const cats=Object.entries(week.shopping||{});
  const catClr={"Must Buy":T.accent,"Check Supply":T.blue,"Already Have":T.green};
 
  let totalItems=0,doneItems=0;
  cats.forEach(([cat,items])=>items.forEach((item,i)=>{
    const raw=typeof item==="string"?item:item.display||item;
    const total=parseItemCount(raw)||1;
    const filled=Math.min(ck[cat+":"+i]||0,total);
    totalItems++; if(filled>=total) doneItems++;
  }));
 
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:13,color:T.textLight}}>{doneItems}/{totalItems} items</div>
        {Object.keys(ck).length>0&&<button onClick={()=>save({})} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textLight,padding:"4px 12px",fontSize:11}}>Clear all</button>}
      </div>
      {cats.map(([cat,items])=>(
        <div key={cat} style={{marginBottom:28}}>
          <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:catClr[cat]||T.gold,marginBottom:10,fontFamily:"'Lora',serif",paddingBottom:6,borderBottom:`1px solid ${T.divider}`}}>{cat}</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {items.map((item,i)=>{
              const k=cat+":"+i;
              const raw=typeof item==="string"?item:item.display||item;
              const total=parseItemCount(raw)||1;
              const filled=Math.min(ck[k]||0,total);
              const isDone=filled>=total;
              const clr=catClr[cat]||T.green;
              return (
                <div key={k} onClick={()=>save({...ck,[k]:(filled+1)%(total+1)})}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,cursor:"pointer",background:isDone?T.greenSoft:T.card,border:`1px solid ${isDone?clr+"30":T.border}`,transition:"background 0.15s,border 0.15s",userSelect:"none"}}>
                  <SegmentedCircle total={total} filled={filled} color={clr} borderColor={isDone?clr:T.textLight} size={22}/>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontSize:13,color:isDone?T.textLight:T.text,textDecoration:isDone?"line-through":"none",lineHeight:1.5}}>{raw}</span>
                    {total>1&&filled>0&&!isDone&&(
                      <span style={{marginLeft:8,fontSize:11,color:clr,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>
                        {filled}/{total} — need {total-filled} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Added Items */}
      {addedItems.length>0&&(
        <div style={{marginBottom:28}}>
          <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:T.gold,marginBottom:10,fontFamily:"'Lora',serif",paddingBottom:6,borderBottom:`1px solid ${T.divider}`}}>Added Items</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {addedItems.map(item=>{
              const at=parseInt(item.qty)||1;
              const af=item.count||0;
              const ad=af>=at;
              return(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,background:ad?T.greenSoft:T.card,border:`1px solid ${ad?T.gold+"30":T.border}`,transition:"background 0.15s,border 0.15s"}}>
                <div onClick={()=>toggleAdded(item.id,at)} style={{cursor:"pointer",flexShrink:0}}>
                  <SegmentedCircle total={at} filled={af} color={T.gold} borderColor={ad?T.gold:T.textLight} size={22}/>
                </div>
                <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>toggleAdded(item.id,at)}>
                  <span style={{fontSize:13,color:ad?T.textLight:T.text,textDecoration:ad?"line-through":"none",lineHeight:1.5}}>{item.text}{item.qty&&<span style={{color:T.textLight}}> — {item.qty}</span>}</span>
                  {at>1&&af>0&&!ad&&<span style={{marginLeft:8,fontSize:11,color:T.gold,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{af}/{at} — need {at-af} more</span>}
                </div>
                <button onClick={()=>removeAdded(item.id)} style={{background:"none",border:"none",color:T.textLight,fontSize:16,lineHeight:1,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
              </div>);
            })}
          </div>
        </div>
      )}

      {/* Add item form */}
      <div style={{borderTop:`1px solid ${T.divider}`,paddingTop:20,marginTop:4}}>
        <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:T.textLight,marginBottom:12,fontFamily:"'Lora',serif"}}>Add an item</div>
        <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitItem()}
            placeholder="Item" style={{flex:3,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none",minWidth:0}}/>
          <input value={newQty} onChange={e=>setNewQty(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitItem()}
            placeholder="Qty" style={{flex:1,background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none",minWidth:0}}/>
          <button onClick={submitItem} style={{background:T.accent,border:"none",borderRadius:10,color:"#fff",padding:"10px 18px",fontSize:13,fontFamily:"'DM Mono',monospace",cursor:"pointer",flexShrink:0}}>Add</button>
        </div>
      </div>
    </div>
  );
}
