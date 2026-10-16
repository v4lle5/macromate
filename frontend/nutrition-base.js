import {BarcodeUI} from './barcode-ui.js';
import {customFood} from './custom-food-ui.js';
import {quickEntry,editFoodEntry,copyEntry,deleteEntry} from './entry-ui.js';
import {FoodBrowser} from './foods-ui.js';
import {CommandClient,publicError} from './client.js';
import {el,button,field,display,nutrients,shiftDate,MEALS,NUTRIENTS} from './dom.js';

export class MacroMateNutritionBase extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this.diarySequence=0;this.date=null;this.followToday=true;this.liveGeneration=0;}
 set hass(hass){
  const changed=this._hass&&(this._hass.connection!==hass.connection||this._hass.user?.id!==hass.user?.id||this._hass.user?.is_admin!==hass.user?.is_admin);
  this._hass=hass;if(this.client)this.client.hass=hass;else this.client=new CommandClient(hass);
  if(changed){this.foodBrowser?.invalidate();this.barcode?.stop();this.dialog?.close();}
  if(this.isConnected&&!this.initialized)this.initialize();
  else if(this.isConnected&&changed){this.stopLive();this.startLive();this.loadDiary(this.date);}
 }
 get hass(){return this._hass;}
 get authorized(){return this._hass?.user?.is_admin===true;}
 connectedCallback(){if(this._hass&&!this.initialized)this.initialize();else if(this.initialized){this.startLive();this.loadDiary(this.date);}}
 disconnectedCallback(){this.stopLive();this.diarySequence++;if(this.foodBrowser)this.foodBrowser.sequence++;this.barcode?.stop();this.dialog?.close();}
 startLive(){
  if(!this.isConnected||!this.authorized)return;
  const generation=++this.liveGeneration;
  const connection=this.hass.connection;
  // Also bounds missed events / HA-local day changes to one minute.
  this.liveTimer=setInterval(()=>this.queueRefresh(),60000);
  if(connection?.subscribeEvents)Promise.resolve().then(()=>connection.subscribeEvents(()=>{
   if(generation===this.liveGeneration)this.queueRefresh();
  },'macromate_updated')).then(unsubscribe=>{
   if(generation!==this.liveGeneration||!this.isConnected)unsubscribe();else this.unsubscribeLive=unsubscribe;
  }).catch(()=>{});
 }
 stopLive(){this.liveGeneration++;this.unsubscribeLive?.();this.unsubscribeLive=null;clearInterval(this.liveTimer);this.liveTimer=null;clearTimeout(this.refreshTimer);this.refreshTimer=null;this.refreshQueued=false;}
 queueRefresh(){
  if(!this.isConnected||!this.authorized)return;
  this.refreshQueued=true;this.drainRefresh();
 }
 drainRefresh(){
  if(!this.refreshQueued||this.refreshTimer||this.diaryBusy||this.client?.busy||this.client?.pending||this.dialog?.open||!this.isConnected||!this.authorized)return;
  this.refreshTimer=setTimeout(()=>{this.refreshTimer=null;if(this.diaryBusy||this.client?.busy||this.client?.pending||this.dialog?.open)return;this.refreshQueued=false;this.loadDiary(this.followToday?undefined:this.date,true);},150);
 }
 initialize(){
  this.initialized=true;
  const stylesheet=el('link',{rel:'stylesheet',href:new URL('./panel.css',import.meta.url).href});
  this.message=el('div',{role:'status','aria-live':'polite',class:'message'});
  this.diaryNode=el('section',{'aria-label':'Tagebuch'});
  this.workspace=el('section',{'aria-label':'Lebensmittel und Einträge'});
  this.shadowRoot.replaceChildren(stylesheet,el('main',{},el('header',{class:'brand'},el('img',{src:new URL('./brand-icon.png',import.meta.url).href,alt:'',width:64,height:64}),el('div',{},el('h1',{},'MacroMate'),el('p',{class:'eyebrow'},'TRACK · EAT · PROGRESS'))),this.message,this.diaryNode,this.workspace));
  this.foodBrowser=new FoodBrowser(this);
  this.barcode=new BarcodeUI(this);
  this.workspace.append(el('div',{class:'toolbar'},button('Eigenes Lebensmittel',()=>customFood(this),{'data-write':true})),this.foodBrowser.render(),this.barcode.render());
  this.startLive();this.loadDiary();
 }
 async write(action,payload,refresh=true){
  try{
   const promise=this.client.write(action,payload);
   this.syncControls();
   const result=await promise;this.message.replaceChildren(el('p',{},'Gespeichert.'));
   if(refresh)await this.loadDiary(this.date);
   return result;
  }catch(error){this.showError(error);return null;}
  finally{this.syncControls();this.drainRefresh();}
 }
 syncControls(){this.shadowRoot.querySelectorAll('[data-write]').forEach(b=>b.disabled=!!this.client.pending||!!this.diaryBusy||!this.data);}
 showError(error){
  for(const target of [this.message,this.dialog?.querySelector('.dialog-status')].filter(Boolean)){
   target.replaceChildren(el('p',{role:'alert'},publicError(error)));
   if(this.client.pending)target.append(button('Gleiche Anfrage erneut senden',()=>this.retryWrite(),{'data-retry':true}));
  }
 }
 async retryWrite(){
  this.shadowRoot.querySelectorAll('[data-retry]').forEach(b=>b.disabled=true);
  try{const result=await this.client.retry();this.message.replaceChildren(el('p',{},'Gespeichert.'));if(result?.food)this.foodBrowser.showFood(result.food);this.dialog?.close();await this.loadDiary(this.date);}
  catch(e){this.showError(e);}
  finally{this.syncControls();this.drainRefresh();}
 }
 async loadDiary(date,background=false){
  if(!background)this.followToday=!date||date===this.today;
  if(!this.isConnected)return;
  if(!this.authorized){this.diarySequence++;this.diaryBusy=false;this.data=null;this.diaryNode.replaceChildren();this.workspace.hidden=true;this.foodBrowser.invalidate();this.barcode?.stop();this.dialog?.close();this.syncControls();this.showError({code:'unauthorized'});return;}
  this.workspace.hidden=false;
  const seq=++this.diarySequence;this.diaryBusy=true;this.syncControls();
  this.diaryNode.setAttribute('aria-busy','true');
  try{
   const data=await this.client.read('diary',date?{date}:{});
   if(seq!==this.diarySequence||!this.isConnected)return;
   this.date=data.date;this.today=data.today;this.data=data;this.renderDiary();
  }catch(error){if(seq===this.diarySequence){if(this.data)this.renderDiary();this.showError(error);}}
  finally{if(seq===this.diarySequence){this.diaryBusy=false;this.diaryNode.removeAttribute('aria-busy');this.syncControls();this.drainRefresh();}}
 }
 renderDiary(){
  const data=this.data;
  const date=field('Tag',{type:'date',value:this.date,required:true,'aria-label':'Tagebuchdatum',onchange:event=>{if(event.target.value)this.loadDiary(event.target.value);}});
  const navigation=el('nav',{class:'date-nav','aria-label':'Datum'},button('‹',()=>this.loadDiary(shiftDate(this.date,-1)),{'aria-label':'Vorheriger Tag'}),date,button('›',()=>this.loadDiary(shiftDate(this.date,1)),{'aria-label':'Nächster Tag'}),button('Heute',()=>this.loadDiary(this.today)));
  const recommendation=data.recommendation;
  const progress=el('div',{class:'progress-grid'});
  for(const key of ['calories','protein','carbs','fat']){
   const [label,unit]=NUTRIENTS[key];const target=recommendation?.[key==='calories'?'calorie_target':key];const value=data.totals?.[key];
   const incomplete=data.nutrition_missing?.includes(key);
   const tile=el('div',{class:`metric ${key}${incomplete?' incomplete':''}`},el('span',{},label),el('strong',{},incomplete?'Unvollständig':display(value,unit)),...(incomplete?[el('small',{},`${display(value,unit)} bekannt · weitere Werte unbekannt`)]:[]),el('small',{},target!=null?`von ${display(target,unit)}`:'Ziel unbekannt'));
   if(!incomplete&&typeof target==='number'&&target>0&&typeof value==='number')tile.append(el('progress',{max:target,value:Math.min(value,target),'aria-label':label}));
   progress.append(tile);
  }
  const meals=el('div',{class:'meals'});
  for(const [key,label] of Object.entries(MEALS)){
   const entries=data.meals?.[key]?.entries||data.entries.filter(e=>e.meal_type===key);
   const section=el('article',{class:'card'},el('h3',{},label));
   if(!entries.length)section.append(el('p',{class:'muted'},'Noch keine Einträge'));
   entries.forEach(entry=>section.append(el('div',{class:'entry'},el('strong',{},entry.name),el('p',{},display(entry.calories,'kcal')),el('details',{},el('summary',{},'Nährwerte'),nutrients(entry.nutrients||Object.fromEntries(Object.keys(NUTRIENTS).map(k=>[k,entry[k]])))),el('div',{class:'actions'},button('Bearbeiten',()=>entry.food_id?editFoodEntry(this,entry):quickEntry(this,entry),{'aria-label':`${entry.name} bearbeiten`,'data-write':true}),button('Kopieren',()=>copyEntry(this,entry),{'aria-label':`${entry.name} kopieren`,'data-write':true}),button('Löschen',()=>deleteEntry(this,entry),{'aria-label':`${entry.name} löschen`,class:'danger','data-write':true})))));
   meals.append(section);
  }
  this.diaryNode.replaceChildren(navigation,el('div',{class:'toolbar diary-toolbar'},el('h2',{},'Dein Tagebuch'),button('Schnelleintrag',()=>quickEntry(this),{'data-write':true})),progress,...(!recommendation?[el('p',{class:'muted'},'Kein gespeichertes Tagesziel')]:[]),el('details',{},el('summary',{},'Alle Tagesnährwerte'),nutrients({...data.totals,...Object.fromEntries((data.nutrition_missing||[]).map(key=>[key,null]))})),meals);
  this.diaryNode.dataset.testid='diary';
 }
}
