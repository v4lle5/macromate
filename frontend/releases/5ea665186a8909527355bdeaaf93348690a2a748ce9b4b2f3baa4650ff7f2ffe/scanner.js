import {validGTIN} from './barcode.js';
let fallback;
async function nativeDetector(){
 if(!globalThis.BarcodeDetector)return null;
 try{const formats=(await BarcodeDetector.getSupportedFormats()).filter(format=>['ean_13','ean_8'].includes(format));return formats.length?new BarcodeDetector({formats}):null;}catch{return null;}
}
export async function decodeSource(source){
 const detector=await nativeDetector();
 if(detector){try{const hits=await detector.detect(source);const hit=hits.find(hit=>validGTIN(hit.rawValue));if(hit)return hit.rawValue;}catch{/* Native implementations can reject supported-looking sources. Use local JS. */}}
 const width=source.videoWidth||source.naturalWidth||source.width;const height=source.videoHeight||source.naturalHeight||source.height;
 if(!width||!height)return null;
 const canvas=document.createElement('canvas');const scale=Math.min(1,1280/width);
 canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0,canvas.width,canvas.height);
 fallback??=import('./vendor/zxing-0.21.3.js');
 const {decodePixels}=await fallback;
 const value=decodePixels(context.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
 return validGTIN(value)?value:null;
}
export function cameraError(error){
 return ({NotAllowedError:'Kamera-Berechtigung fehlt. Im Browser erlauben oder Barcode-Bild auswählen.',NotFoundError:'Keine Kamera gefunden. Barcode-Bild auswählen.',NotReadableError:'Kamera ist belegt oder nicht lesbar. Andere Kamera-App schließen.',OverconstrainedError:'Kamera unterstützt die angefragte Aufnahme nicht.'})[error?.name]||'Kamera oder Decoder nicht verfügbar. Barcode-Bild oder manuelle Eingabe verwenden.';
}
export class CameraScanner {
 constructor(video,{onResult,onError},platform={secure:globalThis.isSecureContext,media:globalThis.navigator?.mediaDevices}){this.video=video;this.onResult=onResult;this.onError=onError;this.platform=platform;this.generation=0;this.stream=null;}
 stop(){this.generation++;clearTimeout(this.timer);this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;this.video.srcObject=null;}
 async start(){
  this.stop();const generation=this.generation;
  if(!this.platform.secure){this.onError('Kamera benötigt HTTPS oder localhost. Barcode-Bild auswählen ist weiterhin möglich.');return;}
  if(!this.platform.media?.getUserMedia){this.onError('Dieser Browser bietet keinen Kamerazugriff. Barcode-Bild auswählen.');return;}
  try{
   const stream=await this.platform.media.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
   if(generation!==this.generation){stream.getTracks().forEach(track=>track.stop());return;}
   this.stream=stream;this.video.srcObject=stream;await this.video.play();
   if(generation!==this.generation)return;
   this.tick(generation);
  }catch(error){if(generation===this.generation){this.stop();this.onError(cameraError(error));}}
 }
 async tick(generation){
  if(generation!==this.generation)return;
  try{
   const result=await decodeSource(this.video);
   if(generation!==this.generation)return;
   if(result){this.stop();this.onResult(result);return;}
   this.timer=setTimeout(()=>this.tick(generation),220);
  }catch(error){if(generation===this.generation){this.stop();this.onError(cameraError(error));}}
 }
}
