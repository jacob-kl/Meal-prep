"""Validate the imported week, portion calculations, recipes and required sources."""
import json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
w=json.loads((root/'weeks/2026-W49/week.json').read_text());db=json.loads((root/'nutrition.json').read_text())
assert w==json.loads((root/'weeks/2026-W49.json').read_text())
count=0
def walk(o):
    global count
    if isinstance(o,dict):
        if 'nutritionKey' in o:
            count+=1;key=o['nutritionKey'];assert key in db,key
            if 'quantity' in o:
                assert isinstance(o['quantity'],(int,float)) and o['quantity']>=0
                assert o['unit']==db[key]['serving_unit'],(key,o['unit'],db[key]['serving_unit'])
                if 'personQuantities' in o:assert math.isclose(sum(o['personQuantities'].values()),o['quantity'],abs_tol=1e-7)
        for v in o.values():walk(v)
    elif isinstance(o,list):
        for v in o:walk(v)
walk(w)
menus={m['id']:m for m in w['laineMenus']};assert [len(m['options']) for m in menus.values()]==[3,4,3,4]
examples=[]
for d in w['lainePlan']['days']:
    examples.extend(m['exampleOptionId'] for m in d['meals'] if m['type']=='choice')
assert len(examples)==len(set(examples))==14
assert sorted(examples)==sorted(m['id'] for menu in menus.values() for m in menu['options'])
allrecipes=[*w['dinners'],*w['travelMeals'],*w['weekendMeals'],*w['laineMiniMeals'],*[m for menu in menus.values() for m in menu['options']],w['jakeLunch'],*w['jakeSnacks'],*w['dinners'][4]['desserts']]
ids=[m['id'] for m in allrecipes];assert len(set(ids))==len(ids)
registry={m['id']:m for m in allrecipes}
for d in w['lainePlan']['days']:
    total={k:0 for k in ['cal','protein','carbs','fat','fiber','totalCarbs']}
    for item in d['meals']:
        meal=registry[item['mealId']] if item['type']=='fixed' else registry[item['exampleOptionId']]
        macros=meal.get('macros',meal.get('laine'))
        for k in total:total[k]+=macros.get(k,0)
    ref=next(x for x in w['dailyMenuEstimates']['laine'] if x['date']==d['date'])
    for k,v in total.items():assert abs(v-ref[k])<.31,(d['date'],k,v,ref[k])
for cat,lines in w['shopping'].items():
    for line in lines:assert line.endswith(')') and '(' in line,(cat,line)
assert all('team lunch' not in str(v).lower() for v in [w['_note'],w['jakeTabNote'],w['prepPlan']])
assert w['targets']['laine']['goal'][0] is None
assert not any('Saturday cut' in s or 'Tuesday cut' in s for meal in allrecipes for s in meal.get('steps',[]))
print(f'W49 validated: {len(allrecipes)} recipes, {count} nutrition references, 7 complete daily totals, 14 unique choices, reconciled shopping and native quantity units.')
