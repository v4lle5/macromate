import {el,button,field,NUTRIENTS} from './dom.js';
import {selectField,positive} from './foods-ui.js';
import {openDialog,numericFields,readNumbers} from './entry-ui.js';
export function customFood(panel){
 const name=field('Name',{name:'name',required:true,maxlength:200});
 const producer=field('Hersteller',{name:'producer',maxlength:200});
 const unit=selectField('Basiseinheit','base_unit',[['g','g'],['ml','ml']],'g');
 const servingLabel=field('Portionsname',{name:'serving_label',maxlength:100});
 const servingAmount=field('Portionsgröße (g oder ml)',{name:'serving_amount',type:'number',min:'0.001',step:'any'});
 const keys=Object.keys(NUTRIENTS);
 let dialog;
 const form=el('form',{onsubmit:async event=>{event.preventDefault();try{
  const label=form.elements.serving_label.value;const size=form.elements.serving_amount;
  if((label&&!size.value)||(!label&&size.value))throw {code:'invalid_request'};
  const food={name:form.elements.name.value,...(form.elements.producer.value.trim()?{producer:form.elements.producer.value.trim()}:{}),base_unit:form.elements.base_unit.value,nutrients_per_100:readNumbers(form,keys),servings:label?[{serving_id:crypto.randomUUID(),label,amount:positive(size)}]:[],barcodes:[]};
  const result=await panel.write('save_food',{food},false);
  if(result){panel.foodBrowser.showFood(result.food);dialog.close();}
 }catch(e){panel.showError(e);}}},name,producer,unit,el('p',{},'Nährwerte pro 100 g bzw. 100 ml. Nicht angegebene Nährwerte leer lassen, nicht als 0 eintragen.'),el('div',{class:'form-grid'},numericFields(keys.slice(0,8))),el('details',{},el('summary',{},'Weitere Nährstoffe'),el('div',{class:'form-grid'},numericFields(keys.slice(8)))),el('fieldset',{},el('legend',{},'Optionale Portion'),servingLabel,servingAmount),el('div',{class:'actions'},el('button',{type:'submit',class:'primary','data-write':true},'Speichern'),button('Abbrechen',()=>dialog.close())));
 dialog=openDialog(panel,'Eigenes Lebensmittel',[form]);
}
