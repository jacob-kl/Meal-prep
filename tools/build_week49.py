"""Rebuild the approved W49 plan; all nutrition and grocery amounts are calculated."""
from __future__ import annotations
import json
from collections import defaultdict
from pathlib import Path
import week49_plan as p

ROOT=Path(__file__).resolve().parents[1]
db=json.loads((ROOT/'nutrition.json').read_text())
for key in ['Peaches','Mushrooms']:
    db[key]={**p.DB[key], 'serving':'per 100 g raw edible portion', 'micros':{},
             'source':'USDA standard reference; micronutrients not supplied in this plan'}
db['Eggs (large)']['carbs']=.36
nutrition={**{k:v for k,v in db.items() if k.startswith('_')},**{k:db[k] for k in sorted(db) if not k.startswith('_')}}
(ROOT/'nutrition.json').write_text(json.dumps(nutrition,ensure_ascii=False,indent=2)+'\n')
N={'thigh':'Boneless, skinless chicken thighs, raw','pork':'Pork loin, raw','turkey':'Ground turkey 93/7, raw','roast_turkey':'Turkey breast, cooked','salmon':'Salmon, raw','egg':'Large eggs','bacon':'Bacon, cooked','milk':'Unsweetened almond milk','whey':'Whey isolate','oikos':'Oikos Triple Zero','cc':'4% cottage cheese','cheddar':'Block cheddar','swiss':'Swiss cheese','cream':'Heavy cream','butter':'Butter','flour':'Almond flour','pecan':'Pecans','pepper':'Bell pepper','romaine':'Romaine','cabbage':'Green cabbage','celery':'Celery','cuke':'Cucumber','cauli':'Cauliflower','beans':'Green beans','zuc':'Zucchini','mayo':'Avocado-oil mayonnaise','dijon':'Dijon mustard','garlic':'Minced garlic','lime':'Lime juice','vinegar':'Rice vinegar','oil':'Olive oil','parm':'Grated Parmesan','sausage':'Mild bulk pork sausage, raw','avocado':'Avocado flesh','sour':'Sour cream','steak':'Steak, raw','ricotta':'Part-skim ricotta','creamcheese':'Cream cheese','broth':'Low-sodium beef broth','ab':'Almond butter','peach':'Unsweetened peach slices','mushroom':'Mushrooms','asparagus':'Asparagus','cilantro':'Fresh cilantro'}
def amount(k,q):
    return f'{q:g} '+('egg' if q==1 else 'eggs') if k=='egg' else f'{q:g} g'
def rounded(m):
    return {k:round(v,1) for k,v in {'cal':m['cal'],'protein':m['protein'],'carbs':m['net'],'fat':m['fat'],'fiber':m['fiber'],'totalCarbs':m['carbs']}.items()}
def macro(ing):return rounded(p.macros(ing))
def ingredients(ing,persons=None):
    out=[]
    for k,q in ing.items():
        key=p.aliases[k];f=p.conv.get(k,1)
        obj={'item':f'{N[k]} - {amount(k,q)}','nutritionKey':key,'quantity':round(q*f,9),'unit':db[key]['serving_unit'],'displayQuantity':q,'displayUnit':'egg' if k=='egg' else 'g'}
        if persons:
            obj['personQuantities']={who:round(food.get(k,0)*f,9) for who,food in persons.items()}
            obj['item']=N[k]+' - '+', '.join(f'{who.title()} {amount(k,food.get(k,0))}' for who,food in persons.items())
        out.append(obj)
    return out
def recipe(id,name,ing,steps,**extras):
    return {'id':id,'name':name,'macros':macro(ing),'ingredients':ingredients(ing),'steps':steps,'netCarbs':True,**extras}

themed={'B1':"Samwise's Morning Hearth",'B2':"The Green Dragon Egg Cup",'B3':"Rivendell Ricotta",'S1':"Second Breakfast at Bag End",'S2':"Merry's Trail Plate",'S3':"Pippin's Pocket Provisions",'S4':"Brandybuck's Garden Bowl",'E1':"Faramir's Crunch Jar",'E2':"Samwise's Garden Jar",'E3':"Roast Pork from Bree",'T1':"The Ranger's Roll-ups",'T2':"The Shire's Cheddar Dip",'T3':"Fellowship Trail Plate",'T4':"Lothlorien Cheesecake Bowl"}
options={}
for key,(slot,name,ing,step,desc) in p.options.items():
    options[key]=recipe('w49-'+key.lower(),name,ing,[step],shireName=themed[key],person='laine',theme='shire',note='One small serving.',recipeCategory='Breakfast' if key[0]=='B' else 'Lunch' if key[0]=='E' else 'Snack',ratingKey='laine_w49_'+key)

dates=['2026-11-30','2026-12-01','2026-12-02','2026-12-03','2026-12-04','2026-12-05','2026-12-06']
dinner_aliases=['Supper at the Prancing Pony',"Gondor's Mini Meatloaves","Samwise's Lime Chicken",'The Green Dragon Skillet','Rivendell Salmon',"Rohan's Steak Supper",'The Bag End Sunday Roast']
dinners=[]
for i,d in enumerate(p.dinners):
    ings=ingredients(p.add(d['j'],d['l']),{'jake':d['j'],'laine':d['l']})
    for a in ings:
        a['item']+=' (raw weight)' if a['unit']=='g_raw' else ''
    dinners.append({'id':'w49-dinner-'+str(i),'day':d['day']+' ('+dates[i]+')','date':dates[i],'name':d['name'],'shireName':dinner_aliases[i],'jake':macro(d['j']),'laine':macro(d['l']),'ingredients':ings,'steps':d['steps'],'netCarbs':True,'recipeCategory':'Dinner','note':"Laine's supper is half of a comparable former Laine serving. Use the separately listed portions."})

dessert={'id':'w49-dessert','day':'Friday dessert (December 4)','name':'Peach-pecan crumble with cold cream','shireName':"The Shire's Peach Crumble",'jake':macro(p.dessert),'laine':macro(p.dessert),'ingredients':ingredients(p.mul(p.dessert,2),{'jake':p.dessert,'laine':p.dessert}),
 'steps':['Heat oven to 350 F. Divide 100 g chopped unsweetened peaches and 1/4 tsp cinnamon between two 8 oz ramekins.','Rub the 16 g butter into the 24 g almond flour, 16 g pecans and 1-2 tsp cup-for-cup monk fruit/erythritol blend. Divide over the fruit.','Bake 20-25 min until golden and bubbling. Rest 10 min. Serve each ramekin with 18 g cold cream.'],'note':'50 g peach per person; the ramekins will be partly filled. Use unsweetened fruit and a sweetener without sugar or dextrose.','netCarbs':True,'recipeCategory':'Dessert'}
dinners[4]['desserts']=[dessert]

weekend=[]
shared_alias={'FB':"A Bag End Breakfast",'FL':"The Green Dragon Lettuce Boats",'SB':"Merry's Saturday Scramble",'SL':"The Bree Market Lunch",'UB':"Bilbo's Sunday Waffles",'UL':"The Ranger's Sunday Stacks"}
for key,(day,name,j,l,step) in p.shared.items():
    weekend.append({'id':'w49-'+key.lower(),'day':day,'date':dates[4 if key[0]=='F' else 5 if key[0]=='S' else 6],'name':name,'shireName':shared_alias[key],'jake':macro(j),'laine':macro(l),'ingredients':ingredients(p.add(j,l),{'jake':j,'laine':l}),'steps':[step],'netCarbs':True,'recipeCategory':'Breakfast' if key[1]=='B' else 'Lunch'})

travel=[
 {'id':'w49-tb','day':'Thursday road breakfast (December 3)','date':dates[3],'name':'Bacon-cheddar mini egg bites','shireName':"Bilbo's Road Bites",'jake':macro(p.travel['TB']['j']),'laine':macro(p.travel['TB']['l']),'ingredients':ingredients(p.road_bites,{'jake':p.travel['TB']['j'],'laine':p.travel['TB']['l']}),'ingredientMode':'batch','batchYield':'12 mini egg bites','portions':{'jake':'8 mini egg bites','laine':'4 mini egg bites'},'netCarbs':True,'recipeCategory':'Breakfast',
 'steps':['Heat oven to 350 F. Brush 12 silicone mini-muffin wells with the 6 g butter.','Whisk the 4 eggs with 30 g cream. Fold in 30 g finely chopped cooked bacon and 50 g cheddar. Divide evenly between the 12 wells.','Bake 12-16 min until set and 160 F in the center. Serve 8 bites for Jake and 4 for Laine.']},
 {'id':'w49-tl','day':'Thursday thermos lunch (December 3)','date':dates[3],'name':'Thick turkey, bacon and cauliflower chowder','shireName':'The Prancing Pony Chowder','jake':macro(p.travel['TL']['j']),'laine':macro(p.travel['TL']['l']),'ingredients':ingredients(p.road_soup,{'jake':p.travel['TL']['j'],'laine':p.travel['TL']['l']}),'ingredientMode':'batch','batchYield':'800 g finished thick soup','portions':{'jake':'500 g soup','laine':'300 g soup'},'netCarbs':True,'recipeCategory':'Lunch',
 'steps':['Cut cauliflower small. Simmer it in the broth with butter and garlic, covered, for 12-15 min until very tender.','Blend the cauliflower mixture with cream and cream cheese until smooth. Return to low heat and stir in cheddar gradually.','Add finely shredded cooked turkey, chopped cooked bacon and 1/2 tsp smoked paprika. Stir gently to 165 F throughout.','Weigh the finished soup; add only enough hot water to bring the batch to 800 g. Keep it thick and spoonable. Serve Jake 500 g and Laine 300 g.']}
]
for meal in travel:
    # The method makes the complete batch, so its ingredient list must too.
    ing=p.road_bites if meal['id'].endswith('tb') else p.road_soup
    meal['ingredients']=ingredients(ing)

mini=[]
for day,foods in p.weekend_snacks.items():
    for idx,food in enumerate(foods):
        name=('Cottage cheese and pecans' if idx==0 else 'Turkey and cheddar mini plate')
        steps=['Serve the measured ingredients together; keep nuts separate until eating.']
        mini.append(recipe(f'w49-mini-{day}-{idx}',name,food,steps,theme='shire',shireName=('Second Breakfast in the Shire' if idx==0 else "Afternoon Tea at Bag End"),person='laine',date=dates[day],recipeCategory='Snack'))

menus=[]
slot_info=[('B','breakfast','Breakfast','Breakfast at Bag End'),('S','secondBreakfast','Second Breakfast','A Proper Second Breakfast'),('E','elevenses','Elevenses','Elevenses on the Road'),('T','afternoonTea','Afternoon Tea','Afternoon Tea in the Shire')]
for prefix,id,label,title in slot_info:
    menus.append({'id':id,'label':label,'title':title,'eligibleDates':dates[:3] if prefix in ['B','E'] else dates[:4],'options':[v for k,v in options.items() if k.startswith(prefix)]})

def fixed(slot,id):return {'slot':slot,'type':'fixed','mealId':id}
def choice(prefix,key):
    menu=next(m for m in menus if m['id']==dict(B='breakfast',S='secondBreakfast',E='elevenses',T='afternoonTea')[prefix])
    return {'slot':menu['id'],'type':'choice','menuId':menu['id'],'exampleOptionId':options[key]['id']}
laine_days=[]
for i in range(7):
    if i<3: meals=[choice(k[0],k) for k in p.schedule[i]]
    elif i==3:meals=[fixed('breakfast','w49-tb'),choice('S','S4'),fixed('elevenses','w49-tl'),choice('T','T4')]
    elif i==4:meals=[fixed('breakfast','w49-fb'),fixed('elevenses','w49-fl')]
    else:
        prefix='s' if i==5 else 'u'
        meals=[fixed('breakfast',f'w49-{prefix}b'),fixed('secondBreakfast',f'w49-mini-{i}-0'),fixed('elevenses',f'w49-{prefix}l'),fixed('afternoonTea',f'w49-mini-{i}-1')]
    meals.append(fixed('supper','w49-dinner-'+str(i)))
    if i==4:meals.append(fixed('dessert','w49-dessert'))
    laine_days.append({'date':dates[i],'day':p.dinners[i]['day'],'label':p.dinners[i]['day']+' '+str(30 if i==0 else i),'travel':i==3,'sharedDay':i==4,'meals':meals})

prep=[
 'Sunday Nov 29: Make Jake\'s three lunch bowls and Laine\'s three cold lunch choices. Keep nuts and dressings separate.',
 'Of 615 g cooked turkey: refrigerate 165 g for Mon-Wed. Freeze 160 g for Thursday soup, 50 g for Saturday and 240 g for Sunday. Freeze 330 g raw pork for Saturday lunch. Keep chilled food at 40 F or below and use within 3-4 days.',
 'Wednesday: Thaw the 160 g soup turkey in the refrigerator during the day. In the evening, make the road egg bites and chowder. Chill promptly in shallow containers.',
 'Thursday morning: Reheat soup to 165 F. Preheat food thermoses with boiling water for a few minutes; empty and immediately fill with hot soup. Seal until lunch; soup must stay at 140 F or above. Put egg bites and Laine\'s remaining Second Breakfast and Afternoon Tea choices in a cooler with two ice packs at 40 F or below.',
 'Thursday night: Thaw Friday salmon in the refrigerator. Friday morning: thaw Saturday\'s raw pork and 50 g cooked turkey. Saturday: cook and chill the pork for lunch, and thaw Sunday\'s 240 g cooked turkey in the refrigerator.',
 'Friday and weekend breakfasts are cooked fresh. Each recipe\'s ingredient list and method cover only that meal; all cooking ahead, freezing and thawing is kept here.'
]

# Shopping: each distinct choice once, each scheduled meal once, seven shakes.
categories={'Produce':['avocado','cuke','celery','romaine','cabbage','mushroom','beans','cauli','asparagus','zuc','pepper','peach','garlic','lime','cilantro'],
 'Meat & Seafood':['thigh','pork','roast_turkey','turkey','sausage','salmon','steak','bacon'],
 'Dairy & Eggs':['egg','cheddar','swiss','cc','cream','butter','ricotta','creamcheese','sour','parm','oikos','milk'],
 'Pantry':['pecan','flour','whey','mayo','oil','dijon','broth','ab']}
use_labels={**{k:v['name'] for k,v in options.items()},'Thu soup':'Thursday chowder','Thu road breakfast':'Thursday egg bites'}
shopping={}
for cat,keys in categories.items():
    lines=[]
    for k in keys:
        if k not in p.shopping:continue
        q=p.shopping[k];where=', '.join(sorted(use_labels.get(x,x) for x in p.uses[k]))
        desc=amount(k,q)
        if k=='thigh':desc+=f' raw / {q/453.592:.2f} lb raw'
        if k=='bacon':desc+=' cooked; buy about 1.5 lb raw, yield varies'
        lines.append(f'{N[k]} - {desc} ({where})')
    shopping[cat]=lines
shopping['Pantry'] += [
 'Dried dill - 1 5/8 tsp (Jake lunches, savory cottage cheese bowl, chicken-bacon ranch jar, Friday lunch)',
 'Dried parsley - 1 3/8 tsp (Jake lunches, chicken-bacon ranch jar, Friday lunch)',
 'Dried thyme - 1 tsp (Thursday supper, Sunday supper)',
 'Ground coriander - 1/2 tsp; cumin - 1/4 tsp (Wednesday supper)',
 'Smoked paprika - 1 tsp (Thursday chowder, Saturday supper)',
 'Finely ground coffee - 1/2 tsp (Saturday supper)',
 'Cinnamon - 1/2 tsp (vanilla ricotta-pecan bowl, Oikos cheesecake bowl, Friday dessert)',
 'Monk fruit/erythritol blend - 1-2 tsp plus optional 1/2 tsp (Friday dessert, Oikos cheesecake bowl)',
 'Salt and black pepper - to taste (savory meals)']
shopping['Check Supply']=["One A Day Men's Multi - 7 tablets (Jake, daily)","One A Day Women's Multi - 7 tablets (Laine, daily)"]

# Make seasoning amounts visible within the meal that uses them.
def seasoning(meal,text):meal['ingredients'].append({'item':text,'nutritionNote':'Small seasoning quantities are excluded from approximate macros.'})
seasoning(options['B3'],'Cinnamon - 1/8 tsp')
seasoning(options['T4'],'Cinnamon - 1/8 tsp; monk fruit - optional 1/2 tsp')
seasoning(options['S4'],'Dried dill - 1/4 tsp')
seasoning(options['E2'],'Dried dill and dried parsley - 1/8 tsp each')
seasoning(dinners[2],'Ground coriander - 1/2 tsp; cumin - 1/4 tsp')
seasoning(dinners[3],'Dried thyme - 1/2 tsp')
seasoning(dinners[5],'Smoked paprika and finely ground coffee - 1/2 tsp each')
seasoning(dinners[6],'Dried thyme - 1/2 tsp')
seasoning(travel[1],'Smoked paprika - 1/2 tsp')
seasoning(next(v for v in weekend if v['id']=='w49-fl'),'Dried dill and parsley - 1/4 tsp each')
seasoning(dessert,'Cinnamon - 1/4 tsp; monk fruit/erythritol blend - 1-2 tsp')

# Compute seven-day totals and micros from actual quantities, not ingredient counts.
def micros(ing):
    out=defaultdict(float)
    for k,q in ing.items():
        v=db[p.aliases[k]];f=q*p.conv.get(k,1)/v['serving_qty']
        for mk,mv in v.get('micros',{}).items():
            if isinstance(mv,(float,int)):out[mk]+=f*mv
    return out
slot_foods=defaultdict(list);jake_foods=defaultdict(list)
for i in range(7):
    if i<3: early=[p.options[k][2] for k in p.schedule[i]]
    elif i==3:early=[p.travel['TB']['l'],p.options['S4'][2],p.travel['TL']['l'],p.options['T4'][2]]
    elif i==4:early=[p.shared['FB'][3],{},p.shared['FL'][3],{}]
    else:
        b,l=('SB','SL') if i==5 else ('UB','UL')
        early=[p.shared[b][3],p.weekend_snacks[i][0],p.shared[l][3],p.weekend_snacks[i][1]]
    for slot,food in zip(['Breakfast','Second Breakfast','Elevenses','Afternoon Tea'],early):slot_foods[slot].append(food)
    slot_foods['Supper'].append(p.add(p.dinners[i]['l'],p.dessert if i==4 else {}))
    jake_foods['Breakfast'].append(p.travel['TB']['j'] if i==3 else p.shared['FB'][2] if i==4 else p.shared['SB'][2] if i==5 else p.shared['UB'][2] if i==6 else {})
    jake_foods['Lunch'].append(p.lunch if i<3 else p.travel['TL']['j'] if i==3 else p.shared['FL'][2] if i==4 else p.shared['SL'][2] if i==5 else p.shared['UL'][2])
    jake_foods['Supper'].append(p.add(p.dinners[i]['j'],p.dessert if i==4 else {}))
    jake_foods['Listed shake'].append(p.shake)

def targets(group,person):
    combined=p.add(*(food for ff in group.values() for food in ff))
    mean=p.mul(combined,1/7);m=macro(mean)
    rows=[]
    for slot,foods in group.items():
        avg=macro(p.mul(p.add(*foods),1/7));rows.append([slot+' (daily avg)',*[avg[k] for k in ['cal','protein','carbs','fat','fiber']]])
    mi=micros(mean)
    mi["fiber"]=m["fiber"]
    supp=db["One A Day Men's Multi" if person=='jake' else "One A Day Women's Multi"]
    for k,v in supp.get('micros',{}).items():
        if isinstance(v,(int,float)):mi[k]+=v
    return {'rows':rows,'total':[m[k] for k in ['cal','protein','carbs','fat','fiber']],
            'goal':[2030,203,20,126,12] if person=='jake' else [None,103,20,None,None],
            'avgMicros':{k:round(v,2) for k,v in mi.items()},'netCarbs':True,
            'note':('Scheduled meals plus one listed shake per day; extra snacks are outside these averages.' if person=='jake' else 'Calculated menu average for the example choice rotation. Reordering choices changes individual days. No new calorie target is assigned; protein and net carbs retain the existing references.')}

week={'_v':4,'id':'2026-W49','label':'Week of November 30, 2026',
 '_note':'Nov 30-Dec 6. Approved PDF plan, including shared Thursday PT travel meals and Friday off. All carbs are net; totalCarbs and fiber are separate. Recipe methods cover only that meal; use the opening prep schedule for cooking ahead. Nutrition is approximate; small herbs and spices are excluded.',
 'jakeMacros':{'cal':2030,'protein':203,'carbs':20,'fat':126},
 'laineMacros':{'cal':None,'protein':103,'carbs':20,'fat':None},
 'dinners':dinners,'prepPlan':prep,'travelMeals':travel,'weekendMeals':weekend,
 'weekendNote':'Friday off: three shared meals. Weekend breakfasts/lunches are here; Laine\'s two weekend mini-meals are in her Hobbit Pantry.',
 'jakeLunch':recipe('w49-jake-lunch','Bacon-ranch chicken thighs, cheddar and sweet pepper',p.mul(p.lunch,3),[
 'Season the thighs with salt, pepper, 1 tsp dried dill and 1 tsp dried parsley. Brown in butter in batches.',
 'Soften the diced pepper in the pan. Add broth, cream and cream cheese; stir smooth. Return chicken and simmer to at least 165 F.',
 'Fold in cheddar and cooked bacon. Divide the cooked chicken evenly between 3 containers, then divide every bit of sauce evenly.'],batchDays=3,macrosNote='Nutrition per container; ingredient amounts make 3 containers.',note='Three containers for Mon-Wed. Reheating and travel packing are in the opening prep schedule.'),
 'jakeSnacks':[recipe('w49-shake','Whey shake with almond milk',p.shake,['Blend whey, unsweetened almond milk and cream until smooth.'],desc='One listed shake per day is allowed for in the grocery quantities. Adjust extra snacks and shakes using your usual routine.')],
 'jakeSnacksOptional':True,'jakeTabNote':'Three office lunch containers for Mon-Wed. Thursday\'s shared road breakfast and thermos lunch are on the Travel tab.',
 'laineTheme':'shire','laineMenus':menus,'laineMiniMeals':mini,
 'lainePlan':{'days':laine_days,'menuVersion':1},
 'laineTabNote':'A well-provisioned week in the Shire. Choose each menu option once in its own slot; your used choices leave the other days. Thursday has shared road meals. Friday is three meals together.',
 'laineBreakfasts':[],'laineSnacks':[], 'shopping':shopping,
 'dailySupplements':{'jake':[{'name':"One A Day Men's Multi",'nutritionKey':"One A Day Men's Multi",'desc':'1 tablet daily with food.'}],'laine':[{'name':"One A Day Women's Multi",'nutritionKey':"One A Day Women's Multi",'desc':'1 tablet daily with food.'}]},
 'targets':{'jake':targets(jake_foods,'jake'),'laine':targets(slot_foods,'laine')},
 'dailyMenuEstimates':{'laine':[{'date':date,**rounded(m)} for date,m in zip(dates,p.days)]},
 'budget':{'range':[135,150],'fullRestockRange':[180,210],'basis':'Planning estimates, not live store quotes. Assumes whey, nuts, almond flour, oil, mayo, mustard and spices on hand.'},
 'foodSafetySources':['https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures','https://content.govdelivery.com/accounts/USDAOC/bulletins/3ebbb1b']}
week['jakeLunch']['macros']=macro(p.lunch)
seasoning(week['jakeLunch'],'Dried dill and parsley - 1 tsp each; black pepper - 1/2 tsp; salt to taste')
dest=ROOT/'weeks/2026-W49';dest.mkdir(parents=True,exist_ok=True)
(dest/'week.json').write_text(json.dumps(week,ensure_ascii=False,indent=2)+'\n')
# A flat JSON is included for the established import/download workflow.
(ROOT/'weeks/2026-W49.json').write_text(json.dumps(week,ensure_ascii=False,indent=2)+'\n')
print('Built W49:',len(menus),'choice slots,',len(options),'choices,',len(travel),'travel meals; nutrition entries',len(db))
