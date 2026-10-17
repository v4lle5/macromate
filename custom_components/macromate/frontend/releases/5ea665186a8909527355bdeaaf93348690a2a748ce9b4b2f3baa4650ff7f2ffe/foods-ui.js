import {el,button,field,nutrients,display,MEALS} from './dom.js';
import {quickEntry} from './entry-ui.js';
export function selectField(label,name,options,value){const input=el('select',{name,'aria-label':label},...options.map(([id,text])=>el('option',{value:id},text)));if(value!=null)input.value=value;return el('label',{},el('span',{},label),input);}
export function positive(input){const n=Number(input.value);if(!input.value.trim()||!Number.isFinite(n)||n<=0)throw {code:'invalid_request'};return n;}
export class FoodBrowser {
 constructor(panel){this.panel=panel;this.sequence=0;}
 render(){
  this.query=field('Name oder Barcode',{type:'search','aria-label':'Lebensmittel suchen',placeholder:'Lebensmittelname oder EAN',maxlength:200,autocomplete:'off'});
  this.filter=selectField('Filter','filter',[['all','Alle'],['favorites','Favoriten'],['recent','Zuletzt erfasst'],['custom','Eigene Lebensmittel']],'all');
  this.online=field('Online-Suche (Open Food Facts)',{type:'checkbox'});
  this.results=el('div',{class:'results','aria-live':'polite'});
  this.detail=el('div',{class:'food-detail'});
  this.node=el('div',{class:'card'},el('h2',{},'Lebensmittel eintragen'),el('form',{onsubmit:event=>{event.preventDefault();this.search();}},el('div',{class:'toolbar'},this.query,this.filter,el('button',{type:'submit',class:'primary'},'Suchen'),button('Schnelleintrag',()=>quickEntry(this.panel),{'data-write':true}),this.panel.barcode.render()),this.online,el('small',{},'Name suchen oder Barcode eingeben. Für eigene Nährwerte Schnelleintrag wählen. Standard: nur lokal. Online nur nach Absenden und Freigabe in der Integrationskonfiguration.')),this.results,this.detail);
  return this.node;
 }
 invalidate(){this.sequence++;this.results.replaceChildren();this.detail.replaceChildren();this.food=null;}
 readContext(){return {sequence:++this.sequence,connection:this.panel.hass.connection,userId:this.panel.hass.user?.id,authorized:this.panel.authorized};}
 current(context){return context.sequence===this.sequence&&context.connection===this.panel.hass.connection&&context.userId===this.panel.hass.user?.id&&context.authorized&&this.panel.authorized&&this.panel.isConnected;}
 async search(){const context=this.readContext();try{
  const query=this.query.querySelector('input').value;
  this.detail.replaceChildren();
  if(/^[\p{Decimal_Number}\s]+$/u.test(query)&&/\p{Decimal_Number}/u.test(query)){await this.panel.barcode.lookup(query);return;}
  if(!query.trim()&&this.filter.querySelector('select').value==='all'){this.results.replaceChildren(el('p',{},'Name oder Barcode eingeben. Für eigene Nährwerte einen Namen eingeben und Schnelleintrag wählen.'));this.query.querySelector('input').focus();return;}
  const result=await this.panel.client.read('search_foods',{query:this.query.querySelector('input').value,online:this.online.querySelector('input').checked,filter:this.filter.querySelector('select').value});
  if(!this.current(context))return;
  this.showResults(result);
 }catch(e){if(this.current(context))this.panel.showError(e);}}
 showResults(result){this.results.replaceChildren(el('small',{},[result.source,result.attribution].filter(Boolean).join(' · ')),...(result.foods?.length?result.foods.map(food=>button(`${food.name}${food.producer?' · '+food.producer:''}`,()=>this.pick(food.food_id))):[el('p',{},'Keine Lebensmittel gefunden. Anderen Suchbegriff versuchen oder eigenes Lebensmittel anlegen.') ]));}
 async pick(food_id){const context=this.readContext();try{const result=await this.panel.client.read('food',{food_id});if(!this.current(context))return;this.showFood(result.food);}catch(e){if(this.current(context))this.panel.showError(e);}}
 showFood(food){
  this.food=food;
  const serving=selectField('Portion','serving',[['',food.base_unit],...(food.servings||[]).map(s=>[s.serving_id,`${s.label} (${display(s.amount,food.base_unit)})`])],food.favorite?.serving_id||'');
  const amount=field('Menge ('+food.base_unit+')',{type:'number',min:'0.001',step:'any',required:true,value:food.favorite?.amount||100});
  const quantity=field('Anzahl',{type:'number',min:'0.001',step:'any',required:true,value:food.favorite?.quantity||1});
  const meal=selectField('Mahlzeit','meal',Object.entries(MEALS),'snack');
  const preview=el('div',{'aria-live':'polite'});
  const portion=()=>serving.querySelector('select').value?{serving_id:serving.querySelector('select').value,quantity:positive(quantity.querySelector('input'))}:{amount:positive(amount.querySelector('input'))};
  const refresh=()=>{
   const id=serving.querySelector('select').value;amount.hidden=!!id;quantity.hidden=!id;amount.querySelector('input').disabled=!!id;quantity.querySelector('input').disabled=!id;
   try{const p=portion();const size=p.amount??(food.servings.find(s=>s.serving_id===p.serving_id).amount*p.quantity);const per=food.nutrients_per_100||Object.fromEntries(Object.entries(food.nutrients||{}).map(([k,v])=>[k,v==null?null:v*100]));
    preview.replaceChildren(el('p',{},`Gewählt: ${display(size,food.base_unit)}`),nutrients(Object.fromEntries(Object.entries(per).map(([k,v])=>[k,v==null?null:v*size/100]))));
   }catch{preview.replaceChildren(el('p',{},'Bitte eine positive Menge angeben.'));}
  };
  serving.addEventListener('change',refresh);amount.addEventListener('input',refresh);quantity.addEventListener('input',refresh);refresh();
  const favorite=button(food.is_favorite?'Favorit entfernen':'Portion als Favorit speichern',async()=>{
   try{const result=await this.panel.write('favorite',{food_id:food.food_id,enabled:!food.is_favorite,...(!food.is_favorite?portion():{})},false);if(result){food=result.food;this.food=food;favorite.textContent=food.is_favorite?'Favorit entfernen':'Portion als Favorit speichern';}}catch(e){this.panel.showError(e);}
  },{'data-write':true});
  this.detail.replaceChildren(el('h3',{},food.name),el('p',{class:'muted'},[food.producer,food.source,food.license].filter(Boolean).join(' · ')),el('form',{onsubmit:async event=>{event.preventDefault();try{await this.panel.write('log_food',{food_id:food.food_id,...portion(),meal_type:meal.querySelector('select').value,date:this.panel.date});}catch(e){this.panel.showError(e);}}},el('div',{class:'form-grid'},serving,amount,quantity,meal),el('details',{open:true},el('summary',{},'Nährwerte der gewählten Portion'),preview),el('div',{class:'actions'},el('button',{type:'submit',class:'primary','data-write':true},'Lebensmittel eintragen'),favorite)));
 }
}
