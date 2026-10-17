import {el,button,field,nutrients,display,MEALS,NUTRIENTS} from './dom.js';
import {selectField,positive} from './foods-ui.js';
export function openDialog(panel,title,children){
 panel.dialog?.close();panel.dialog?.remove();
 const dialog=el('dialog',{'aria-label':title},el('h2',{},title),el('div',{class:'dialog-status',role:'status','aria-live':'polite'}),...children);
 dialog.addEventListener('close',()=>{dialog.remove();if(panel.dialog===dialog)panel.dialog=null;panel.drainRefresh?.();});
 panel.shadowRoot.append(dialog);panel.dialog=dialog;dialog.showModal();return dialog;
}
export function numericFields(keys,values={}){return keys.map(key=>{const [label,unit]=NUTRIENTS[key];return field(`${label} (${unit})`,{name:key,type:'number',min:0,step:'any',required:key==='calories',value:values[key]??''});});}
export function readNumbers(form,keys){const result={};for(const key of keys){const input=form.elements.namedItem(key);if(input.value==='')continue;const n=Number(input.value);if(!Number.isFinite(n)||n<0)throw {code:'invalid_request'};result[key]=n;}return result;}
export function quickEntry(panel,entry){
 const query=panel.foodBrowser.query.querySelector('input');
 if(!entry&&!query.value.trim()){query.focus();panel.foodBrowser.results.replaceChildren(el('p',{},'Für den Schnelleintrag zuerst einen Namen eingeben.'));return;}
 const title=entry?'Eintrag bearbeiten':'Schnelleintrag';
 const name=entry?field('Name',{name:'name',required:true,maxlength:200,value:entry.name}):el('div',{},el('p',{'data-user-content':true},query.value),el('input',{type:'hidden',name:'name',value:query.value}));
 const meal=selectField('Mahlzeit','meal_type',Object.entries(MEALS),entry?.meal_type||'snack');
 const keys=['calories','protein','carbs','fat'];
 let dialog;
 const form=el('form',{onsubmit:async event=>{event.preventDefault();try{
  const payload={name:form.elements.name.value,meal_type:form.elements.meal_type.value,...readNumbers(form,keys),...(entry?{entry_id:entry.entry_id,...Object.fromEntries(keys.slice(1).filter(key=>form.elements[key].value==='').map(key=>[key,null]))}:{date:panel.date})};
  if(await panel.write(entry?'update_meal':'log_meal',payload))dialog.close();
 }catch(e){panel.showError(e);}}},name,meal,el('p',{class:'muted'},'Gesamtnährwerte dieses Eintrags. Leere optionale Felder bleiben unbekannt. Beim Bearbeiten löscht ein leeres Feld den bisherigen Nährwert.'),el('div',{class:'form-grid'},numericFields(keys,entry?.nutrients??entry)),el('div',{class:'actions'},el('button',{type:'submit',class:'primary','data-write':true},'Speichern'),button('Abbrechen',()=>dialog.close())));
 dialog=openDialog(panel,title,[form]);
}
export function editFoodEntry(panel,entry){
 const amount=field(`Menge (${entry.base_unit})`,{name:'amount',type:'number',required:true,min:'0.001',step:'any',value:entry.amount});
 const meal=selectField('Mahlzeit','meal_type',Object.entries(MEALS),entry.meal_type);
 const mode=entry.serving_id?selectField('Mengenmodus','mode',[['amount',entry.base_unit],['serving','Bisherige Portion']],'amount'):null;
 const quantity=entry.serving_id?field('Anzahl',{name:'quantity',type:'number',min:'0.001',step:'any',value:entry.quantity||1}):null;
 if(quantity)quantity.hidden=true;
 const preview=el('div',{});
 const refresh=()=>{
  const byServing=mode?.querySelector('select').value==='serving';amount.hidden=byServing;amount.querySelector('input').disabled=byServing;if(quantity){quantity.hidden=!byServing;quantity.querySelector('input').disabled=!byServing;}
  const size=byServing?(entry.amount/(entry.quantity||1))*Number(quantity.querySelector('input').value):Number(amount.querySelector('input').value);
  const source=entry.nutrients||Object.fromEntries(['calories','protein','carbs','fat'].map(key=>[key,entry[key]]));
  preview.replaceChildren(nutrients(Object.fromEntries(Object.entries(source).map(([k,v])=>[k,v==null?null:v*size/entry.amount]))));
 };
 [amount,mode,quantity].filter(Boolean).forEach(node=>node.addEventListener('input',refresh));refresh();
 let dialog;
 const form=el('form',{onsubmit:async event=>{event.preventDefault();try{
  const p=mode?.querySelector('select').value==='serving'?{serving_id:entry.serving_id,quantity:positive(quantity.querySelector('input'))}:{amount:positive(amount.querySelector('input'))};
  if(await panel.write('update_food_entry',{entry_id:entry.entry_id,...p,meal_type:meal.querySelector('select').value}))dialog.close();
 }catch(e){panel.showError(e);}}},el('p',{},'Nährwerte werden aus dem gespeicherten Eintrag skaliert, nicht aus dem heutigen Produkt.'),mode,amount,quantity,meal,preview,el('div',{class:'actions'},el('button',{type:'submit',class:'primary','data-write':true},'Speichern'),button('Abbrechen',()=>dialog.close())));
 dialog=openDialog(panel,'Lebensmitteleintrag bearbeiten',[form]);
}
export function copyEntry(panel,entry){
 const date=field('Zieldatum',{type:'date',name:'date',required:true,value:panel.date});
 const meal=selectField('Mahlzeit','meal_type',Object.entries(MEALS),entry.meal_type);
 let dialog;
 dialog=openDialog(panel,'Eintrag kopieren',[el('form',{onsubmit:async event=>{event.preventDefault();if(await panel.write('copy_meal',{entry_id:entry.entry_id,date:date.querySelector('input').value,meal_type:meal.querySelector('select').value}))dialog.close();}},el('p',{},entry.name),date,meal,el('div',{class:'actions'},el('button',{type:'submit',class:'primary','data-write':true},'Kopieren'),button('Abbrechen',()=>dialog.close())))]);
}
export function deleteEntry(panel,entry){let dialog;dialog=openDialog(panel,'Eintrag löschen',[el('p',{},`„${entry.name}“ wirklich löschen?`),el('div',{class:'actions'},button('Endgültig löschen',async()=>{if(await panel.write('delete_meal',{entry_id:entry.entry_id}))dialog.close();},{class:'danger','data-write':true}),button('Abbrechen',()=>dialog.close()))]);}
