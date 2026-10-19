// Generated from tests/frontend/macromate-loader.js. Manual resource URLs remain supported.
const revision='435833810c45c600768a38aa0800315e166ccad7cd16eb2f3c38f974f603b959';
const key=Symbol.for('macromate.delivery');
function diagnostic(code){
 const detail={code,revision};window.dispatchEvent(new CustomEvent('macromate-delivery-error',{detail}));
 const id='macromate-delivery-status';let node=document.getElementById(id);
 if(!node){node=document.createElement('aside');node.id=id;node.setAttribute('role','alert');node.style.cssText='position:fixed;bottom:0;left:0;right:0;padding:16px;background:#fff4dc;color:#443700;z-index:2147483647;font:14px system-ui';document.body.append(node);}
 node.textContent=`MacroMate ${revision.slice(0,12)} · ${code}. ${code==='registration_conflict'?'An older MacroMate frontend is already active.':'The complete MacroMate frontend could not be loaded.'} Reload this page to finish the update. If this remains, check the dashboard resource URL. No dashboard records were modified by this loader.`;
}
const previous=window[key];
if(previous&&previous.revision!==revision){diagnostic('registration_conflict');}
else if(!previous){
 const existing=customElements.get('macromate-card');
 // Loading a second graph cannot replace browser custom-element definitions.
 // Refuse before executing ANY dependency of a conflicting build.
 if(existing&&existing.buildRevision!==revision){diagnostic('registration_conflict');}
 else {
  const state=window[key]={revision};
  state.ready=existing?Promise.resolve():import('./card-runtime.js').then(module=>{module.MacroMateCard.buildRevision=revision;});
  state.ready.catch(()=>diagnostic('asset_load_failed'));
  await state.ready;
 }
}else await previous.ready;
