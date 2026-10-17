export const MEALS={breakfast:'Frühstück',lunch:'Mittagessen',dinner:'Abendessen',snack:'Snacks'};
export const NUTRIENTS={calories:['Energie','kcal'],protein:['Protein','g'],carbs:['Kohlenhydrate','g'],fat:['Fett','g'],fiber:['Ballaststoffe','g'],sugar:['Zucker','g'],saturated_fat:['Gesättigte Fettsäuren','g'],salt:['Salz','g'],
 monounsaturated_fat:['Einfach ungesättigte Fettsäuren','g'],polyunsaturated_fat:['Mehrfach ungesättigte Fettsäuren','g'],trans_fat:['Transfettsäuren','g'],added_sugar:['Zugesetzter Zucker','g'],alcohol:['Alkohol','ml'],water:['Wasser','ml'],cholesterol:['Cholesterin','mg'],sodium:['Natrium','mg'],
 ...Object.fromEntries(['a','b1','b2','b3','b5','b6','b7','b11','b12','c','d','e','k'].map(key=>['vitamin_'+key,['Vitamin '+key.toUpperCase(),['a','b7','b11','b12','d','k'].includes(key)?'µg':'mg']])),
 ...Object.fromEntries([['arsenic','Arsen','µg'],['boron','Bor','mg'],['biotin','Biotin','µg'],['calcium','Calcium','mg'],['choline','Cholin','mg'],['chloride','Chlorid','mg'],['chromium','Chrom','mg'],['cobalt','Kobalt','µg'],['copper','Kupfer','mg'],['fluoride','Fluorid','mg'],['fluorine','Fluor','mg'],['iodine','Jod','µg'],['iron','Eisen','mg'],['magnesium','Magnesium','mg'],['manganese','Mangan','mg'],['molybdenum','Molybdän','µg'],['phosphorus','Phosphor','mg'],['potassium','Kalium','mg'],['rubidium','Rubidium','µg'],['selenium','Selen','µg'],['silicon','Silicium','mg'],['sulfur','Schwefel','mg'],['tin','Zinn','mg'],['vanadium','Vanadium','µg'],['zinc','Zink','mg']].map(([key,label,unit])=>[key,[label,unit]]))};
export const BASE_NUTRIENTS=Object.keys(NUTRIENTS).slice(0,8);
export function el(tag,attrs={},...children){
 const node=document.createElement(tag);
 for(const [key,value] of Object.entries(attrs)){
  if(key.startsWith('on')) node.addEventListener(key.slice(2),value);
  else if(key==='class') node.className=value;
  else if(key==='text') node.textContent=value;
  else if(value!==undefined&&value!==false) node.setAttribute(key,value===true?'':String(value));
 }
 for(const child of children.flat(Infinity)) if(child!==null&&child!==undefined) node.append(child instanceof Node?child:document.createTextNode(String(child)));
 return node;
}
export const button=(text,onclick,attrs={})=>el('button',{type:'button',onclick,...attrs},text);
export function field(label,attrs={}){return el('label',{},el('span',{},label),el('input',attrs));}
export function display(value,unit=''){return typeof value==='number'&&Number.isFinite(value)?`${new Intl.NumberFormat('de-DE',{maximumFractionDigits:1}).format(value)} ${unit}`.trim():'Unbekannt';}
export function nutrients(values={}){return el('dl',{class:'nutrients'},...[...new Set([...BASE_NUTRIENTS,...Object.keys(values)])].map(key=>{const [label,unit]=NUTRIENTS[key]||[key,''];return [el('dt',{},label),el('dd',{},display(values[key],unit))];}));}
export function shiftDate(date,offset){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
