const element=(tag,attributes={},...children)=>{
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));
  for(const child of children.flat())if(child!=null)node.append(child instanceof Node?child:document.createTextNode(String(child)));
  return node;
};

const known=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const formatter=new Intl.NumberFormat('de-DE',{maximumFractionDigits:1});
const format=value=>known(value)?formatter.format(value):'Unbekannt';
const amount=(value,unit)=>known(value)?`${format(value)} ${unit}`:'Unbekannt';
const meals={breakfast:'Frühstück',lunch:'Mittagessen',dinner:'Abendessen',snack:'Snacks'};

export class MacroMateCard extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this.generation=0;
    this.stylesheet=element('link',{rel:'stylesheet',href:new URL('./macromate-card.css',import.meta.url).href});
  }
  setConfig(config){
    if(!config||typeof config!=='object'||Array.isArray(config)||(config.title!==undefined&&typeof config.title!=='string')){
      throw new Error('Ungültige Kartenkonfiguration: title muss Text sein.');
    }
    this.config={title:config.title};if(this.isConnected)this.render();
  }
  set hass(hass){
    const context={connection:hass?.connection,userId:hass?.user?.id,admin:hass?.user?.is_admin};
    const changed=this.context?.connection!==context.connection||this.context?.userId!==context.userId||this.context?.admin!==context.admin;
    this.context=context;this._hass=hass;
    if(changed){this.invalidate();if(this.isConnected){this.render();this.startLive();this.loadDiary();}}
  }
  get hass(){return this._hass;}
  get authorized(){return this._hass?.user?.is_admin===true;}
  connectedCallback(){this.render();this.startLive();this.loadDiary();}
  disconnectedCallback(){this.invalidate();}
  invalidate(){
    this.generation++;this.data=null;this.busy=false;this.error=false;this.queued=false;
    clearInterval(this.liveTimer);clearTimeout(this.refreshTimer);this.liveTimer=null;this.refreshTimer=null;
    const unsubscribe=this.unsubscribe;this.unsubscribe=null;this.releaseSubscription(unsubscribe);
  }
  releaseSubscription(unsubscribe){
    if(typeof unsubscribe!=='function')return;
    try{Promise.resolve(unsubscribe()).catch(()=>{});}catch{}
  }
  startLive(){
    if(!this.isConnected||!this.authorized)return;
    const generation=this.generation;
    this.liveTimer=setInterval(()=>this.queueRefresh(),60000);
    const connection=this._hass.connection;
    if(connection?.subscribeEvents)Promise.resolve().then(()=>{
      if(generation!==this.generation||!this.isConnected||!this.authorized)return null;
      return connection.subscribeEvents(()=>{
        if(generation===this.generation)this.queueRefresh();
      },'macromate_updated');
    }).then(unsubscribe=>{
      if(!unsubscribe)return;
      if(generation!==this.generation||!this.isConnected||!this.authorized)this.releaseSubscription(unsubscribe);
      else this.unsubscribe=unsubscribe;
    }).catch(()=>{});
  }
  queueRefresh(){
    if(!this.isConnected||!this.authorized)return;
    this.queued=true;this.drainRefresh();
  }
  drainRefresh(){
    if(!this.queued||this.busy||this.refreshTimer||!this.isConnected||!this.authorized)return;
    this.refreshTimer=setTimeout(()=>{
      this.refreshTimer=null;
      if(this.busy)return;
      this.queued=false;this.loadDiary();
    },150);
  }
  getCardSize(){
    const height=this.shadowRoot.querySelector('ha-card')?.getBoundingClientRect().height;
    return height?Math.ceil(height/50):15;
  }
  getGridOptions(){return {columns:12,min_columns:12};}
  static getStubConfig(){return {type:'custom:macromate-card'};}
  isCurrent(generation,context){
    return generation===this.generation&&this.isConnected&&this.authorized&&context?.userId===this._hass.user?.id&&context?.connection===this._hass.connection;
  }
  async loadDiary(){
    if(!this.isConnected||!this.authorized||this.busy)return;
    const generation=this.generation;
    const context=this.context;
    this.busy=true;this.error=false;this.render();
    try{
      const data=await this._hass.callWS({type:'macromate/command',action:'diary',payload:{}});
      if(!this.isCurrent(generation,context))return;
      this.data=data;
    }catch{
      if(!this.isCurrent(generation,context))return;
      this.data=null;this.error=true;
    }finally{
      if(this.isCurrent(generation,context)){this.busy=false;this.render();this.drainRefresh();}
    }
  }
  renderEnergy(){
    const value=this.data.totals?.calories;
    const target=this.data.recommendation?.calorie_target;
    const incomplete=this.data.nutrition_missing?.includes('calories')===true;
    const goalKnown=known(target)&&target>0;
    const exact=known(value)&&!incomplete&&goalKnown;
    const remaining=exact?target-value:null;
    const over=exact&&remaining<0;
    const label=over?'Über dem Ziel':'Übrig';
    const percent=exact?Math.min(100,value/target*100):null;
    const state=incomplete?'Unvollständig':!known(value)?'Unbekannt':'Ziel unbekannt';
    const ring=element('div',{
      class:`calorie-ring${exact?'':' unknown'}${over?' over-budget':''}`,
      role:'img','aria-label':exact?`${amount(Math.abs(remaining),'kcal')} ${label}`:`Kalorien: ${state}`,
      ...(exact?{'data-progress':percent,style:`--progress:${percent}%`}:{})
    },element('div',{class:'ring-center'},
      element('span',{class:'ring-label'},exact?label:'Kalorien'),
      element('strong',{class:exact?'remaining':'ring-state'},exact?format(Math.abs(remaining)):state),
      element('span',{class:'ring-unit'},exact?'kcal':incomplete?'Werte fehlen':!this.data.recommendation?'Profil einrichten':'Keine sichere Bilanz')
    ));
    const consumed=known(value)?`${amount(value,'kcal')}${incomplete?' bekannt':''}`:'Unbekannt';
    return element('section',{class:'energy','aria-label':'Kalorien'},ring,
      element('div',{class:'energy-detail'},
        element('div',{},element('span',{},'Gegessen'),element('strong',{},consumed)),
        element('span',{class:'detail-divider','aria-hidden':'true'}),
        element('div',{},element('span',{},'Tagesziel'),element('strong',{},goalKnown?amount(target,'kcal'):'Ziel unbekannt'))));
  }
  renderMacros(){
    const section=element('section',{class:'macros','aria-label':'Makronährstoffe'});
    for(const [key,label] of [['carbs','Kohlenhydrate'],['protein','Protein'],['fat','Fett']]){
      const value=this.data.totals?.[key];
      const target=this.data.recommendation?.[key];
      const incomplete=this.data.nutrition_missing?.includes(key)===true;
      const goalKnown=known(target)&&target>0;
      const row=element('div',{class:`macro ${key}`,'data-nutrient':key},
        element('div',{class:'macro-line'},element('span',{class:'macro-label'},label),
          element('span',{class:'macro-values'},element('strong',{},incomplete?'Unvollständig':goalKnown&&known(value)?format(value):amount(value,'g')),
            incomplete?null:goalKnown?` / ${format(target)} g`:element('span',{class:'unknown-goal'},' · Ziel unbekannt'))));
      if(incomplete)row.append(element('small',{},known(value)?`${amount(value,'g')} bekannt · weitere Werte fehlen`:'Werte fehlen'));
      else if(goalKnown&&known(value))row.append(element('progress',{max:target,value:Math.min(value,target),'aria-label':label}));
      section.append(row);
    }
    return section;
  }
  renderMeals(){
    const section=element('section',{class:'meals','aria-label':'Mahlzeiten'},element('h3',{},'Mahlzeiten'));
    for(const [key,label] of Object.entries(meals)){
      const meal=this.data.meals?.[key];
      const count=Array.isArray(meal?.entries)?meal.entries.length:null;
      const incomplete=meal?.nutrition_missing?.includes('calories')===true;
      section.append(element('div',{class:'meal','data-meal':key},
        element('div',{},element('span',{class:'meal-name'},label),element('span',{class:'meal-count'},count===null?'Einträge unbekannt':`${count} ${count===1?'Eintrag':'Einträge'}`)),
        element('strong',{},incomplete?'Unvollständig':amount(meal?.totals?.calories,'kcal'))));
    }
    return section;
  }
  render(){
    const restoreFocus=this.shadowRoot.activeElement?.classList.contains('diary-link');
    const date=this.data?.today;
    const content=element('ha-card',{'data-state':this.error?'error':this.data?'ready':'loading','aria-busy':this.busy?'true':'false'},element('header',{},element('div',{class:'brand'},element('h2',{},this.config?.title||'MacroMate'),element('span',{class:'subtitle'},'Ernährung heute')),element('time',{},date?date.split('-').reverse().join('.'):'Heute')));
    if(this.data){
      content.append(this.renderEnergy(),this.renderMacros(),this.renderMeals());
    }else if(this.error){
      const retry=element('button',{type:'button',class:'retry'},'Erneut versuchen');
      retry.addEventListener('click',()=>this.loadDiary());
      content.append(element('div',{class:'notice',role:'status','aria-live':'polite'},element('p',{},'Tagesübersicht konnte nicht geladen werden.'),retry));
    }else content.append(element('p',{class:'notice',role:'status','aria-live':'polite'},!this._hass?'Verbindung zu Home Assistant wird hergestellt …':!this.authorized?'Nur für Administratoren verfügbar.':'Tagesübersicht wird geladen …'));
    content.append(element('a',{class:'diary-link',href:'/macromate'},'Tagebuch öffnen',element('span',{'aria-hidden':'true'},'↗')));
    this.shadowRoot.replaceChildren(this.stylesheet,content);
    if(restoreFocus)content.querySelector('.diary-link').focus({preventScroll:true});
  }
}
if(!customElements.get('macromate-card'))customElements.define('macromate-card',MacroMateCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(card=>card.type==='macromate-card'))window.customCards.push({type:'macromate-card',name:'MacroMate',description:'Kalorien, Makros und Mahlzeiten des heutigen Tages',preview:true});
