import json, math
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DB=json.loads((ROOT/'nutrition.json').read_text())
DB['Peaches']={'cal':39,'protein':.91,'carbs':9.54,'fat':.25,'fiber':1.5,'serving_qty':100,'serving_unit':'g'}
DB['Mushrooms']={'cal':22,'protein':3.09,'carbs':3.26,'fat':.34,'fiber':1,'serving_qty':100,'serving_unit':'g'}
# Generic estimates for the draft; the original app database is not modified.
DB['Eggs (large)']=dict(DB['Eggs (large)'], carbs=.36)
FIELDS=['cal','protein','carbs','fat','fiber']
aliases={
 'thigh':'Chicken thighs (boneless, skinless)','pork':'Pork loin','turkey':'Ground turkey 93/7','roast_turkey':'Turkey breast (cooked)',
 'salmon':'Atlantic salmon (raw)','egg':'Eggs (large)','bacon':'Bacon (cooked)','milk':'Almond milk (unsweetened)','whey':'Whey protein isolate',
 'oikos':'Oikos Triple Zero yogurt','cc':'Cottage cheese 4%','cheddar':'Cheddar cheese','swiss':'Swiss cheese','string':'String cheese (1 stick)',
 'cream':'Heavy cream','butter':'Butter','flour':'Almond flour','pecan':'Pecans','walnut':'Walnuts','pepper':'Bell pepper','romaine':'Romaine lettuce',
 'cabbage':'Green cabbage','celery':'Celery','cuke':'English cucumber','cauli':'Cauliflower','beans':'Green beans','zuc':'Zucchini','mayo':'Mayonnaise (avocado oil)',
 'dijon':'Dijon mustard','garlic':'Garlic','soy':'Soy sauce (reduced sodium)','sesameoil':'Sesame oil','lime':'Lime juice','vinegar':'Rice vinegar','oil':'Olive oil',
 'parm':'Parmesan cheese (grated)','sausage':'Ground sausage (pork)','avocado':'Avocado','sour':'Daisy sour cream','steak':'Flank/sirloin steak',
 'tomato':'Cherry tomatoes','ricotta':'Ricotta cheese (part-skim)','creamcheese':'Cream cheese','broth':'Beef broth','ab':'Almond butter',
 'peach':'Peaches','mushroom':'Mushrooms','porkrind':'Pork rinds'}
# Every recipe amount is in its displayed household unit or grams. Convert once
# to each database entry's declared unit before calculating nutrition.
conv={'butter':1/14,'oil':1/14,'sesameoil':1/14,'garlic':1/3,'dijon':1/5,'lime':1/15,'vinegar':1/15,'soy':1/15,'parm':1/5,'avocado':1/200,'sour':1/15,'creamcheese':1/14.5,'ab':1/16}
unit={k:('egg' if k=='egg' else 'stick' if k=='string' else 'g') for k in aliases}
def macros(ing):
 out={k:0 for k in FIELDS}
 for k,q in ing.items():
  r=DB[aliases[k]]; qty=q*conv.get(k,1)
  for f in FIELDS: out[f]+=qty/r['serving_qty']*r.get(f,0)
 out['net']=out['carbs']-out['fiber'];return out
def add(*items):
 o=defaultdict(float)
 for ing in items:
  for k,v in ing.items():o[k]+=v
 return dict(o)
def mul(ing,n):return {k:v*n for k,v in ing.items()}

options={
 'B1':('Breakfast','Bacon, egg & cheddar',{'egg':1,'bacon':16,'cheddar':25,'butter':4},'Fry the egg in butter until set. Serve with crisp bacon and cheddar.','1 egg; 2 small bacon strips (16 g cooked); 25 g cheddar; 4 g butter.'),
 'B2':('Breakfast','Sausage & Swiss egg cup',{'egg':1,'sausage':45,'swiss':20,'cream':10},'Brown sausage to 160 F. Mix with egg, cream and Swiss; bake in a greased silicone cup at 350 F until 160 F, about 18-22 min.','1 egg; 45 g raw sausage; 20 g Swiss; 10 g cream.'),
 'B3':('Breakfast','Cinnamon ricotta-pecan bowl',{'ricotta':100,'pecan':15,'cream':15},'Stir in cinnamon and a little monk fruit. Add chopped pecans.','100 g ricotta; 15 g pecans; 15 g cream; cinnamon; monk fruit to taste.'),
 'B4':('Breakfast','Avocado, egg & cheddar',{'egg':1,'avocado':50,'cheddar':25,'butter':4},'Scramble the egg in butter; fold in cheddar. Slice avocado fresh.','1 egg; 50 g avocado flesh; 25 g cheddar; 4 g butter.'),
 'S1':('Second Breakfast','Cottage cheese & pecans',{'cc':150,'pecan':18},'Top the cottage cheese with chopped pecans.','150 g 4% cottage cheese; 18 g pecans.'),
 'S2':('Second Breakfast','Oikos, almond butter & cream',{'oikos':100,'ab':20,'cream':20},'Stir almond butter and cream into the yogurt.','100 g Oikos Triple Zero; 20 g almond butter; 20 g cream.'),
 'S3':('Second Breakfast','Swiss, bacon & cucumber',{'swiss':35,'bacon':16,'cuke':40,'pecan':5},'Pack separately so the cucumber stays dry and crunchy.','35 g Swiss; 16 g cooked bacon; 40 g cucumber; 5 g pecans.'),
 'S4':('Second Breakfast','Savory cottage cheese bowl',{'cc':120,'cheddar':25,'cuke':40,'oil':5},'Add diced cucumber, cheddar, olive oil and dried dill.','120 g 4% cottage cheese; 25 g cheddar; 40 g cucumber; 5 g olive oil.'),
 'E1':('Elevenses','Turkey-pecan crunch jar',{'roast_turkey':60,'cc':30,'pecan':15,'mayo':12,'celery':20,'romaine':20,'dijon':3},'Stir mayo and Dijon into turkey, cottage cheese and celery. Pack over romaine; add pecans at eating.','60 g cooked turkey; 30 g cottage cheese; 15 g pecans; 12 g mayo; 20 g each celery and romaine; 3 g Dijon.'),
 'E2':('Elevenses','Chicken-bacon ranch jar',{'thigh':85,'bacon':12,'cheddar':18,'mayo':12,'celery':20,'romaine':20},'Cook chicken to 165 F, chill and chop. Mix mayo with dried dill and parsley. Pack with bacon, cheddar, celery and romaine.','85 g raw chicken thigh; 12 g cooked bacon; 18 g cheddar; 12 g mayo; 20 g each celery and romaine; dried herbs.'),
 'E3':('Elevenses','Roast-pork Swiss crunch cup',{'pork':85,'swiss':25,'mayo':12,'dijon':3,'cuke':30,'cabbage':20},'Cook pork to 145 F, rest 3 min, then chill. Slice thin. Mix mayo and Dijon; pack with Swiss, cucumber and cabbage.','85 g raw pork loin; 25 g Swiss; 12 g mayo; 3 g Dijon; 30 g cucumber; 20 g cabbage.'),
 'E4':('Elevenses','Turkey-cheddar chopped jar',{'roast_turkey':65,'cheddar':30,'mayo':12,'vinegar':5,'romaine':25,'cuke':30},'Mix mayo with vinegar and oregano. Layer turkey, cheddar, cucumber and romaine; keep dressing separate.','65 g cooked turkey; 30 g cheddar; 12 g mayo; 5 g rice vinegar; 25 g romaine; 30 g cucumber.'),
 'T1':('Afternoon Tea','Turkey-Swiss roll-ups',{'roast_turkey':45,'swiss':35,'mayo':8,'dijon':3,'cuke':30},'Spread turkey with mayo and Dijon; roll around Swiss. Serve cucumber alongside.','45 g cooked turkey; 35 g Swiss; 8 g mayo; 3 g Dijon; 30 g cucumber.'),
 'T2':('Afternoon Tea','Cottage-cheddar dip & celery',{'cc':120,'cheddar':25,'oil':5,'celery':40},'Blend cottage cheese with dill and olive oil; fold in cheddar. Serve with celery.','120 g 4% cottage cheese; 25 g cheddar; 5 g olive oil; 40 g celery.'),
 'T3':('Afternoon Tea','Cheddar, pecans & cucumber',{'cheddar':35,'pecan':16,'cuke':40},'Pack cheese and nuts dry; keep cucumber in a separate compartment.','35 g cheddar; 16 g pecans; 40 g cucumber.'),
 'T4':('Afternoon Tea','Oikos cheesecake bowl',{'oikos':100,'creamcheese':25,'pecan':15},'Soften cream cheese and stir smooth with Oikos, cinnamon and monk fruit. Add pecans.','100 g Oikos Triple Zero; 25 g cream cheese; 15 g pecans; cinnamon; monk fruit to taste.')
}

dinners=[
 {'day':'Monday','date':'NOV 30','name':'Pork medallions with mushroom cream & green beans','time':'30 min',
 'j':{'pork':280,'mushroom':100,'cream':55,'butter':14,'sour':25,'beans':100,'broth':40,'garlic':3},
 'l':{'pork':85,'mushroom':40,'cream':25,'butter':7,'sour':12,'beans':50,'broth':20,'garlic':1.5},
 'steps':['Slice pork into thick medallions; season with salt and pepper. Sear in half the butter until 145 F. Rest at least 3 min.','Brown mushrooms in the pan. Add garlic, broth and cream; simmer until spoon-coating. Turn off heat before stirring in sour cream.','Cook green beans in the remaining butter. Divide the pork, vegetables and sauce using the listed portions.']},
 {'day':'Tuesday','date':'DEC 01','name':'Bacon-cheddar turkey mini meatloaves & cauliflower mash','time':'35 min',
 'j':{'turkey':280,'bacon':16,'cheddar':30,'flour':8,'cauli':130,'butter':12,'cream':35,'dijon':5},
 'l':{'turkey':85,'bacon':6,'cheddar':12,'flour':3,'cauli':65,'butter':6,'cream':18,'dijon':2.5},
 'steps':['Heat oven to 400 F. Mix turkey, almond flour, Dijon and half the cheddar; shape separate mini loaves, with Laine\'s smaller. Top with bacon and remaining cheddar.','Bake until the center reaches 165 F, about 20-25 min. Use the thermometer rather than size alone.','Steam cauliflower until tender, drain very well, then blend with butter and cream. Serve the measured mash beside each loaf.']},
 {'day':'Wednesday','date':'DEC 02','name':'Coriander-lime chicken thighs, browned cabbage & cilantro cream','time':'30 min',
 'j':{'thigh':300,'cabbage':130,'butter':16,'sour':45,'oil':8,'lime':10,'garlic':3},
 'l':{'thigh':90,'cabbage':65,'butter':8,'sour':22,'oil':4,'lime':5,'garlic':1.5},
 'steps':['Season thighs with ground coriander, cumin, salt and pepper. Sear in olive oil and finish covered until at least 165 F.','Brown sliced cabbage in butter over medium-high heat; add garlic for the last 30 seconds.','Mix sour cream with lime and chopped cilantro. Spoon over the chicken. Add cayenne or hot sauce to Jake\'s plate only.']},
 {'day':'Thursday','date':'DEC 03','name':'Sausage-cabbage skillet with thyme mustard cream','time':'25 min',
 'j':{'sausage':220,'cabbage':150,'cream':55,'butter':10,'dijon':8,'parm':15,'broth':35},
 'l':{'sausage':75,'cabbage':65,'cream':25,'butter':5,'dijon':4,'parm':7.5,'broth':20},
 'steps':['Brown mild bulk sausage thoroughly to 160 F. Lift out and discard excess rendered fat.','Add butter and sliced cabbage; cook until browned and just tender. Add thyme and broth, then cream and Dijon.','Reduce until thick enough to coat the cabbage. Return sausage, melt in Parmesan and portion onto plates.']},
 {'day':'Friday','date':'DEC 04','name':'Crisp salmon with lime brown butter & roasted asparagus','time':'25 min',
 'j':{'salmon':230,'butter':18,'oil':7,'lime':10,'garlic':3,'asparagus':140},
 'l':{'salmon':80,'butter':9,'oil':3,'lime':5,'garlic':1.5,'asparagus':70},
 'steps':['Heat oven to 425 F. Toss asparagus with olive oil and salt; roast until crisp-tender, about 10-12 min.','Sear dry salmon skin-side down, then finish gently to 145 F. Keep Laine\'s smaller portion separate.','Brown butter in a small pan, remove from heat, then stir in garlic and lime. Spoon over the fish; serve peach crumble after supper.']},
 {'day':'Saturday','date':'DEC 05','name':'Coffee-rubbed steak, garlic-butter mushrooms & Parmesan mash','time':'30 min',
 'j':{'steak':280,'mushroom':100,'cauli':120,'butter':18,'cream':40,'parm':15,'garlic':3},
 'l':{'steak':85,'mushroom':40,'cauli':60,'butter':9,'cream':20,'parm':7.5,'garlic':1.5},
 'steps':['Season steak with finely ground coffee, smoked paprika, salt and pepper. Sear to 145 F and rest at least 3 min.','Brown mushrooms in half the butter. Add garlic at the end.','Steam and drain cauliflower; blend with remaining butter, cream and Parmesan. Slice steak and serve with the measured mushrooms and mash.']},
 {'day':'Sunday','date':'DEC 06','name':'Thyme-roasted chicken thighs, pan gravy & golden zucchini','time':'35 min',
 'j':{'thigh':300,'zuc':160,'butter':18,'cream':45,'broth':50,'dijon':5,'oil':5},
 'l':{'thigh':90,'zuc':80,'butter':9,'cream':22,'broth':25,'dijon':2.5,'oil':2.5},
 'steps':['Season chicken with thyme, salt and pepper. Sear in olive oil; finish in a 400 F oven to at least 165 F.','Brown zucchini coins in half the butter without crowding.','Deglaze the chicken pan with broth. Add cream and Dijon; reduce until thick, then whisk in remaining butter. Spoon over the chicken.']}
]
aliases['asparagus']='Asparagus';unit['asparagus']='g'
aliases['cilantro']='Fresh herbs (parsley/dill/cilantro)';unit['cilantro']='g'
dinners[2]['j']['cilantro']=5
dinners[2]['l']['cilantro']=2
dinners[0]['l']['beans']=40

# Keep the small meals compact while moving protein into the daytime.
def update_option(k,name,ing,steps,amounts):
 options[k]=(options[k][0],name,ing,steps,amounts)
update_option('B3','Vanilla ricotta-pecan bowl',{'ricotta':45,'pecan':20,'cream':15,'whey':12},'Stir vanilla whey into ricotta and cream; add cinnamon and pecans. Thin with a teaspoon of water if needed.','45 g ricotta; 20 g pecans; 15 g cream; 12 g vanilla whey; cinnamon.')
update_option('S1','Vanilla cottage cheese & pecans',{'cc':80,'pecan':25,'cream':10,'whey':10},'Stir whey and cream into cottage cheese. Add pecans.','80 g 4% cottage cheese; 25 g pecans; 10 g cream; 10 g vanilla whey.')
update_option('S2','Turkey, cheddar & almond-butter celery',{'roast_turkey':25,'cheddar':30,'ab':16,'celery':30},'Serve turkey and cheddar alongside almond-butter-filled celery.','25 g cooked turkey; 30 g cheddar; 16 g almond butter; 30 g celery.')
update_option('S4','Savory cottage cheese bowl',{'cc':80,'cheddar':30,'cuke':20,'oil':8},'Add diced cucumber, cheddar, olive oil and dried dill.','80 g 4% cottage cheese; 30 g cheddar; 20 g cucumber; 8 g olive oil.')
update_option('T2','Cottage-cheddar dip & celery',{'cc':80,'cheddar':35,'oil':6,'celery':30},'Blend cottage cheese with dill and olive oil; fold in cheddar. Serve with celery.','80 g 4% cottage cheese; 35 g cheddar; 6 g olive oil; 30 g celery.')
update_option('T3','Turkey, cheddar & pecan plate',{'roast_turkey':35,'cheddar':35,'pecan':16,'cuke':40},'Pack turkey, cheese and nuts dry; keep cucumber separate.','35 g cooked turkey; 35 g cheddar; 16 g pecans; 40 g cucumber.')
update_option('T4','Oikos cheesecake bowl',{'oikos':40,'creamcheese':15,'pecan':16,'whey':15,'cream':10},'Soften cream cheese. Stir smooth with Oikos, whey and cream; top with pecans and cinnamon.','40 g Oikos Triple Zero; 15 g cream cheese; 16 g pecans; 15 g vanilla whey; 10 g cream.')

shared={
 'FB':('Friday Breakfast','Bacon-cheddar eggs & avocado',{'egg':3,'bacon':18,'cheddar':25,'avocado':40,'butter':5},{'egg':2,'bacon':20,'cheddar':30,'avocado':40,'butter':5},'Scramble eggs in butter; fold in cheddar. Serve with cooked bacon and fresh avocado.'),
 'FL':('Friday Luncheon','Warm ranch-chicken lettuce boats',{'thigh':200,'cheddar':25,'mayo':15,'bacon':12,'romaine':40,'cuke':40},{'thigh':150,'cheddar':30,'mayo':20,'bacon':12,'romaine':30,'cuke':30},'Cook chicken to 165 F, then slice. Mix mayo with dried dill and parsley. Fill romaine with chicken, cheddar and bacon; spoon dressing over. Serve cucumber alongside.'),
 'SB':('Saturday Breakfast','Sausage & Swiss scramble',{'egg':2,'sausage':55,'swiss':25,'butter':4},{'egg':1,'sausage':35,'swiss':20,'butter':4},'Brown sausage to 160 F. Add butter and eggs; scramble until set, then melt in Swiss.'),
 'SL':('Saturday Luncheon','Cold pork, cheddar & pecan crunch bowls',{'pork':220,'cheddar':25,'pecan':12,'mayo':15,'dijon':4,'romaine':35,'cuke':35},{'pork':85,'cheddar':15,'pecan':10,'mayo':12,'dijon':3,'romaine':25,'cuke':25},'Cook pork to 145 F, rest 3 min, chill and slice. Stir mayo with Dijon. Pack with romaine, cucumber, cheddar and pecans. Serve cold.'),
 'UB':('Sunday Breakfast','Almond-flour waffles with Oikos cream',{'egg':2,'flour':25,'cc':40,'butter':6,'oikos':50,'cream':15},{'egg':1,'flour':18,'cc':35,'butter':4,'oikos':40,'cream':10},'Separate eggs. Blend yolks, cottage cheese, flour and melted butter; fold in whipped whites. Cook in a waffle iron until set and golden. Mix Oikos with cream for the topping.'),
 'UL':('Sunday Luncheon','Turkey-Swiss cucumber stacks',{'roast_turkey':130,'swiss':35,'mayo':15,'dijon':4,'cuke':70,'romaine':30},{'roast_turkey':65,'swiss':25,'mayo':12,'dijon':3,'cuke':40,'romaine':20},'Mix mayo and Dijon. Layer turkey, Swiss and cucumber on dry romaine leaves; serve the measured sauce alongside.')
}
dessert={'peach':50,'flour':12,'pecan':8,'butter':8,'cream':18}
lunch={'thigh':280,'creamcheese':25,'cream':35,'cheddar':20,'bacon':10,'butter':7,'pepper':30,'broth':35}
shake={'whey':30,'milk':240,'cream':30}
# Thursday's shared road meals replace B4 and E4 for Laine and the team lunch
# for Jake. The small S/T choices still run Monday-Thursday.
del options['B4'],options['E4']
road_bites={'egg':4,'bacon':30,'cheddar':50,'cream':30,'butter':6}
road_soup={'cauli':250,'roast_turkey':160,'cheddar':60,'cream':60,'creamcheese':40,'bacon':20,'butter':10,'broth':180,'garlic':3}
travel={
 'TB':{'name':'Bacon-cheddar mini egg bites','batch':road_bites,'j':mul(road_bites,8/12),'l':mul(road_bites,4/12)},
 'TL':{'name':'Thick turkey, bacon & cauliflower chowder','batch':road_soup,'j':mul(road_soup,500/800),'l':mul(road_soup,300/800)}
}
# Weekday choices can be taken in any order, once per slot. This is one example.
schedule=[['B1','S1','E1','T1'],['B2','S2','E2','T2'],['B3','S3','E3','T3'],['TB','S4','TL','T4']]
shared['SL'][3]['pork']=110
shared['UB'][3]['egg']=2
weekend_snacks={5:[{'cc':150,'pecan':15},{'roast_turkey':50,'cheddar':25,'mayo':8}],6:[{'cc':150,'pecan':15},{'roast_turkey':45,'cheddar':25,'pecan':10}]}
days=[]
for i,d in enumerate(dinners):
 if i<3: early=[options[k][2] for k in schedule[i]]
 elif i==3: early=[travel['TB']['l'],options['S4'][2],travel['TL']['l'],options['T4'][2]]
 elif i==4: early=[shared['FB'][3],shared['FL'][3],dessert]
 elif i==5: early=[shared['SB'][3],shared['SL'][3]]+weekend_snacks[5]
 else: early=[shared['UB'][3],shared['UL'][3]]+weekend_snacks[6]
 days.append(macros(add(*early,d['l'])))

# Purchase amounts are aggregated from the actual recipes, with every menu choice
# counted once. The shake is the established example portion, not a new target.
shopping=defaultdict(float);uses=defaultdict(set)
def shop(ing,label,n=1):
 for k,q in ing.items():shopping[k]+=q*n;uses[k].add(label)
for k,v in options.items():shop(v[2],k)
for d in dinners:shop(add(d['j'],d['l']),d['day'][:3]+' supper')
for k,v in shared.items():shop(add(v[2],v[3]),v[0])
for k,v in travel.items():shop(v['batch'],'Thu road breakfast' if k=='TB' else 'Thu soup')
shop(lunch,'Jake lunch',3);shop(dessert,'Fri dessert',2)
for i,vv in weekend_snacks.items():
 for v in vv:shop(v,('Sat' if i==5 else 'Sun')+' mini-meals')
shop(shake,'Jake shakes',7)

if __name__=='__main__':
 for k,v in options.items():print(k,v[1],{f:round(vv,1) for f,vv in macros(v[2]).items()})
 print('DAYS',json.dumps([{k:round(v,1) for k,v in x.items()} for x in days],indent=2))
 print('AVG', {k:round(sum(d[k] for d in days)/7,1) for k in days[0]})
 print('LUNCH',macros(lunch))
 print('SHOP',dict(shopping))
