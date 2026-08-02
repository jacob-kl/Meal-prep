const { useState, useEffect, useContext, createContext, useCallback, useRef, useMemo } = React;
 
// ── Config ────────────────────────────────────────────────────────────
const WEEK_REGISTRY = [
  { id:"2026-W19", label:"Week of May 4, 2026" },
  { id:"2026-W20", label:"Week of May 11, 2026" },
  { id:"2026-W21", label:"Week of May 18, 2026" },
  { id:"2026-W22", label:"Week of May 25, 2026" },
  { id:"2026-W23", label:"Week of June 1, 2026" },
  { id:"2026-W24", label:"Week of June 8, 2026" },
  { id:"2026-W26", label:"Week of June 22, 2026" },
  { id:"2026-W29", label:"Week of July 13, 2026" },
  { id:"2026-W31", label:"Week of July 27, 2026" },
  { id:"2026-W32", label:"Week of August 3, 2026" },
];
const CURRENT_WEEK_ID = "2026-W32";
const WATER_GLASSES   = 8;
const WATER_OZ_EACH   = 16;
const WATER_TOTAL_OZ  = 128;
const WATER_KEY       = "jl_water";
const RATINGS_KEY     = "jl_ratings";
const DARK_KEY        = "jl_dark";
 
// ── Context ───────────────────────────────────────────────────────────
const SubsCtx    = createContext({ subs:{}, setSub:()=>{} });
const useSubs    = () => useContext(SubsCtx);
const DropCtx    = createContext({ openKey:null, setOpenKey:()=>{} });
const useDrop    = () => useContext(DropCtx);
const NutCtx     = createContext({});
const useNut     = () => useContext(NutCtx);
const DarkCtx    = createContext(false);
const useDark    = () => useContext(DarkCtx);
 
// ── Theme ─────────────────────────────────────────────────────────────
function getT(dark) {
  return dark ? {
    bg:"#1a1710", card:"#252218", border:"#3a3428",
    accent:"#d4765a", accentSoft:"#2e1f18",
    gold:"#c4a86e", goldSoft:"#231e14",
    green:"#5a9e6a", greenSoft:"#162018",
    blue:"#5a8eb0", blueSoft:"#131e28",
    text:"#e8e0d0", textMid:"#b8a888", textLight:"#7a6a58",
    divider:"#3a3428", tag:"#2a2418", tagBorder:"#4a3e2c",
    inputBg:"#2a2418",
  } : {
    bg:"#f5f0e8", card:"#ffffff", border:"#e8dfc8",
    accent:"#7a3e2e", accentSoft:"#f5ede0",
    gold:"#c4a86e", goldSoft:"#fdf4e3",
    green:"#3a6b4a", greenSoft:"#edf5ed",
    blue:"#2e5a7a", blueSoft:"#eef3f7",
    text:"#2a2418", textMid:"#6a5a48", textLight:"#9a8a6e",
    divider:"#e8dfc8", tag:"#f5f0e8", tagBorder:"#e0d5c0",
    inputBg:"#faf7f2",
  };
}
 
const CLR = { cal:"#c8814a", protein:"#6b9e6b", carbs:"#c8a96a", fat:"#7a9ec0", fiber:"#9e7ab5" };
const MICRO_CLR = {
  sodium:"#e07040", potassium:"#6b9e6b", calcium:"#c8a96a", vitamin_d:"#e8c040",
  magnesium:"#7ab0c0", zinc:"#a07ab0", vitamin_c:"#e8804a", vitamin_b12:"#6ab08a",
  iron:"#c05050", vitamin_a:"#e0a030", folate:"#70a870", phosphorus:"#8090c0", selenium:"#b08060",
  fiber:"#9e7ab5"
};
 
// ── Water helpers ─────────────────────────────────────────────────────
function getTodayKey() { const d=new Date(); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }
function loadWater() {
  try { const r=JSON.parse(localStorage.getItem(WATER_KEY)||"{}"); if(r.date!==getTodayKey()) return Array(WATER_GLASSES).fill(true); return r.glasses; }
  catch { return Array(WATER_GLASSES).fill(true); }
}
function saveWater(g) { localStorage.setItem(WATER_KEY,JSON.stringify({date:getTodayKey(),glasses:g})); }
 
// ── Rating helpers ────────────────────────────────────────────────────
function loadRatings() { try{return JSON.parse(localStorage.getItem(RATINGS_KEY)||"{}");}catch{return {};} }
function saveRatings(r) { localStorage.setItem(RATINGS_KEY,JSON.stringify(r)); }
const RATING_LABELS = {
  0:"Hard pass",1:"Not our thing",2:"Wouldn't make again",3:"Missing something",
  4:"It'll do",5:"Solid middle ground",6:"Genuinely enjoyed it",7:"Would request this again",
  8:"Really hit the spot",9:"Borderline perfect",10:"Make this every week!"
};
const SUBMIT_BTNS = [
  "🫒 That's a keeper","🍋 Squeeze it in","🧑‍🍳 Chef's kiss — save it",
  "🦐 Reel it in","🥗 Toss & save","🫙 Jar that rating",
  "🌿 Fresh take — saved","🍳 Plate it","🧄 Lock it in","🥂 Done — saved",
];
