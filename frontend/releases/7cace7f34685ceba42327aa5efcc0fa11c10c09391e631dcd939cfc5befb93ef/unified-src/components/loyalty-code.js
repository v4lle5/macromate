import {LitElement,html,svg,css} from 'lit';
import JsBarcode from 'jsbarcode';
import qrcode from 'qrcode-generator';
export class LoyaltyCode extends LitElement {
 static properties={value:{},kind:{}};
 static styles=css`:host{display:block;max-width:100%;overflow:auto;background:white;color:black;padding:12px;border-radius:8px}svg{display:block;max-width:100%;height:auto;margin:auto}.qr{width:180px}`;
 updated(){if(this.kind!=='qrcode'){try{const target=this.shadowRoot.querySelector('svg');if(target&&/^[\x20-\x7E]{1,256}$/.test(this.value||''))JsBarcode(target,this.value,{format:'CODE128',height:65,margin:12,displayValue:true});}catch{}}}
 render(){if(this.kind!=='qrcode')return html`<svg role="img" aria-label=${'Loyalty barcode '+(this.value||'')}></svg>`;try{const qr=qrcode(0,'M');qr.addData(String(this.value||'').slice(0,2048));qr.make();const n=qr.getModuleCount();const squares=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))squares.push(svg`<rect x=${x+4} y=${y+4} width="1" height="1" fill="black"></rect>`);return html`<svg class="qr" viewBox=${`0 0 ${n+8} ${n+8}`} role="img" aria-label="Loyalty QR code"><rect width="100%" height="100%" fill="white"></rect>${squares}</svg>`;}catch{return html`<p>Code cannot be displayed. Use the printed number.</p>`;}}
}
customElements.define('mm-loyalty-code',LoyaltyCode);
