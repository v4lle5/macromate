// Build input only; runtime imports the adjacent pinned self-contained bundle.
// Explicit EAN readers avoid ZXing's automatic EAN-13 → UPC-A zero stripping.
import EAN13Reader from '@zxing/library/esm/core/oned/EAN13Reader.js';
import EAN8Reader from '@zxing/library/esm/core/oned/EAN8Reader.js';
import RGBLuminanceSource from '@zxing/library/esm/core/RGBLuminanceSource.js';
import BinaryBitmap from '@zxing/library/esm/core/BinaryBitmap.js';
import HybridBinarizer from '@zxing/library/esm/core/common/HybridBinarizer.js';
import DecodeHintType from '@zxing/library/esm/core/DecodeHintType.js';
const hints=new Map([[DecodeHintType.TRY_HARDER,true]]);
export function decodePixels(rgba,width,height){
 const gray=new Uint8ClampedArray(width*height);
 for(let i=0;i<gray.length;i++)gray[i]=(rgba[i*4]+2*rgba[i*4+1]+rgba[i*4+2])/4;
 const bitmap=new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(gray,width,height)));
 for(const reader of [new EAN13Reader(),new EAN8Reader()]){try{return reader.decode(bitmap,hints).getText();}catch{/* Try next supported EAN format. */}}
 return null;
}
