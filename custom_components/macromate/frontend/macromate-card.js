import {MacroMateSummary} from './unified-src/summary.js';
import {MacroMateAPI} from './unified-src/services/adapter.js';
import {clearUI} from './unified-src/services/context-cache.js';
import './unified/app.js';

// The installed identity stays stable. Summary mode preserves the compact card.
export class MacroMateCard extends MacroMateSummary {
 constructor(){super();this.mode='app';this.application=null;this.api=null;}
 setConfig(config){if(!config||typeof config!=='object'||Array.isArray(config)||config.title!==undefined&&typeof config.title!=='string'||config.mode!==undefined&&!['summary','app'].includes(config.mode))throw new Error('Invalid MacroMate card configuration.');const changed=this.mode!==(config.mode||this.mode);this.mode=config.mode||this.mode;this.config={...config};if(changed)this.cleanup();if(this.isConnected)this.render();}
 set hass(hass){if(this.mode==='summary'){super.hass=hass;return;}const previous=this.context;const context={connection:hass?.connection,userId:hass?.user?.id,admin:hass?.user?.is_admin===true};const changed=this.context?.connection!==context.connection||this.context?.userId!==context.userId||this.context?.admin!==context.admin;this._hass=hass;this.context=context;if(changed){if(previous&&(previous.userId!==context.userId||previous.admin!==context.admin))clearUI(previous.userId);this.cleanup();}if(this.isConnected)this.render();}
 get hass(){return this._hass;}
 connectedCallback(){if(this.mode==='summary')super.connectedCallback();else this.render();}
 disconnectedCallback(){this.cleanup();super.disconnectedCallback();}
 cleanup(){this.api?.dispose();this.api=null;this.application=null;this.shadowRoot.replaceChildren();super.invalidate();}
 render(){if(this.mode==='summary'){super.render();return;}if(!this.isConnected)return;if(!this._hass?.user?.id||!this._hass.connection){this.shadowRoot.textContent='Connecting to Home Assistant…';return;}if(this.application)return;
 this.api=new MacroMateAPI(this._hass);const api=this.api;const stylesheet=document.createElement('style');stylesheet.textContent=':host{display:block}mm-unified-app{height:100%;min-height:550px}.status:empty{display:none}.status{padding:12px;background:#fff4dc;color:#443700;font:14px system-ui}.status button{padding:8px;margin-left:12px}';
 const status=document.createElement('div');status.className='status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');const app=document.createElement('mm-unified-app');this.application=app;app.transport=api;app.hass=api.facade();app.setConfig(this.config);
 const state=()=>{if(this.api!==api||!api.current())return;status.replaceChildren();if(api.pending){const text=document.createElement('span');text.textContent=api.busy?'Saving…':'Write status uncertain. Do not create another request.';status.append(text);if(!api.busy){const retry=document.createElement('button');retry.textContent=this._hass.language==='de'?'Gleiche Anfrage erneut senden':'Retry same request';retry.addEventListener('click',async()=>{try{const request=api.pending;const result=await api.retry();if(this.api!==api||!api.current())return;const pane=app.shadowRoot.querySelector('mm-nutrition');if(pane?.client?.pending?.payload?.request_id===request.payload.request_id){pane.client.pending=null;pane.dialog?.close();pane.message.textContent='Saved.';await pane.loadDiary(pane.date);}if(request.action==='recipes_add')app._view='grid';await app._init();}catch{}state();});status.append(retry);}}};api.addEventListener('state',state);
 this.shadowRoot.replaceChildren(stylesheet,status,app);api.call('describe').then(()=>{if(this.api===api&&api.current())app.requestUpdate();}).catch(()=>{});
 }
 getCardSize(){return this.mode==='summary'?super.getCardSize():16;}
 getGridOptions(){return this.mode==='summary'?super.getGridOptions():{columns:12,min_columns:6};}
 static getStubConfig(){return {type:'custom:macromate-card'};}
}
if(!customElements.get('macromate-card'))customElements.define('macromate-card',MacroMateCard);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='macromate-card'))window.customCards.push({type:'macromate-card',name:'MacroMate',description:'Recipes, planning, timers, shopping and nutrition in one application',preview:true});
