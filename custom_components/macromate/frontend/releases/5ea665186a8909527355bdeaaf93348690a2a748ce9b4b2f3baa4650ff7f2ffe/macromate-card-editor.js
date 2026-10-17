// Native Lovelace visual setup. No entity IDs, credentials or YAML required.
export class MacroMateCardEditor extends HTMLElement {
 constructor(){super();this.attachShadow({mode:'open'});this.config={};this.language='en';}
 set hass(value){const language=value?.language||'en';if(this.language!==language){this.language=language;this.render();}}
 setConfig(config){this.config={...config};this.render();}
 connectedCallback(){this.render();}
 render(){
  const de=this.language==='de';
  const style=document.createElement('style');style.textContent=':host{display:block;color:var(--primary-text-color)}label{display:grid;gap:8px;margin:16px 0}select,input{font:inherit;padding:12px;border:1px solid var(--divider-color,#888);border-radius:8px;background:var(--card-background-color,#fff);color:inherit}p{line-height:1.5}';
  const help=document.createElement('p');help.textContent=de?'Für die vollständige App: Ansicht anpassen → Layout „Panel (einzelne Karte)“. MacroMate als einzige Karte hinzufügen. Die Ansichts-URL bleibt ein normaler Ansichtsname, keine JavaScript-URL.':'For the full app: edit the view → Layout “Panel (single card)”. Add MacroMate as its only card. The view URL is a normal view name, not a JavaScript URL.';
  const label=document.createElement('label');label.append(de?'Darstellung':'Display');
  const mode=document.createElement('select');
  for(const [value,text] of [['app',de?'Vollständige App':'Full application'],['summary',de?'Kompakte Übersicht (nur lesen)':'Compact summary (read-only)']]){const option=document.createElement('option');option.value=value;option.textContent=text;mode.append(option);}
  mode.value=this.config.mode||'app';mode.addEventListener('change',()=>this.change('mode',mode.value));label.append(mode);
  const titleLabel=document.createElement('label');titleLabel.append(de?'Titel (optional)':'Title (optional)');const title=document.createElement('input');title.value=this.config.title||'';title.addEventListener('change',()=>this.change('title',title.value));titleLabel.append(title);
  this.shadowRoot.replaceChildren(style,help,label,titleLabel);
 }
 change(key,value){this.config={...this.config,[key]:value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config}},bubbles:true,composed:true}));}
}
if(!customElements.get('macromate-card-editor'))customElements.define('macromate-card-editor',MacroMateCardEditor);
