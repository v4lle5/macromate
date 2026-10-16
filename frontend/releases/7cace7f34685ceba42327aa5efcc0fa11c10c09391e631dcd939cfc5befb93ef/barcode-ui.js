import {el,button,field} from './dom.js';
import {openDialog} from './entry-ui.js';
import {validGTIN} from './barcode.js';
import {CameraScanner,decodeSource} from './scanner.js';
export class BarcodeUI {
 constructor(panel){this.panel=panel;}
 render(){
  this.input=field('Barcode / EAN',{type:'text',inputmode:'numeric',autocomplete:'off',maxlength:14});
  return el('div',{class:'card'},el('h2',{},'Barcode'),el('form',{onsubmit:event=>{event.preventDefault();this.lookup(this.input.querySelector('input').value);}},el('div',{class:'toolbar'},this.input,el('button',{type:'submit'},'Barcode suchen'),button('EAN scannen',()=>this.openScanner()))),el('small',{},'EAN-8 / EAN-13 / UPC-A / GTIN-14 mit gültiger Prüfziffer. Führende Nullen bleiben erhalten. Online-Schalter der Lebensmittelsuche gilt auch hier.'));
 }
 async lookup(barcode){
  if(!validGTIN(barcode)){this.panel.message.replaceChildren(el('p',{role:'alert'},'Barcode ungültig: 8, 12, 13 oder 14 ASCII-Ziffern mit gültiger Prüfziffer eingeben.'));return;}
  this.input.querySelector('input').value=barcode;
  const browser=this.panel.foodBrowser;const context=browser.readContext();
  try{const result=await this.panel.client.read('barcode',{barcode,online:browser.online.querySelector('input').checked});if(browser.current(context)){this.panel.message.replaceChildren();browser.showResults(result);}}catch(error){if(browser.current(context))this.panel.showError(error);}
 }
 openScanner(){
  let dialog;let imageGeneration=0;
  const video=el('video',{muted:true,playsinline:true,'aria-label':'Kameravorschau'});video.muted=true;
  const status=el('p',{role:'status','aria-live':'polite'},'Barcode ruhig und quer in die Kamera halten. Die Erkennung erfolgt lokal, Bilder werden nicht übertragen.');
  const finish=value=>{if(!dialog.open||!this.panel.isConnected)return;this.stop();dialog.close();this.lookup(value);};
  this.scanner=new CameraScanner(video,{onResult:finish,onError:text=>status.textContent=text});
  const image=field('Barcode-Bild auswählen',{type:'file',accept:'image/*'});
  image.addEventListener('change',async event=>{
   this.scanner.stop();const generation=++imageGeneration;const file=event.target.files?.[0];if(!file)return;
   if(file.size>20*1024*1024){status.textContent='Bild ist zu groß (maximal 20 MB).';return;}
   status.textContent='Bild wird lokal gelesen …';const url=URL.createObjectURL(file);
   try{const source=new Image();source.src=url;await source.decode();const value=await decodeSource(source);if(generation!==imageGeneration||!dialog.open)return;if(value)finish(value);else status.textContent='Kein gültiger Barcode erkannt. Schärferes Bild wählen oder Kamera erneut starten.';}
   catch{if(generation===imageGeneration&&dialog.open)status.textContent='Bild konnte nicht gelesen werden. Anderes Bild auswählen.';}
   finally{URL.revokeObjectURL(url);}
  });
  const hidden=()=>{if(document.hidden){this.scanner.stop();status.textContent='Kamera pausiert. Zum Fortsetzen Kamera starten.';}};
  const cleanup=()=>{imageGeneration++;this.scanner.stop();document.removeEventListener('visibilitychange',hidden);};
  this.stop=cleanup;
  dialog=openDialog(this.panel,'EAN scannen',[status,video,el('div',{class:'actions'},button('Kamera starten',()=>{imageGeneration++;status.textContent='Kamera wird gestartet …';this.scanner.start();}),button('Abbrechen',()=>{cleanup();dialog.close();})),image]);
  dialog.addEventListener('cancel',cleanup);dialog.addEventListener('close',cleanup,{once:true});document.addEventListener('visibilitychange',hidden);
 }
 stop(){this.scanner?.stop();}
}
