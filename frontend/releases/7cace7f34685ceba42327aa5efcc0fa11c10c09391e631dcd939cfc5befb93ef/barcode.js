// GTIN policy: exact ASCII tokens only; no trimming, padding or numeric coercion.
export function validGTIN(token){
 if(typeof token!=='string'||! /^(?:[0-9]{8}|[0-9]{12}|[0-9]{13}|[0-9]{14})$/.test(token))return false;
 let sum=0;for(let i=token.length-2,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=Number(token[i])*weight;
 return (10-sum%10)%10===Number(token.at(-1));
}
